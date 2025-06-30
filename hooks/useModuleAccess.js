/**
 * Custom hook for accessible module filtering
 * Handles permission checking and module access logic
 */
import { useMemo } from 'react';

export function useAccessibleModules(session, permissions, moduleDefinitions) {
  return useMemo(() => {
    if (!session?.user?.role || !moduleDefinitions) {
      return [];
    }

    return Object.entries(moduleDefinitions).filter(([moduleKey]) => {
      // Superadmin with override for role_permissions
      if (session.user.role === 'superadmin' && moduleKey === 'role_permissions') {
        return true;
      }
      
      // Check database permissions with fallback
      return permissions?.[moduleKey]?.access || false;
    });
  }, [session, permissions, moduleDefinitions]);
}

/**
 * Custom hook for attendance access checking
 * Determines if user has access to attendance logs
 */
export function useAttendanceAccess(session, permissions, accessibleModules) {
  return useMemo(() => {
    const hasDirectPermission = permissions?.attendance_logs?.access;
    const isSuperadminWithAccess = 
      session?.user?.role === 'superadmin' && 
      accessibleModules.some(([key]) => key === 'attendance_logs');
    
    return hasDirectPermission || isSuperadminWithAccess;
  }, [session, permissions, accessibleModules]);
}
