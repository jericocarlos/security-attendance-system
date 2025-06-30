/**
 * DeleteConfirmationDialog Usage Examples
 * 
 * This file demonstrates various ways to use the DeleteConfirmationDialog component
 * across different scenarios in the application.
 */

import { useState } from 'react';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';

// Example 1: Basic employee deletion
export function BasicEmployeeDeleteExample() {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    employee: null,
    loading: false,
  });

  const handleDeleteEmployee = (employee) => {
    setDeleteDialog({
      open: true,
      employee,
      loading: false,
    });
  };

  const executeDeleteEmployee = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Employee deleted:', deleteDialog.employee.name);
      setDeleteDialog({ open: false, employee: null, loading: false });
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <Button 
        variant="destructive"
        onClick={() => handleDeleteEmployee({ id: 1, name: 'John Doe' })}
      >
        Delete Employee
      </Button>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !deleteDialog.loading && setDeleteDialog({ open, employee: null, loading: false })}
        onConfirm={executeDeleteEmployee}
        loading={deleteDialog.loading}
        title="Delete Employee"
        description="This employee will be permanently removed from the system."
        itemName={deleteDialog.employee?.name}
        itemType="Employee"
        warningText="This action will remove all associated data including attendance records and access permissions."
        consequences={[
          "All attendance records will be archived",
          "RFID access will be immediately revoked", 
          "User account will be deactivated",
          "All associated permissions will be removed"
        ]}
        confirmButtonText="Delete Employee"
      />
    </>
  );
}

// Example 2: Permission deletion (as used in role-permissions page)
export function PermissionDeleteExample() {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    role: null,
    module: null,
    loading: false,
  });

  const handleDeletePermission = (role, module) => {
    setDeleteDialog({
      open: true,
      role,
      module,
      loading: false,
    });
  };

  const executeDeletePermission = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Permission deleted:', deleteDialog.role, deleteDialog.module);
      setDeleteDialog({ open: false, role: null, module: null, loading: false });
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => handleDeletePermission('admin', 'employees')}
      >
        Delete Permission
      </Button>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !deleteDialog.loading && setDeleteDialog({ open, role: null, module: null, loading: false })}
        onConfirm={executeDeletePermission}
        loading={deleteDialog.loading}
        title="Delete Permission"
        description="Are you sure you want to delete this permission? This will remove access for the specified role."
        itemName={deleteDialog.role && deleteDialog.module ? 
          `${deleteDialog.role} → ${deleteDialog.module}` : 
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
    </>
  );
}

// Example 3: Simple deletion with minimal props
export function SimpleDeleteExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Simple Delete
      </Button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        loading={loading}
        description="This item will be permanently deleted."
        itemName="Sample Item"
      />
    </>
  );
}

// Example 4: Non-destructive action (like archiving)
export function ArchiveExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Archive Item
      </Button>

      <DeleteConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleArchive}
        loading={loading}
        destructive={false}
        title="Archive Item"
        description="This item will be moved to the archive."
        itemName="Sample Document"
        itemType="Document"
        confirmButtonText="Archive"
        consequences={[
          "Item will be moved to archived section",
          "Item can be restored later if needed",
          "Active workflows will be paused"
        ]}
      />
    </>
  );
}
