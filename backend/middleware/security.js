const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const { validationResult } = require('express-validator');
const winston = require('winston');
const DOMPurify = require('isomorphic-dompurify');

// Security logger
const securityLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.json(),
  defaultMeta: { service: 'security' },
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.File({ filename: 'security-error.log', level: 'error' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    handler: (req, res) => {
      securityLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      res.status(429).json({ error: message });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limiters for different endpoints
const rateLimiters = {
  general: createRateLimiter(15 * 60 * 1000, 100, 'Too many requests, please try again later'),
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts'),
  api: createRateLimiter(1 * 60 * 1000, 30, 'API rate limit exceeded'),
  strict: createRateLimiter(1 * 60 * 1000, 10, 'Rate limit exceeded for this operation')
};

// SQL Injection Prevention Middleware
const preventSQLInjection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|EVAL)\b)/gi,
    /(--|\||;|\/\*|\*\/|xp_|sp_|0x)/gi,
    /(<script|<\/script|javascript:|onerror=|onclick=|onload=)/gi
  ];

  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    return sqlInjectionPatterns.some(pattern => pattern.test(value));
  };

  // Check all request inputs
  const inputs = { ...req.body, ...req.query, ...req.params };
  
  for (const [key, value] of Object.entries(inputs)) {
    if (checkForSQLInjection(value)) {
      securityLogger.error('SQL Injection attempt detected', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        key,
        value: value.substring(0, 100), // Log only first 100 chars
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ 
        error: 'Invalid input detected. Request blocked for security reasons.' 
      });
    }
  }

  next();
};

// NoSQL Injection Prevention (MongoDB specific)
const preventNoSQLInjection = (req, res, next) => {
  // Deep check for dangerous MongoDB operators
  const checkForNoSQLInjection = (obj) => {
    if (typeof obj !== 'object' || obj === null) return false;
    
    const dangerousKeys = ['$where', '$regex', '$options', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$or', '$and', '$not', '$nor'];
    
    for (const key in obj) {
      if (dangerousKeys.includes(key)) {
        return true;
      }
      if (typeof obj[key] === 'object') {
        if (checkForNoSQLInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForNoSQLInjection(req.body) || checkForNoSQLInjection(req.query)) {
    securityLogger.error('NoSQL Injection attempt detected', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({ 
      error: 'Invalid query structure detected.' 
    });
  }

  next();
};

// XSS Prevention Middleware
const preventXSS = (req, res, next) => {
  // Sanitize all string inputs
  const sanitizeInput = (input) => {
    if (typeof input === 'string') {
      // Remove any HTML tags and dangerous content
      return DOMPurify.sanitize(input, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const key in input) {
        sanitized[key] = sanitizeInput(input[key]);
      }
      return sanitized;
    }
    return input;
  };

  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }

  next();
};

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    securityLogger.warn('Input validation failed', {
      ip: req.ip,
      path: req.path,
      errors: errors.array(),
      timestamp: new Date().toISOString()
    });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const logEntry = {
      action,
      user: req.user ? req.user.id : 'anonymous',
      ip: req.ip,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
      userAgent: req.get('user-agent')
    };

    // Log sensitive operations
    if (['DELETE', 'PUT', 'POST'].includes(req.method)) {
      securityLogger.info('Audit log', logEntry);
    }

    next();
  };
};

// CORS configuration with whitelist
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.CORS_WHITELIST 
      ? process.env.CORS_WHITELIST.split(',') 
      : ['http://localhost:3000', 'http://localhost:5000'];
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      securityLogger.warn('CORS blocked request', {
        origin,
        timestamp: new Date().toISOString()
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = {
  rateLimiters,
  preventSQLInjection,
  preventNoSQLInjection,
  preventXSS,
  validateInput,
  securityHeaders,
  mongoSanitize,
  auditLog,
  corsOptions,
  securityLogger
};