import { ROLES, MODULES, PROTECTED_PERMISSIONS } from './constants';

/**
 * Get role information by value
 * @param {string} role - Role value
 * @returns {Object|undefined} Role object
 */
export const getRoleInfo = (role) => {
  return ROLES.find(r => r.value === role);
};

/**
 * Get module information by value
 * @param {string} moduleName - Module value
 * @returns {Object|undefined} Module object
 */
export const getModuleInfo = (moduleName) => {
  return MODULES.find(m => m.value === moduleName);
};

/**
 * Get role color class
 * @param {string} role - Role value
 * @returns {string} CSS class for role color
 */
export const getRoleColor = (role) => {
  return getRoleInfo(role)?.color || 'bg-gray-500';
};

/**
 * Check if a permission is protected from modification
 * @param {string} role - Role value
 * @param {string} module - Module value
 * @returns {boolean} True if permission is protected
 */
export const isProtectedPermission = (role, module) => {
  return PROTECTED_PERMISSIONS.some(p => p.role === role && p.module === module);
};

/**
 * Get permission for a specific role and module
 * @param {Array} permissions - All permissions array
 * @param {string} role - Role value
 * @param {string} module - Module value
 * @returns {Object|undefined} Permission object
 */
export const getPermissionForRoleModule = (permissions, role, module) => {
  return permissions.find(p => p.role === role && p.module === module);
};

/**
 * Calculate role statistics
 * @param {Array} permissions - All permissions array
 * @param {string} role - Role value
 * @returns {Object} Role statistics
 */
export const calculateRoleStats = (permissions, role) => {
  const rolePermissions = permissions.filter(p => p.role === role);
  const accessibleModules = rolePermissions.filter(p => p.permission.access).length;
  
  return {
    totalModules: rolePermissions.length,
    accessibleModules,
    accessPercentage: rolePermissions.length > 0 
      ? Math.round((accessibleModules / rolePermissions.length) * 100) 
      : 0
  };
};

/**
 * Validate permission data
 * @param {Object} permission - Permission object to validate
 * @returns {Object} Validation result
 */
export const validatePermission = (permission) => {
  const errors = [];
  
  if (!permission.role) {
    errors.push('Role is required');
  } else if (!ROLES.some(r => r.value === permission.role)) {
    errors.push('Invalid role selected');
  }
  
  if (!permission.module) {
    errors.push('Module is required');
  } else if (!MODULES.some(m => m.value === permission.module)) {
    errors.push('Invalid module selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if combination already exists
 * @param {Array} permissions - All permissions array
 * @param {string} role - Role value
 * @param {string} module - Module value
 * @returns {boolean} True if combination exists
 */
export const permissionExists = (permissions, role, module) => {
  return permissions.some(p => p.role === role && p.module === module);
};
