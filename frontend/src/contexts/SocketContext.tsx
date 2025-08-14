import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { SOCKET_URL } from '../config/api.config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  notifications: Notification[];
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  sendProjectUpdate: (projectId: string, data: any) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping WebSocket connection');
      return;
    }

    console.log('Connecting to WebSocket at:', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to real-time updates');
      // Request current online users list
      newSocket.emit('get:online-users');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from real-time updates');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to real-time updates');
    });

    // Handle notifications
    newSocket.on('notification', (notification: Omit<Notification, 'id' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        timestamp: new Date(notification.timestamp),
      };
      setNotifications(prev => [newNotification, ...prev]);
      toast(notification.message, {
        icon: '🔔',
        duration: 4000,
      });
    });

    // Handle project updates
    newSocket.on('project:updated', (data) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'project_update',
        message: `Project updated by ${data.updatedBy}`,
        data,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
    });

    // Handle user status updates
    newSocket.on('user:online', (userId: string) => {
      setOnlineUsers(prev => Array.from(new Set([...prev, userId])));
    });

    newSocket.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    // Handle online users list
    newSocket.on('users:online', (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []); // Re-run when token changes (after login/logout)

  const joinProject = useCallback((projectId: string) => {
    if (socket) {
      socket.emit('join:project', projectId);
    }
  }, [socket]);

  const leaveProject = useCallback((projectId: string) => {
    if (socket) {
      socket.emit('leave:project', projectId);
    }
  }, [socket]);

  const sendProjectUpdate = useCallback((projectId: string, data: any) => {
    if (socket) {
      socket.emit('project:update', { projectId, ...data });
    }
  }, [socket]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        notifications,
        joinProject,
        leaveProject,
        sendProjectUpdate,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};