const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { cache, logger } = require('../config/redis');

class SocketService {
  constructor() {
    this.io = null;
    this.users = new Map(); // Map of userId to socket IDs
  }

  initialize(server, corsOptions) {
    this.io = socketIO(server, {
      cors: corsOptions,
      transports: ['websocket', 'polling']
    });

    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        
        // Store user session in Redis
        await cache.set(`socket:${socket.id}`, {
          userId: decoded.id,
          role: decoded.role,
          connectedAt: new Date().toISOString()
        }, 86400); // 24 hours TTL

        next();
      } catch (err) {
        logger.error('Socket authentication error:', err);
        next(new Error('Authentication error'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket) => {
      logger.info(`User ${socket.userId} connected via socket ${socket.id}`);
      
      // Add user to connected users map
      if (!this.users.has(socket.userId)) {
        this.users.set(socket.userId, new Set());
      }
      this.users.get(socket.userId).add(socket.id);

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);
      
      // Join role-based room
      socket.join(`role:${socket.userRole}`);

      // Broadcast online users to all connected clients
      this.io.emit('users:online', this.getOnlineUsers());
      
      // Notify others about new online user
      socket.broadcast.emit('user:online', socket.userId);

      // Handle request for online users
      socket.on('get:online-users', () => {
        socket.emit('users:online', this.getOnlineUsers());
      });

      // Handle joining project rooms
      socket.on('join:project', async (projectId) => {
        try {
          // Verify user has access to this project
          const hasAccess = await this.verifyProjectAccess(socket.userId, projectId);
          if (hasAccess) {
            socket.join(`project:${projectId}`);
            socket.emit('joined:project', { projectId, success: true });
            
            // Notify others in the project
            socket.to(`project:${projectId}`).emit('user:joined', {
              userId: socket.userId,
              projectId
            });
          } else {
            socket.emit('error', { message: 'Access denied to project' });
          }
        } catch (error) {
          logger.error('Error joining project room:', error);
          socket.emit('error', { message: 'Failed to join project' });
        }
      });

      // Handle leaving project rooms
      socket.on('leave:project', (projectId) => {
        socket.leave(`project:${projectId}`);
        socket.to(`project:${projectId}`).emit('user:left', {
          userId: socket.userId,
          projectId
        });
      });

      // Handle real-time collaboration events
      socket.on('project:update', async (data) => {
        try {
          // Broadcast to all users in the project
          socket.to(`project:${data.projectId}`).emit('project:updated', {
            ...data,
            updatedBy: socket.userId,
            timestamp: new Date().toISOString()
          });

          // Cache the update for offline users
          await this.cacheNotification(data.projectId, {
            type: 'project:updated',
            data,
            updatedBy: socket.userId
          });
        } catch (error) {
          logger.error('Error broadcasting project update:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        socket.to(`project:${data.projectId}`).emit('user:typing', {
          userId: socket.userId,
          projectId: data.projectId,
          field: data.field
        });
      });

      socket.on('typing:stop', (data) => {
        socket.to(`project:${data.projectId}`).emit('user:stopped:typing', {
          userId: socket.userId,
          projectId: data.projectId,
          field: data.field
        });
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        logger.info(`User ${socket.userId} disconnected`);
        
        // Remove from users map
        const userSockets = this.users.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.users.delete(socket.userId);
          }
        }

        // Clean up Redis session
        await cache.del(`socket:${socket.id}`);

        // Notify others about disconnection
        this.io.emit('user:offline', { userId: socket.userId });
        
        // Broadcast updated online users list
        this.io.emit('users:online', this.getOnlineUsers());
      });
    });
  }

  // Verify user has access to a project
  async verifyProjectAccess(userId, projectId) {
    // Check cache first
    const cacheKey = `access:${userId}:${projectId}`;
    const cached = await cache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // In real implementation, check database
    // For now, return true for demonstration
    const hasAccess = true;
    
    // Cache the result
    await cache.set(cacheKey, hasAccess, 300); // 5 minutes TTL
    return hasAccess;
  }

  // Cache notification for offline users
  async cacheNotification(projectId, notification) {
    const key = `notifications:${projectId}`;
    const existing = await cache.get(key) || [];
    existing.push({
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 notifications
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    await cache.set(key, existing, 86400); // 24 hours TTL
  }

  // Send notification to specific user
  notifyUser(userId, event, data) {
    const userSockets = this.users.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  // Send notification to all users in a project
  notifyProject(projectId, event, data) {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  // Send notification to all users with a specific role
  notifyRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.users.size;
  }

  // Get online users list
  getOnlineUsers() {
    return Array.from(this.users.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.users.has(userId);
  }
}

module.exports = new SocketService();