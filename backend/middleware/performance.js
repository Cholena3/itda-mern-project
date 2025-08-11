const { cache } = require('../config/redis');

// Performance monitoring middleware
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: new Map(),
      slowQueries: [],
      errorRates: new Map(),
    };
  }

  // Track API response times
  trackResponseTime() {
    return (req, res, next) => {
      const start = Date.now();
      const path = req.route ? req.route.path : req.path;
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = Date.now() - start;
        
        // Log slow requests (> 1 second)
        if (duration > 1000) {
          const slowRequest = {
            path,
            method: req.method,
            duration,
            timestamp: new Date().toISOString(),
            query: req.query,
            params: req.params,
          };
          
          // Store in memory (limited to last 100)
          if (this.metrics.slowQueries.length >= 100) {
            this.metrics.slowQueries.shift();
          }
          this.metrics.slowQueries.push(slowRequest);
          
          // Also cache in Redis for persistence
          cache.set(`slow:${Date.now()}`, slowRequest, 3600);
        }
        
        // Track average response times
        const key = `${req.method}:${path}`;
        if (!this.metrics.requests.has(key)) {
          this.metrics.requests.set(key, {
            count: 0,
            totalTime: 0,
            avgTime: 0,
            minTime: Infinity,
            maxTime: 0,
          });
        }
        
        const metric = this.metrics.requests.get(key);
        metric.count++;
        metric.totalTime += duration;
        metric.avgTime = metric.totalTime / metric.count;
        metric.minTime = Math.min(metric.minTime, duration);
        metric.maxTime = Math.max(metric.maxTime, duration);
        
        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Request-ID', req.id || 'none');
        
        originalEnd.apply(res, args);
      }.bind(this);
      
      next();
    };
  }

  // Track database query performance
  trackDatabaseQueries() {
    return (req, res, next) => {
      // Mongoose query tracking
      const mongoose = require('mongoose');
      const originalExec = mongoose.Query.prototype.exec;
      
      mongoose.Query.prototype.exec = async function() {
        const start = Date.now();
        const collection = this.mongooseCollection.name;
        const operation = this.op;
        
        try {
          const result = await originalExec.apply(this, arguments);
          const duration = Date.now() - start;
          
          // Log slow database queries (> 100ms)
          if (duration > 100) {
            console.warn(`Slow DB Query: ${collection}.${operation} took ${duration}ms`);
            cache.set(`slow-db:${Date.now()}`, {
              collection,
              operation,
              duration,
              query: this.getQuery(),
              timestamp: new Date().toISOString(),
            }, 3600);
          }
          
          return result;
        } catch (error) {
          const duration = Date.now() - start;
          console.error(`DB Query Error: ${collection}.${operation} failed after ${duration}ms`);
          throw error;
        }
      };
      
      next();
    };
  }

  // Memory usage monitoring
  monitorMemory() {
    setInterval(() => {
      const usage = process.memoryUsage();
      const formatted = {
        rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(usage.external / 1024 / 1024)} MB`,
        timestamp: new Date().toISOString(),
      };
      
      // Store in Redis for monitoring
      cache.set('memory:latest', formatted, 300);
      
      // Alert if memory usage is high (> 500MB heap)
      if (usage.heapUsed > 500 * 1024 * 1024) {
        console.warn('High memory usage detected:', formatted);
        cache.set(`alert:memory:${Date.now()}`, formatted, 3600);
      }
    }, 60000); // Check every minute
  }

  // Error rate tracking
  trackErrors() {
    return (err, req, res, next) => {
      const path = req.route ? req.route.path : req.path;
      const key = `${req.method}:${path}`;
      
      if (!this.metrics.errorRates.has(key)) {
        this.metrics.errorRates.set(key, {
          count: 0,
          errors: [],
        });
      }
      
      const errorMetric = this.metrics.errorRates.get(key);
      errorMetric.count++;
      errorMetric.errors.push({
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 10 errors per endpoint
      if (errorMetric.errors.length > 10) {
        errorMetric.errors.shift();
      }
      
      // Store critical errors in Redis
      if (err.status >= 500) {
        cache.set(`error:${Date.now()}`, {
          path,
          method: req.method,
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString(),
        }, 86400);
      }
      
      next(err);
    };
  }

  // Get performance metrics
  getMetrics() {
    const metrics = {
      endpoints: Array.from(this.metrics.requests.entries()).map(([key, value]) => ({
        endpoint: key,
        ...value,
      })),
      slowQueries: this.metrics.slowQueries,
      errorRates: Array.from(this.metrics.errorRates.entries()).map(([key, value]) => ({
        endpoint: key,
        ...value,
      })),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
    };
    
    return metrics;
  }

  // Reset metrics
  resetMetrics() {
    this.metrics.requests.clear();
    this.metrics.slowQueries = [];
    this.metrics.errorRates.clear();
  }
}

module.exports = new PerformanceMonitor();