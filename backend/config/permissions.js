/**
 * RBAC Permissions Configuration
 * 
 * Maps roles to resources and allowed actions.
 * This is the single source of truth for authorization.
 * 
 * Actions: create, read, update, delete, manage
 * Resources: schemes, projects, works, photos, users, dashboard, monitoring, ai, search, locations
 */

const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

const permissions = {
  [ROLES.ADMIN]: {
    schemes:    ['create', 'read', 'update', 'delete'],
    projects:   ['create', 'read', 'update', 'delete'],
    works:      ['create', 'read', 'update', 'delete'],
    photos:     ['create', 'read', 'delete'],
    users:      ['create', 'read', 'update', 'delete', 'manage'],
    dashboard:  ['read'],
    monitoring: ['read'],
    ai:         ['read', 'create'],
    search:     ['read'],
    locations:  ['read'],
  },

  [ROLES.MANAGER]: {
    schemes:    ['create', 'read', 'update'],
    projects:   ['create', 'read', 'update'],
    works:      ['create', 'read', 'update', 'delete'],
    photos:     ['create', 'read', 'delete'],
    users:      ['read'],
    dashboard:  ['read'],
    monitoring: ['read'],
    ai:         ['read', 'create'],
    search:     ['read'],
    locations:  ['read'],
  },

  [ROLES.VIEWER]: {
    schemes:    ['read'],
    projects:   ['read'],
    works:      ['read'],
    photos:     ['read'],
    users:      [],
    dashboard:  ['read'],
    monitoring: [],
    ai:         ['read'],
    search:     ['read'],
    locations:  ['read'],
  },
};

/**
 * Check if a role has permission for a specific action on a resource
 */
function hasPermission(role, resource, action) {
  const rolePerms = permissions[role];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;

  return resourcePerms.includes(action);
}

/**
 * Get all permissions for a role (useful for sending to frontend)
 */
function getRolePermissions(role) {
  return permissions[role] || {};
}

module.exports = { ROLES, permissions, hasPermission, getRolePermissions };
