/**
 * Employee Details Tab Component
 * Handles the basic employee information form fields
 */

import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * EmployeeDetailsTab Component
 * @param {Object} props - Component props
 * @param {Object} props.control - React Hook Form control
 * @param {Function} props.register - React Hook Form register function
 * @param {Object} props.errors - Form validation errors
 * @param {Array} props.departments - Available departments
 * @param {Array} props.positions - Available positions
 * @param {Array} props.leaders - Available leaders
 * @param {boolean} props.isEditing - Whether in edit mode
 * @param {boolean} props.loadingLeaders - Loading state for leaders
 * @param {boolean} props.loadingOptions - Loading state for form options
 */
const EmployeeDetailsTab = memo(({
  control,
  register,
  errors,
  departments = [],
  positions = [],
  leaders = [],
  isEditing = false,
  loadingLeaders = false,
  loadingOptions = false
}) => {
  return (
    <div className="space-y-6" role="tabpanel" aria-labelledby="details-tab">
      {/* Basic Information Section */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Basic Employee Information</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employee ID */}
          <div className="space-y-2">
            <Label htmlFor="ashima_id" className="text-sm font-medium">
              Employee ID <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="ashima_id"
              type="text"
              autoComplete="employee-id"
              disabled={isEditing}
              aria-describedby={errors.ashima_id ? 'ashima_id-error' : undefined}
              aria-invalid={!!errors.ashima_id}
              {...register('ashima_id', { 
                required: 'Employee ID is required',
                pattern: {
                  value: /^[A-Za-z0-9-_]+$/,
                  message: 'Employee ID can only contain letters, numbers, hyphens, and underscores'
                }
              })}
            />
            {errors.ashima_id && (
              <p 
                id="ashima_id-error" 
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.ashima_id.message}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Employee ID cannot be changed after creation
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={!!errors.name}
              {...register('name', { 
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters long'
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters'
                }
              })}
            />
            {errors.name && (
              <p 
                id="name-error" 
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Department and Position Section */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Department and Position Information</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Department
            </Label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={loadingOptions}
                >
                  <SelectTrigger 
                    id="department"
                    aria-label="Select department"
                  >
                    <SelectValue placeholder={
                      loadingOptions ? 'Loading departments...' : 'Select department'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 && !loadingOptions ? (
                      <SelectItem value="no-departments" disabled>
                        No departments available
                      </SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem 
                          key={dept.id} 
                          value={dept.id.toString()}
                          title={dept.name}
                        >
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium">
              Position
            </Label>
            <Controller
              name="position_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={loadingOptions}
                >
                  <SelectTrigger 
                    id="position"
                    aria-label="Select position"
                    className="w-full"
                  >
                    <SelectValue 
                      placeholder={
                        loadingOptions ? 'Loading positions...' : 'Select position'
                      }
                      className="truncate"
                    />
                  </SelectTrigger>
                  <SelectContent className="max-w-[300px]">
                    {positions.length === 0 && !loadingOptions ? (
                      <SelectItem value="no-positions" disabled>
                        No positions available
                      </SelectItem>
                    ) : (
                      positions.map((pos) => (
                        <SelectItem 
                          key={pos.id} 
                          value={pos.id.toString()}
                          className="truncate" 
                          title={pos.name}
                        >
                          {pos.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </fieldset>

      {/* Reporting and Status Section */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Reporting and Status Information</legend>
        
        {/* Reporting To */}
        <div className="space-y-2">
          <Label htmlFor="leader" className="text-sm font-medium">
            Reports To
          </Label>
          <Controller
            name="leader"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={loadingLeaders || loadingOptions}
              >
                <SelectTrigger 
                  id="leader"
                  aria-label="Select reporting manager"
                >
                  <SelectValue placeholder={
                    loadingLeaders 
                      ? 'Loading leaders...' 
                      : 'Select reporting manager (optional)'
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {leaders.map((leader) => (
                    <SelectItem 
                      key={leader.id} 
                      value={leader.id.toString()}
                      title={`${leader.name}${leader.position_name ? ` (${leader.position_name})` : ''}`}
                    >
                      {leader.name}
                      {leader.position_name && (
                        <span className="text-muted-foreground ml-1">
                          ({leader.position_name})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {loadingLeaders && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner size="sm" />
              Loading available leaders...
            </div>
          )}
        </div>

        {/* Employment Status and Active Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Employment Status */}
          <div className="space-y-2">
            <Label htmlFor="emp_stat" className="text-sm font-medium">
              Employment Type
            </Label>
            <Controller
              name="emp_stat"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'regular'}
                >
                  <SelectTrigger 
                    id="emp_stat"
                    aria-label="Select employment type"
                  >
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="contractual">Contractual</SelectItem>
                    <SelectItem value="probationary">Probationary</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || 'active'}
                  disabled={!isEditing} // Only allow status change in edit mode
                >
                  <SelectTrigger 
                    id="status"
                    aria-label="Select employee status"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="resigned">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Status can only be changed when editing an existing employee
              </p>
            )}
          </div>
        </div>
      </fieldset>
    </div>
  );
});

EmployeeDetailsTab.displayName = 'EmployeeDetailsTab';

export default EmployeeDetailsTab;
