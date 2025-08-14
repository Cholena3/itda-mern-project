const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Import security middleware
const {
  rateLimiters,
  preventSQLInjection,
  preventNoSQLInjection,
  preventXSS,
  securityHeaders,
  mongoSanitize,
  auditLog,
  corsOptions,
  securityLogger
} = require('./middleware/security');

// Import cache and socket services
const { cache, redis } = require('./config/redis');
const socketService = require('./services/socketService');
const { cacheStrategies } = require('./middleware/cache');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
socketService.initialize(server, corsOptions);

// Security middleware - Order matters!
app.use(securityHeaders); // Add security headers first
app.use(cors(corsOptions)); // CORS with whitelist
app.use(compression()); // Compress responses
app.use(morgan('combined')); // HTTP request logging
app.use(express.json({ limit: '10mb' })); // JSON body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(preventXSS); // XSS prevention
app.use(preventSQLInjection); // SQL injection prevention
app.use(preventNoSQLInjection); // NoSQL injection prevention

// Apply rate limiting to all routes
app.use('/api/', rateLimiters.general);
app.use('/api/auth', rateLimiters.auth);

// Static files with security
app.use('/uploads', 
  rateLimiters.strict,
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
    maxAge: '7d'
  })
);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ITDA API Documentation',
}));

// Health check endpoint with caching
app.get('/health', cacheStrategies.custom(10), async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';
  const onlineUsers = socketService.getOnlineUsersCount();
  
  res.json({ 
    status: 'ok', 
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
      websocket: 'active'
    },
    metrics: {
      onlineUsers,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    timestamp: new Date().toISOString()
  });
});

// System metrics endpoint (protected)
app.get('/api/metrics', 
  rateLimiters.strict,
  auditLog('VIEW_METRICS'),
  async (req, res) => {
    try {
      const metrics = {
        cache: {
          hits: await cache.get('stats:cache:hits') || 0,
          misses: await cache.get('stats:cache:misses') || 0
        },
        users: {
          online: socketService.getOnlineUsersCount(),
          list: socketService.getOnlineUsers()
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        }
      };
      res.json(metrics);
    } catch (error) {
      securityLogger.error('Metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// MongoDB connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,  // Reduced from 30s to 10s
        socketTimeoutMS: 30000,  // Reduced from 45s to 30s
        maxPoolSize: 10,
        minPoolSize: 2
      });
      
      console.log('MongoDB connected successfully');
      console.log('Database:', mongoose.connection.db.databaseName);
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        securityLogger.error('MongoDB error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        securityLogger.warn('MongoDB disconnected');
      });
      
      break;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed:`, err.message);
      
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Connect to MongoDB
connectDB();

// Redis connection event handlers
redis.on('error', (err) => {
  securityLogger.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

// API Routes with caching and security
app.use('/api/schemes', 
  auditLog('SCHEMES'),
  cacheStrategies.schemes,
  require('./routes/schemes')
);

app.use('/api/projects',
  auditLog('PROJECTS'), 
  cacheStrategies.projects,
  require('./routes/projects')
);

app.use('/api/works',
  auditLog('WORKS'),
  cacheStrategies.works,
  require('./routes/works')
);

app.use('/api/photos',
  rateLimiters.strict,
  auditLog('PHOTOS'),
  require('./routes/photos')
);

app.use('/api/auth',
  auditLog('AUTH'),
  require('./routes/auth')
);

app.use('/api/dashboard',
  cacheStrategies.dashboard,
  require('./routes/dashboard')
);

app.use('/api/locations',
  require('./routes/locations')
);

// AI routes
app.use('/api/ai',
  rateLimiters.general,
  auditLog('AI'),
  require('./routes/ai')
);

// Search routes - No caching for real-time results
app.use('/api/search',
  rateLimiters.general,
  auditLog('SEARCH'),
  require('./routes/search')
);

// Test routes
app.use('/api/test', require('./routes/test'));

// Monitoring routes
app.use('/api/monitoring',
  rateLimiters.strict,
  auditLog('MONITORING'),
  require('./routes/monitoring')
);

// API 404 handler - for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Root route for backend health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'ITDA Backend API Server',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api-docs'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  securityLogger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  await mongoose.connection.close();
  await redis.quit();
  
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`CORS enabled for: https://itda-frontend.onrender.com`);
});

module.exports = app;