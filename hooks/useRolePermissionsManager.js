import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Custom hook for managing role permissions
 * @returns {Object} Hook return object
 */
export const useRolePermissionsManager = () => {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);

  /**
   * Fetch permissions from API
   */
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/admin/role-permissions');
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setPermissions(data.permissions || []);
      setOriginalPermissions(data.permissions || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a specific permission
   */
  const updatePermission = useCallback((role, moduleName, permissionKey, value) => {
    setPermissions(prev => 
      prev.map(perm => 
        perm.role === role && perm.module === moduleName
          ? {
              ...perm,
              permission: role === 'superadmin' 
                ? {
                    access: true // For superadmin, always set access to true
                  }
                : {
                    ...perm.permission,
                    [permissionKey]: value
                  }
            }
          : perm
      )
    );
  }, []);

  /**
   * Save all permissions to API
   */
  const savePermissions = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      
      const res = await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Update original permissions to reflect saved state
      setOriginalPermissions([...permissions]);
      
      return { success: true, message: 'Permissions updated successfully!' };
    } catch (err) {
      console.error('Error saving permissions:', err);
      setError('Failed to save permissions. Please try again.');
      return { success: false, message: 'Failed to save permissions' };
    } finally {
      setSaving(false);
    }
  }, [permissions]);

  /**
   * Add a new permission
   */
  const addPermission = useCallback(async (newPermission) => {
    try {
      setError(null);
      
      const res = await fetch('/api/admin/role-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPermission)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Refresh permissions after adding
      await fetchPermissions();
      
      return { success: true, message: 'Permission added successfully!' };
    } catch (err) {
      console.error('Error adding permission:', err);
      setError('Failed to add permission. Please try again.');
      return { success: false, message: 'Failed to add permission' };
    }
  }, [fetchPermissions]);

  /**
   * Delete a permission
   */
  const deletePermission = useCallback(async (role, moduleName) => {
    try {
      setError(null);
      
      const res = await fetch(
        `/api/admin/role-permissions?role=${encodeURIComponent(role)}&module=${encodeURIComponent(moduleName)}`, 
        { method: 'DELETE' }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Refresh permissions after deletion
      await fetchPermissions();
      
      return { success: true, message: 'Permission deleted successfully!' };
    } catch (err) {
      console.error('Error deleting permission:', err);
      setError('Failed to delete permission. Please try again.');
      return { success: false, message: 'Failed to delete permission' };
    }
  }, [fetchPermissions]);

  /**
   * Reset permissions to original state
   */
  const resetPermissions = useCallback(() => {
    setPermissions([...originalPermissions]);
    setError(null);
  }, [originalPermissions]);

  // Auto-fetch permissions when session is available
  useEffect(() => {
    if (session?.user?.role === 'superadmin') {
      fetchPermissions();
    }
  }, [session, fetchPermissions]);

  return {
    // State
    permissions,
    loading,
    saving,
    error,
    hasChanges,
    
    // Actions
    fetchPermissions,
    updatePermission,
    savePermissions,
    addPermission,
    deletePermission,
    resetPermissions,
    
    // Utilities
    clearError: () => setError(null)
  };
};
