"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Users, 
  Database, 
  Calendar, 
  UserCog, 
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  Edit,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: 'bg-red-500' },
  { value: 'admin', label: 'Admin', color: 'bg-blue-500' },
  { value: 'security', label: 'Security', color: 'bg-green-500' },
  { value: 'hr', label: 'HR', color: 'bg-purple-500' }
];

const MODULES = [
  { 
    value: 'employees_management', 
    label: 'Employees Management', 
    icon: <Users className="h-4 w-4" />,
    description: 'Manage employee records, profiles, and information'
  },
  { 
    value: 'data_management', 
    label: 'Data Management', 
    icon: <Database className="h-4 w-4" />,
    description: 'Manage departments, positions, and organizational data'
  },
  { 
    value: 'account_logins', 
    label: 'Account Logins', 
    icon: <UserCog className="h-4 w-4" />,
    description: 'Manage admin user accounts and authentication'
  },
  { 
    value: 'attendance_logs', 
    label: 'Attendance Logs', 
    icon: <Calendar className="h-4 w-4" />,
    description: 'View and manage employee attendance records'
  },
  { 
    value: 'role_permissions', 
    label: 'Role Permissions', 
    icon: <Shield className="h-4 w-4" />,
    description: 'Configure role-based access control (Superadmin only)'
  }
];

const PERMISSIONS = [
  { key: 'read', label: 'View', icon: <Eye className="h-4 w-4" /> },
  { key: 'write', label: 'Edit', icon: <Edit className="h-4 w-4" /> },
  { key: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" /> },
  { key: 'export', label: 'Export', icon: <Download className="h-4 w-4" /> }
];

export default function RolePermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({
    role: '',
    module: '',
    permission: { read: false, write: false, delete: false, export: false }
  });

  // Check if user is superadmin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'superadmin') {
      router.push('/admin');
      return;
    }
  }, [session, status, router]);

  // Fetch permissions
  useEffect(() => {
    if (session?.user?.role === 'superadmin') {
      fetchPermissions();
    }
  }, [session]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/role-permissions');
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = (role, moduleName, permissionKey, value) => {
    setPermissions(prev => 
      prev.map(perm => 
        perm.role === role && perm.module === moduleName
          ? {
              ...perm,
              permission: {
                ...perm.permission,
                [permissionKey]: value
              }
            }
          : perm
      )
    );
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions })
      });

      if (res.ok) {
        // Show success message
        alert('Permissions updated successfully!');
      } else {
        throw new Error('Failed to update permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const addNewPermission = async () => {
    try {
      const res = await fetch('/api/admin/role-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPermission)
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setNewPermission({
          role: '',
          module: '',
          permission: { read: false, write: false, delete: false, export: false }
        });
        fetchPermissions();
      } else {
        throw new Error('Failed to add permission');
      }
    } catch (error) {
      console.error('Error adding permission:', error);
      alert('Failed to add permission');
    }
  };

  const deletePermission = async (role, moduleName) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      const res = await fetch(
        `/api/admin/role-permissions?role=${role}&module=${moduleName}`, 
        { method: 'DELETE' }
      );

      if (res.ok) {
        fetchPermissions();
      } else {
        throw new Error('Failed to delete permission');
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('Failed to delete permission');
    }
  };

  const getPermissionForRoleModule = (role, moduleName) => {
    return permissions.find(p => p.role === role && p.module === moduleName);
  };

  const getRoleColor = (role) => {
    return ROLES.find(r => r.value === role)?.color || 'bg-gray-500';
  };

  const getModuleInfo = (moduleName) => {
    return MODULES.find(m => m.value === moduleName);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session || session.user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            Role Permissions Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure what each role can access in the system
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Permission</DialogTitle>
                <DialogDescription>
                  Configure access permissions for a role and module combination.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Role</Label>
                  <Select 
                    value={newPermission.role} 
                    onValueChange={(value) => setNewPermission(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Module</Label>
                  <Select 
                    value={newPermission.module} 
                    onValueChange={(value) => setNewPermission(prev => ({ ...prev, module: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODULES.map(mod => (
                        <SelectItem key={mod.value} value={mod.value}>
                          <div className="flex items-center gap-2">
                            {mod.icon}
                            {mod.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PERMISSIONS.map(perm => (
                      <div key={perm.key} className="flex items-center space-x-2">
                        <Switch
                          checked={newPermission.permission[perm.key]}
                          onCheckedChange={(checked) => 
                            setNewPermission(prev => ({
                              ...prev,
                              permission: { ...prev.permission, [perm.key]: checked }
                            }))
                          }
                        />
                        <Label className="flex items-center gap-1">
                          {perm.icon}
                          {perm.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={addNewPermission} 
                  className="w-full"
                  disabled={!newPermission.role || !newPermission.module}
                >
                  Add Permission
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={() => fetchPermissions()} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={savePermissions} disabled={saving}>
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Permissions Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Permissions Matrix</CardTitle>
            <CardDescription>
              Configure permissions for each role and module combination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Role</TableHead>
                    <TableHead className="w-[250px]">Module</TableHead>
                    {PERMISSIONS.map(perm => (
                      <TableHead key={perm.key} className="text-center min-w-[80px]">
                        <div className="flex items-center justify-center gap-1">
                          {perm.icon}
                          {perm.label}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((perm, index) => {
                    const moduleInfo = getModuleInfo(perm.module);
                    return (
                      <TableRow key={`${perm.role}-${perm.module}`}>
                        <TableCell>
                          <Badge className={`${getRoleColor(perm.role)} text-white`}>
                            {ROLES.find(r => r.value === perm.role)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {moduleInfo?.icon}
                            <div>
                              <div className="font-medium">{moduleInfo?.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {moduleInfo?.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        {PERMISSIONS.map(permType => (
                          <TableCell key={permType.key} className="text-center">
                            <Switch
                              checked={perm.permission[permType.key] || false}
                              onCheckedChange={(checked) => 
                                updatePermission(perm.role, perm.module, permType.key, checked)
                              }
                              disabled={perm.role === 'superadmin' && perm.module === 'role_permissions'}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePermission(perm.role, perm.module)}
                            disabled={perm.role === 'superadmin' && perm.module === 'role_permissions'}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Role Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {ROLES.map(role => {
          const rolePermissions = permissions.filter(p => p.role === role.value);
          const totalModules = rolePermissions.length;
          const accessibleModules = rolePermissions.filter(p => 
            Object.values(p.permission).some(Boolean)
          ).length;

          return (
            <Card key={role.value}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Badge className={`${role.color} text-white`}>
                    {role.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {accessibleModules} of {MODULES.length} modules accessible
                  </div>
                  <div className="space-y-1">
                    {rolePermissions.map(perm => {
                      const moduleInfo = getModuleInfo(perm.module);
                      const hasAnyPermission = Object.values(perm.permission).some(Boolean);
                      
                      return (
                        <div key={perm.module} className="flex items-center gap-2 text-sm">
                          {moduleInfo?.icon}
                          <span className={hasAnyPermission ? '' : 'text-muted-foreground line-through'}>
                            {moduleInfo?.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </div>
  );
}
