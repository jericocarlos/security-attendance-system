/**
 * Employee Form Dialog Component
 * 
 * A comprehensive form dialog for creating and editing employee records.
 * Features include tabbed interface, image upload, form validation, and 
 * accessibility support.
 * 
 * @component
 * @example
 * <EmployeeFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   employee={selectedEmployee}
 *   departments={departments}
 *   positions={positions}
 *   leaders={leaders}
 *   onSubmit={handleSubmit}
 *   isLoadingOptions={loading}
 *   isSubmitting={submitting}
 * />
 */

"use client";

import React, { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeForm } from "@/hooks/useEmployeeForm";
import EmployeeDetailsTab from "./EmployeeDetailsTab";
import EmployeeSettingsTab from "./EmployeeSettingsTab";
import FormErrorDisplay from "./FormErrorDisplay";

/**
 * EmployeeFormDialog Component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Dialog state change handler
 * @param {Object|null} props.employee - Employee data for editing (null for new)
 * @param {Array} props.departments - Available departments
 * @param {Array} props.positions - Available positions  
 * @param {Array} props.leaders - Available leaders
 * @param {Function} props.onSubmit - Form submission handler
 * @param {boolean} props.isLoadingOptions - Loading state for form options
 * @param {boolean} props.isSubmitting - External submission loading state
 */
const EmployeeFormDialog = memo(({
  open,
  onOpenChange,
  employee = null,
  departments = [],
  positions = [],
  leaders = [],
  onSubmit,
  isLoadingOptions = false,
  isSubmitting = false
}) => {
  // Use custom hook for form management
  const {
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting: formIsSubmitting,
    status,
    isResigned,
    imagePreview,
    handleImageChange,
    removeImage,
    activeTab,
    setActiveTab,
    leaders: hookLeaders,
    loadingLeaders,
    submissionError,
    setSubmissionError,
  } = useEmployeeForm(employee, open, onSubmit);

  // Determine if we're in edit mode
  const isEditing = !!employee;
  
  // Combine loading states
  const isFormSubmitting = formIsSubmitting || isSubmitting;

  // Use leaders from hook if not provided as prop
  const availableLeaders = leaders.length > 0 ? leaders : hookLeaders;

  /**
   * Handles dialog close with confirmation if form has changes
   */
  const handleDialogClose = (newOpen) => {
    if (!newOpen && !isFormSubmitting) {
      onOpenChange(false);
    }
  };

  /**
   * Handles keyboard shortcuts
   */
  const handleKeyDown = (event) => {
    // Close dialog on Escape (if not submitting)
    if (event.key === 'Escape' && !isFormSubmitting) {
      handleDialogClose(false);
      return;
    }

    // Save on Ctrl+Enter or Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        aria-labelledby="employee-form-title"
        aria-describedby="employee-form-description"
      >
        <DialogHeader className="space-y-3">
          <DialogTitle id="employee-form-title" className="text-xl font-semibold">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          
          <DialogDescription id="employee-form-description" className="text-base">
            {isEditing 
              ? 'Update the employee information below. Changes will be saved immediately.'
              : 'Fill in the employee details below. All required fields must be completed.'
            }
          </DialogDescription>

          {/* Resigned Employee Notice */}
          {isResigned && isEditing && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Notice:</strong> This employee is marked as resigned. 
                Their RFID tag and photo will be automatically removed and cannot be modified 
                until the status is changed.
              </p>
            </div>
          )}

          {/* Form Error Display */}
          <FormErrorDisplay 
            error={submissionError}
            onDismiss={() => setSubmissionError(null)}
          />
        </DialogHeader>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="details"
                id="details-tab"
                aria-controls="details-panel"
              >
                Employee Details
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                id="settings-tab"
                aria-controls="settings-panel"
              >
                RFID & Photo
              </TabsTrigger>
            </TabsList>

            {/* Employee Details Tab */}
            <TabsContent 
              value="details" 
              className="mt-6"
              id="details-panel"
              aria-labelledby="details-tab"
            >
              <EmployeeDetailsTab
                control={control}
                register={register}
                errors={errors}
                departments={departments}
                positions={positions}
                leaders={availableLeaders}
                isEditing={isEditing}
                loadingLeaders={loadingLeaders}
                loadingOptions={isLoadingOptions}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent 
              value="settings" 
              className="mt-6"
              id="settings-panel"
              aria-labelledby="settings-tab"
            >
              <EmployeeSettingsTab
                register={register}
                errors={errors}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={removeImage}
                isResigned={isResigned}
                status={status}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDialogClose(false)}
              disabled={isFormSubmitting}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              disabled={isFormSubmitting || isLoadingOptions}
              className="order-1 sm:order-2"
              aria-describedby={isFormSubmitting ? 'submit-status' : undefined}
            >
              {isFormSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                `${isEditing ? 'Update' : 'Create'} Employee`
              )}
            </Button>
            
            {/* Screen reader status */}
            {isFormSubmitting && (
              <span id="submit-status" className="sr-only" aria-live="polite">
                Saving employee information, please wait...
              </span>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

EmployeeFormDialog.displayName = 'EmployeeFormDialog';

export default EmployeeFormDialog;