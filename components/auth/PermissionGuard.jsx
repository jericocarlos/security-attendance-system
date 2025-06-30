"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PermissionGuard({ module, children, fallbackPath = '/admin', allowSuperadminOverride = false }) {
  const { data: session, status } = useSession();
  const { permissions, loading } = useRolePermissions();
  const router = useRouter();

  useEffect(() => {
    // Don't check permissions while loading
    if (status === 'loading' || loading) return;

    // Redirect if not authenticated
    if (!session) {
      router.push('/admin/login');
      return;
    }

    // Check if user has permission for this module
    if (permissions && module) {
      // Special case: if allowSuperadminOverride is true and user is superadmin, skip permission check
      if (allowSuperadminOverride && session.user.role === 'superadmin') {
        return;
      }
      
      const hasPermission = permissions[module]?.access || false;
      
      if (!hasPermission) {
        router.push(fallbackPath);
        return;
      }
    }
  }, [session, status, permissions, loading, module, router, fallbackPath, allowSuperadminOverride]);

  // Show loading while checking permissions
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  // Don't render if user doesn't have permission (applies to all roles including superadmin)
  if (permissions && module) {
    // Special case: if allowSuperadminOverride is true and user is superadmin, allow access
    if (allowSuperadminOverride && session.user.role === 'superadmin') {
      return children;
    }
    
    const hasPermission = permissions[module]?.access || false;
    if (!hasPermission) {
      return null;
    }
  }

  return children;
}
