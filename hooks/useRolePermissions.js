import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useRolePermissions() {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/role-permissions');
        if (res.ok) {
          const data = await res.json();
          const userPermissions = data.permissions.filter(
            p => p.role === session.user.role
          );
          
          // Convert array to object for easier access
          const permissionsObj = {};
          userPermissions.forEach(perm => {
            permissionsObj[perm.module] = perm.permission;
          });
          
          setPermissions(permissionsObj);
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role) {
      fetchUserPermissions();
    }
  }, [session]);

  const refetchPermissions = async () => {
    if (session?.user?.role) {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/role-permissions');
        if (res.ok) {
          const data = await res.json();
          const userPermissions = data.permissions.filter(
            p => p.role === session.user.role
          );
          
          // Convert array to object for easier access
          const permissionsObj = {};
          userPermissions.forEach(perm => {
            permissionsObj[perm.module] = perm.permission;
          });
          
          setPermissions(permissionsObj);
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const hasPermission = (module, action) => {
    if (!permissions || !permissions[module]) return false;
    return permissions[module][action] === true;
  };

  const hasAnyPermission = (module) => {
    if (!permissions || !permissions[module]) return false;
    return Object.values(permissions[module]).some(Boolean);
  };

  const canAccess = (module) => {
    return hasPermission(module, 'read');
  };

  const canEdit = (module) => {
    return hasPermission(module, 'write');
  };

  const canDelete = (module) => {
    return hasPermission(module, 'delete');
  };

  const canExport = (module) => {
    return hasPermission(module, 'export');
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    canAccess,
    canEdit,
    canDelete,
    canExport,
    refetch: refetchPermissions
  };
}
