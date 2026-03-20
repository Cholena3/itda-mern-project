const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize, requireRole } = require('../middleware/authorize');
const { getRolePermissions, ROLES } = require('../config/permissions');

// All user routes require authentication
router.use(authenticate);

// GET /api/users — list all users (admin & manager can view)
router.get('/', authorize('users', 'read'), async (req, res) => {
  try {
    const { role, department, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/roles — get available roles and their permissions
router.get('/roles', authorize('users', 'read'), (req, res) => {
  const roles = Object.values(ROLES).map(role => ({
    name: role,
    permissions: getRolePermissions(role),
  }));
  res.json(roles);
});

// GET /api/users/:id — get single user
router.get('/:id', authorize('users', 'read'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id/role — change user role (admin only)
router.put('/:id/role', authorize('users', 'manage'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}` });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/:id/status — activate/deactivate user (admin only)
router.put('/:id/status', authorize('users', 'manage'), async (req, res) => {
  try {
    const { isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/users/:id — delete user (admin only)
router.delete('/:id', authorize('users', 'delete'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
