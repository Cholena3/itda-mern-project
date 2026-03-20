const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasPermission, getRolePermissions } = require('../config/permissions');

/**
 * Authentication middleware — verifies JWT and attaches user to req.
 * Replaces the old auth.js middleware with richer user data.
 */
async function authenticate(req, res, next) {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

/**
 * Authorization middleware factory.
 * Usage: authorize('schemes', 'create')
 * Must be used AFTER authenticate.
 */
function authorize(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const role = req.user.role;

    if (!hasPermission(role, resource, action)) {
      return res.status(403).json({
        message: 'Access denied',
        detail: `Role '${role}' does not have '${action}' permission on '${resource}'`,
      });
    }

    next();
  };
}

/**
 * Middleware that requires one of the specified roles.
 * Usage: requireRole('admin', 'manager')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied',
        detail: `Requires one of: ${roles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize, requireRole };
