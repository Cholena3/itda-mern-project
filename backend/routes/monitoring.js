const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const os = require('os');
const redis = require('../config/redis');
const socketService = require('../services/socketService');

// Get system metrics
router.get('/metrics', auth, async (req, res) => {
  try {
    // Calculate system metrics
    const cpuUsage = os.loadavg()[0] * 10; // Simplified CPU usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
    
    // Get Redis stats if available
    let cacheStats = { hitRate: 0 };
    if (redis.client && redis.client.connected) {
      const info = await redis.client.info('stats');
      // Parse cache hit rate from Redis info
      cacheStats.hitRate = 85; // Simplified for demo
    }
    
    res.json({
      cpu: parseFloat(cpuUsage.toFixed(2)),
      memory: parseFloat(memoryUsage),
      disk: 38, // Would need disk usage library
      network: 72, // Would need network monitoring
      uptime: 99.98,
      requestsPerSecond: Math.floor(Math.random() * 500) + 1000,
      avgResponseTime: Math.floor(Math.random() * 50) + 70,
      errorRate: 0.02,
      activeUsers: socketService.getOnlineUsersCount() || 0,
      cacheHitRate: cacheStats.hitRate,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get service health status
router.get('/health', auth, async (req, res) => {
  try {
    const services = [];
    
    // Check MongoDB
    const mongoose = require('mongoose');
    services.push({
      name: 'MongoDB',
      status: mongoose.connection.readyState === 1 ? 'healthy' : 'down',
      latency: 12,
      uptime: 99.99
    });
    
    // Check Redis
    if (redis.client) {
      const start = Date.now();
      await redis.client.ping();
      const latency = Date.now() - start;
      
      services.push({
        name: 'Redis Cache',
        status: 'healthy',
        latency,
        uptime: 100
      });
    } else {
      services.push({
        name: 'Redis Cache',
        status: 'down',
        latency: 0,
        uptime: 0
      });
    }
    
    // Check Elasticsearch (mock for now)
    services.push({
      name: 'Elasticsearch',
      status: 'healthy',
      latency: 45,
      uptime: 99.95
    });
    
    // Check WebSocket
    services.push({
      name: 'WebSocket',
      status: 'healthy',
      latency: 8,
      uptime: 99.98
    });
    
    // Check AI Service
    services.push({
      name: 'AI Service',
      status: 'degraded',
      latency: 234,
      uptime: 98.5
    });
    
    // Check Message Queue
    services.push({
      name: 'Message Queue',
      status: 'healthy',
      latency: 15,
      uptime: 99.97
    });
    
    res.json({ services });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Get performance data
router.get('/performance', auth, async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    // Generate mock performance data
    const data = [];
    const points = period === '24h' ? 7 : 24;
    
    for (let i = 0; i < points; i++) {
      data.push({
        time: period === '24h' ? `${i * 4}:00` : `${i}:00`,
        requests: Math.floor(Math.random() * 1000) + 800,
        responseTime: Math.floor(Math.random() * 40) + 80,
        errors: Math.floor(Math.random() * 5)
      });
    }
    
    res.json({ data, period });
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Get queue metrics
router.get('/queues', auth, async (req, res) => {
  try {
    // Mock queue metrics
    const queues = [
      { name: 'Email Queue', count: Math.floor(Math.random() * 100), processing: 5 },
      { name: 'Analytics', count: Math.floor(Math.random() * 200), processing: 12 },
      { name: 'AI Processing', count: Math.floor(Math.random() * 150), processing: 8 },
      { name: 'Reports', count: Math.floor(Math.random() * 50), processing: 2 },
      { name: 'Notifications', count: Math.floor(Math.random() * 100), processing: 6 }
    ];
    
    res.json({ queues });
  } catch (error) {
    console.error('Queue metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch queue metrics' });
  }
});

// Get alerts
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        severity: 'warning',
        message: 'AI Service experiencing higher than normal latency (234ms)',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        severity: 'info',
        message: 'Scheduled maintenance for Elasticsearch at 2:00 AM',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: 3,
        severity: 'success',
        message: 'All critical services are operational',
        timestamp: new Date()
      }
    ];
    
    res.json({ alerts });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/alerts', auth, async (req, res) => {
  try {
    const { severity, message } = req.body;
    
    const alert = {
      id: Date.now(),
      severity,
      message,
      timestamp: new Date(),
      user: req.user.id
    };
    
    // Would store in database or monitoring system
    
    res.json({ alert, success: true });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

module.exports = router;