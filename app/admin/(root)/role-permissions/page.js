"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { Shield, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { useSnackbar } from "notistack";
import { useRolePermissionsManager } from "@/hooks/useRolePermissionsManager";
import {
  PermissionsMatrix,
  AddPermissionDialog,
  RoleOverviewCards,
  PermissionActions
} from "@/components/admin/role-permissions";

/**
 * Role Permissions Management Page
 * 
 * This page allows superadmins to configure role-based access control (RBAC)
 * for the system. It provides a comprehensive interface to:
 * - View and edit permissions for all roles and modules
 * - Add new permission configurations
 * - Delete existing permissions (with protection for critical permissions)
 * - Monitor role access overview
 * 
 * @returns {JSX.Element} The role permissions management page
 */
export default function RolePermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    role: null,
    moduleName: null,
    loading: false,
  });
  
  const {
    permissions,
    loading,
    saving,
    error,
    hasChanges,
    fetchPermissions,
    updatePermission,
    savePermissions,
    addPermission,
    deletePermission,
    resetPermissions,
    clearError
  } = useRolePermissionsManager();

  // Authorization check
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'superadmin') {
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  // Error handling
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      clearError();
    }
  }, [error, enqueueSnackbar, clearError]);

  /**
   * Handle saving permissions with user feedback
   */
  const handleSavePermissions = async () => {
    const result = await savePermissions();
    if (result.success) {
      enqueueSnackbar(result.message, { variant: 'success' });
    } else {
      enqueueSnackbar(result.message, { variant: 'error' });
    }
  };

  /**
   * Handle adding new permission with user feedback
   */
  const handleAddPermission = async (newPermissionData) => {
    const result = await addPermission(newPermissionData);
    if (result.success) {
      enqueueSnackbar(result.message, { variant: 'success' });
      return true; // Signal success to dialog
    } else {
      enqueueSnackbar(result.message, { variant: 'error' });
      return false;
    }
  };

  /**
   * Handle deleting permission with confirmation dialog
   */
  const handleDeletePermission = (role, moduleName) => {
    setDeleteDialog({
      open: true,
      role,
      moduleName,
      loading: false,
    });
  };

  /**
   * Execute the actual deletion after confirmation
   */
  const executeDeletePermission = async () => {
    if (!deleteDialog.role || !deleteDialog.moduleName) return;
    
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await deletePermission(deleteDialog.role, deleteDialog.moduleName);
      if (result.success) {
        enqueueSnackbar(result.message, { variant: 'success' });
        setDeleteDialog({ open: false, role: null, moduleName: null, loading: false });
      } else {
        enqueueSnackbar(result.message, { variant: 'error' });
        setDeleteDialog(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Close the delete dialog
   */
  const closeDeleteDialog = () => {
    if (deleteDialog.loading) return;
    setDeleteDialog({ open: false, role: null, moduleName: null, loading: false });
  };

  /**
   * Handle refreshing permissions with user feedback
   */
  const handleRefreshPermissions = async () => {
    await fetchPermissions();
    enqueueSnackbar('Permissions refreshed successfully', { variant: 'success' });
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading permissions">
        <LoadingSpinner size="lg" />
        <span className="sr-only">Loading role permissions...</span>
      </div>
    );
  }

  // Unauthorized access
  if (!session || session.user.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard module="role_permissions" allowSuperadminOverride={true}>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-500" aria-hidden="true" />
              Role Permissions Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure what each role can access in the system. Changes are highlighted and must be saved.
            </p>
            {hasChanges && (
              <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>You have unsaved changes</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <AddPermissionDialog
              onAdd={handleAddPermission}
              existingPermissions={permissions}
              loading={saving}
            />
            
            <PermissionActions
              onSave={handleSavePermissions}
              onRefresh={handleRefreshPermissions}
              saving={saving}
              hasChanges={hasChanges}
            />
          </div>
        </motion.div>

        {/* Permissions Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <PermissionsMatrix
            permissions={permissions}
            onPermissionChange={updatePermission}
            onDelete={handleDeletePermission}
            loading={loading}
          />
        </motion.div>

        {/* Role Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Role Overview</h2>
              <p className="text-muted-foreground text-sm">
                Summary of permissions by role with access statistics
              </p>
            </div>
            
            <RoleOverviewCards 
              permissions={permissions} 
              loading={loading}
            />
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h3 className="font-medium text-blue-900 mb-2">Usage Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Protected permissions (like superadmin access to this page) cannot be modified</li>
            <li>• Changes are highlighted and must be saved using the &quot;Save Changes&quot; button</li>
            <li>• Use the role overview cards to quickly see which modules each role can access</li>
            <li>• Add new permission combinations using the &quot;Add Permission&quot; dialog</li>
          </ul>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={closeDeleteDialog}
        onConfirm={executeDeletePermission}
        loading={deleteDialog.loading}
        title="Delete Permission"
        description={`Are you sure you want to delete this permission? This will remove access for the specified role.`}
        itemName={deleteDialog.role && deleteDialog.moduleName ? 
          `${deleteDialog.role} → ${deleteDialog.moduleName}` : 
          null
        }
        itemType="Permission"
        warningText="This action will immediately revoke access for all users with this role to the specified module."
        consequences={[
          "Users with this role will lose access to the module",
          "Any ongoing operations may be interrupted",
          "The permission will need to be manually recreated if needed"
        ]}
        confirmButtonText="Delete Permission"
      />
    </PermissionGuard>
  );
}
