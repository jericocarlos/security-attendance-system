/**
 * Announcement Form Dialog Component
 * 
 * A comprehensive form dialog for creating and editing announcement records.
 * Features include tabbed interface, form validation, and 
 * accessibility support.
 * 
 * @component
 * @example
 * <AnnouncementFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   announcement={selectedAnnouncement}
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
import { useAnnouncementForm } from "@/hooks/useAnnouncementForm";
import AnnouncementDetailsTab from "./AnnouncementDetailsTab";
import InternSettingsTab from "./InternSettingsTab";
import FormErrorDisplay from "./FormErrorDisplay";

/**
 * AnnouncementFormDialog Component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Dialog state change handler
 * @param {Object|null} props.announcement - Announcement data for editing (null for new)
 * @param {Function} props.onSubmit - Form submission handler
 * @param {boolean} props.isLoadingOptions - Loading state for form options
 * @param {boolean} props.isSubmitting - External submission loading state
 */
const AnnouncementFormDialog = memo(({
  open,
  onOpenChange,
  announcement = null,
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
    activeTab,
    setActiveTab,
    submissionError,
    setSubmissionError,
  } = useAnnouncementForm(announcement, open, onSubmit);

  // Determine if we're in edit mode
  const isEditing = !!announcement;
  
  // Combine loading states
  const isFormSubmitting = formIsSubmitting || isSubmitting;

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
        aria-labelledby="intern-form-title"
        aria-describedby="intern-form-description"
      >
        <DialogHeader className="space-y-3">
          <DialogTitle id="intern-form-title" className="text-xl font-semibold">
            {isEditing ? 'Edit Announcement' : 'Add New Announcement'}
          </DialogTitle>
          
          <DialogDescription id="intern-form-description" className="text-base">
            {isEditing 
              ? 'Update the announcement information below. Changes will be saved immediately.'
              : 'Fill in the announcement details below. All required fields must be completed.'
            }
          </DialogDescription>

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
                Announcement Details
              </TabsTrigger>
            </TabsList>

            {/* Announcement Details Tab */}
            <TabsContent 
              value="details" 
              className="mt-6"
              id="details-panel"
              aria-labelledby="details-tab"
            >
              <AnnouncementDetailsTab
                control={control}
                register={register}
                errors={errors}
                isEditing={isEditing}
                loadingOptions={isLoadingOptions}
              />
            </TabsContent>

            {/* Settings Tab */}
            {/* <TabsContent 
              value="settings" 
              className="mt-6"
              id="settings-panel"
              aria-labelledby="settings-tab"
            >
              <InternSettingsTab
                register={register}
                errors={errors}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={removeImage}
                isDiscontinued={isDiscontinued}
                status={status}
              />
            </TabsContent> */}
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
                `${isEditing ? 'Update' : 'Create'} Announcement`
              )}
            </Button>
            
            {/* Screen reader status */}
            {isFormSubmitting && (
              <span id="submit-status" className="sr-only" aria-live="polite">
                Saving announcement information, please wait...
              </span>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

AnnouncementFormDialog.displayName = 'AnnouncementFormDialog';

export default AnnouncementFormDialog;