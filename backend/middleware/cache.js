const { cache } = require('../config/redis');

// Cache middleware factory
const cacheMiddleware = (keyPrefix, ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on route and query params
    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      // Try to get data from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        // Add cache hit header
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss - store original send function
      const originalSend = res.json.bind(res);

      // Override json method to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error('Cache set error:', err);
          });
        }
        
        // Add cache miss header
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Call original send
        return originalSend(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without cache on error
      next();
    }
  };
};

// Invalidate cache by pattern
const invalidateCache = async (pattern) => {
  try {
    await cache.clearPattern(pattern);
    return true;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return false;
  }
};

// Invalidate cache middleware
const invalidateCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Invalidate cache after successful mutations
    const originalSend = res.json.bind(res);
    
    res.json = async function(data) {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patterns) {
          await invalidateCache(pattern);
        }
      }
      return originalSend(data);
    };
    
    next();
  };
};

// Specific cache strategies for different resources
const cacheStrategies = {
  // Short TTL for frequently changing data
  dashboard: cacheMiddleware('dashboard', 60), // 1 minute
  
  // Medium TTL for moderately changing data
  projects: cacheMiddleware('projects', 300), // 5 minutes
  schemes: cacheMiddleware('schemes', 300),
  works: cacheMiddleware('works', 300),
  
  // Long TTL for rarely changing data
  users: cacheMiddleware('users', 1800), // 30 minutes
  static: cacheMiddleware('static', 3600), // 1 hour
  
  // Custom TTL
  custom: (ttl) => cacheMiddleware('custom', ttl)
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateCacheMiddleware,
  cacheStrategies
};