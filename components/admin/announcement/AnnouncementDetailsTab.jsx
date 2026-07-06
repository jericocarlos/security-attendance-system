/**
 * Announcement Details Tab Component
 * Handles the basic announcement information form fields
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
 * AnnouncementDetailsTab Component
 * @param {Object} props - Component props
 * @param {Object} props.control - React Hook Form control
 * @param {Function} props.register - React Hook Form register function
 * @param {Object} props.errors - Form validation errors
 * @param {boolean} props.isEditing - Whether in edit mode
 * @param {boolean} props.loadingOptions - Loading state for form options
 */
const AnnouncementDetailsTab = memo(({
  control,
  register,
  errors,
  isEditing = false,
  loadingOptions = false
}) => {
  return (
    <div className="space-y-6" role="tabpanel" aria-labelledby="details-tab">
      {/* Basic Information Section */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Basic Title Information</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              autoComplete="title-id"
              disabled={isEditing}
              aria-describedby={errors.title ? 'ashima_id-error' : undefined}
              aria-invalid={!!errors.title}
              {...register('title', { 
                required: 'Title is required',
                pattern: {
                  value: /^[A-Za-z0-9\- _]+$/,
                  message: 'Title can only contain letters, numbers, spaces, hyphens, and underscores'
                }
              })}
            />
            {errors.title && (
              <p 
                id="title-error" 
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Announcement Section */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Announcement Information</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Announcement */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="announcement" className="text-sm font-medium">
              Announcement <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="announcement"
              type="text"
              autoComplete="announcement"
              aria-describedby={errors.announcement ? 'announcement-error' : undefined}
              aria-invalid={!!errors.announcement}
              {...register('announcement', { 
                required: 'Announcement is required',
                minLength: {
                  value: 2,
                  message: 'Announcement must be at least 2 characters long'
                },
                maxLength: {
                  value: 500,
                  message: 'Announcement must be less than 500 characters'
                }
              })}
            />
            {errors.announcement && (
              <p 
                id="announcement-error" 
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.announcement.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Status Section */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Status Information</legend>
        {/* Active Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => {
                const statusValue = ['disabled', 'inactive', 'discontinued'].includes(field.value)
                  ? 'disabled'
                  : 'enabled';

                return (
                  <Select
                    onValueChange={field.onChange}
                    value={statusValue}
                    disabled={!isEditing} // Only allow status change in edit mode
                  >
                    <SelectTrigger 
                      id="status"
                      className="w-full"
                      aria-label="Select announcement status"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Status can only be changed when editing an existing announcement
              </p>
            )}
          </div>
        </div>
      </fieldset>
    </div>
  );
});

AnnouncementDetailsTab.displayName = 'AnnouncementDetailsTab';

export default AnnouncementDetailsTab;
