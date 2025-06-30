import { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Eye } from "lucide-react";
import { ROLES, MODULES, DEFAULT_NEW_PERMISSION } from './constants';
import { validatePermission, permissionExists } from './utils';

/**
 * Dialog component for adding new permissions
 * @param {Object} props - Component props
 * @param {boolean} props.open - Dialog open state
 * @param {function} props.onOpenChange - Dialog open state change handler
 * @param {function} props.onAdd - Add permission handler
 * @param {Array} props.existingPermissions - Existing permissions to check for duplicates
 * @param {boolean} props.loading - Loading state
 */
export default function AddPermissionDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  existingPermissions = [],
  loading = false 
}) {
  const [formData, setFormData] = useState(DEFAULT_NEW_PERMISSION);
  const [errors, setErrors] = useState([]);

  const handleSubmit = () => {
    // Validate form data
    const validation = validatePermission(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check for duplicate
    if (permissionExists(existingPermissions, formData.role, formData.module)) {
      setErrors(['This role and module combination already exists']);
      return;
    }

    // Clear errors and submit
    setErrors([]);
    onAdd(formData);
    
    // Reset form
    setFormData(DEFAULT_NEW_PERMISSION);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If role is superadmin, automatically set access permission to true
      if (field === 'role' && value === 'superadmin') {
        newData.permission = {
          access: true
        };
      }
      
      return newData;
    });
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handlePermissionChange = (checked) => {
    // Prevent changing permissions for superadmin
    if (formData.role === 'superadmin') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      permission: { access: checked }
    }));
  };

  const isFormValid = formData.role && formData.module;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Add new permission">
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Permission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="add-permission-description">
        <DialogHeader>
          <DialogTitle>Add New Permission</DialogTitle>
          <DialogDescription id="add-permission-description">
            Configure access permissions for a role and module combination.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleFieldChange('role', value)}
            >
              <SelectTrigger id="role-select" aria-label="Select role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${role.color}`} aria-hidden="true" />
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Module Selection */}
          <div className="space-y-2">
            <Label htmlFor="module-select">Module</Label>
            <Select 
              value={formData.module} 
              onValueChange={(value) => handleFieldChange('module', value)}
            >
              <SelectTrigger id="module-select" aria-label="Select module">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map(mod => (
                  <SelectItem key={mod.value} value={mod.value}>
                    <div className="space-y-1">
                      <div className="font-medium">{mod.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {mod.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permission Toggle */}
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="access-permission"
                checked={formData.role === 'superadmin' ? true : formData.permission.access}
                onCheckedChange={handlePermissionChange}
                disabled={formData.role === 'superadmin'}
                aria-describedby="access-permission-description"
              />
              <Label 
                htmlFor="access-permission" 
                className="flex items-center gap-1 cursor-pointer"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Access
              </Label>
              {formData.role === 'superadmin' && (
                <span className="text-xs text-amber-600 ml-2">
                  (Auto-enabled for superadmin)
                </span>
              )}
            </div>
            <p id="access-permission-description" className="text-xs text-muted-foreground">
              {formData.role === 'superadmin' 
                ? 'Superadmin automatically has all permissions enabled'
                : 'Allow this role to access the selected module'
              }
            </p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3" role="alert">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!isFormValid || loading}
            aria-label={`Add permission for ${formData.role} role to access ${formData.module} module`}
          >
            {loading ? 'Adding...' : 'Add Permission'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
