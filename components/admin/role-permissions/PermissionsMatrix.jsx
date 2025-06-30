import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Eye, AlertTriangle } from "lucide-react";
import { getRoleInfo, getModuleInfo, isProtectedPermission } from './utils';

/**
 * Permissions matrix table component
 * @param {Object} props - Component props
 * @param {Array} props.permissions - Array of permissions
 * @param {function} props.onPermissionChange - Permission change handler
 * @param {function} props.onDelete - Delete permission handler
 * @param {boolean} props.loading - Loading state
 */
export default function PermissionsMatrix({ 
  permissions = [], 
  onPermissionChange, 
  onDelete,
  loading = false 
}) {
  const handleTogglePermission = (role, module, permissionKey, value) => {
    if (isProtectedPermission(role, module)) {
      return; // Don't allow changes to protected permissions
    }
    
    // For superadmin, automatically set all permissions to true
    if (role === 'superadmin') {
      onPermissionChange(role, module, permissionKey, true);
      return;
    }
    
    onPermissionChange(role, module, permissionKey, value);
  };

  const handleDeletePermission = (role, module) => {
    if (isProtectedPermission(role, module)) {
      return; // Don't allow deletion of protected permissions
    }
    onDelete(role, module);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
          <CardDescription>Loading permissions data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (permissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
          <CardDescription>No permissions configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No permissions have been configured yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the "Add Permission" button to create your first permission.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
                <TableHead className="w-[200px]">
                  <span className="sr-only">Role information</span>
                  Role
                </TableHead>
                <TableHead className="w-[250px]">
                  <span className="sr-only">Module information</span>
                  Module
                </TableHead>
                <TableHead className="text-center min-w-[80px]">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span>Access</span>
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <span className="sr-only">Permission actions</span>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm) => {
                const roleInfo = getRoleInfo(perm.role);
                const moduleInfo = getModuleInfo(perm.module);
                const isProtected = isProtectedPermission(perm.role, perm.module);
                
                return (
                  <TableRow key={`${perm.role}-${perm.module}`}>
                    {/* Role Column */}
                    <TableCell>
                      <Badge 
                        className={`${roleInfo?.color || 'bg-gray-500'} text-white`}
                        title={roleInfo?.description}
                      >
                        {roleInfo?.label || perm.role}
                      </Badge>
                    </TableCell>

                    {/* Module Column */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{moduleInfo?.label || perm.module}</div>
                        <div className="text-sm text-muted-foreground">
                          {moduleInfo?.description || 'No description available'}
                        </div>
                        {moduleInfo?.category && (
                          <Badge variant="outline" className="text-xs">
                            {moduleInfo.category}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Access Permission Column */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={perm.role === 'superadmin' ? true : (perm.permission.access || false)}
                          onCheckedChange={(checked) => 
                            handleTogglePermission(perm.role, perm.module, 'access', checked)
                          }
                          disabled={isProtected || perm.role === 'superadmin'}
                          aria-label={`${isProtected || perm.role === 'superadmin' ? 'Protected - cannot change' : 'Toggle'} access permission for ${roleInfo?.label} role on ${moduleInfo?.label} module`}
                        />
                        {(isProtected || perm.role === 'superadmin') && (
                          <AlertTriangle 
                            className="h-4 w-4 text-amber-500 ml-2" 
                            title={perm.role === 'superadmin' ? "Superadmin always has full access" : "This permission is protected and cannot be modified"}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePermission(perm.role, perm.module)}
                        disabled={isProtected || perm.role === 'superadmin'}
                        aria-label={`${isProtected || perm.role === 'superadmin' ? 'Protected - cannot delete' : 'Delete'} permission for ${roleInfo?.label} role on ${moduleInfo?.label} module`}
                        className={(isProtected || perm.role === 'superadmin') ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-50'}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend for protected permissions */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span>
              <strong>Protected permissions</strong> (marked with warning icons) cannot be modified to ensure system security. 
              <strong>Superadmin permissions</strong> are automatically set to true and cannot be changed.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
