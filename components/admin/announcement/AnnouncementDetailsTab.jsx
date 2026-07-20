/**
 * Announcement Details Tab Component
 * Handles the basic announcement information form fields
 */

import React, { memo, useState, useRef } from 'react';
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
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const attachmentInputRef = useRef(null);
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
          {/* Announcement text OR file upload */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="announcement" className="text-sm font-medium">
              Announcement (text)
            </Label>
            <Input
              id="announcement"
              type="text"
              autoComplete="announcement"
              aria-describedby={errors.announcement ? 'announcement-error' : undefined}
              aria-invalid={!!errors.announcement}
              {...register('announcement', { 
                required: false,
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

            {/* File / Image upload (optional) */}
            <div className="mt-4">
              <Label htmlFor="attachment" className="text-sm font-medium">Upload file or image (optional)</Label>
              <Controller
                name="attachment"
                control={control}
                rules={{
                  validate: () => true
                }}
                render={({ field }) => {
                  const handleChange = (e) => {
                    const filesList = e.target.files;
                    const files = Array.from(filesList || []);
                    field.onChange(files);
                    setSelectedFiles(files);

                    // revoke previous previews
                    attachmentPreviews.forEach((p) => {
                      try { URL.revokeObjectURL(p.url); } catch (err) {}
                    });

                    const previews = files.map((f) => {
                      return {
                        name: f.name,
                        type: f.type,
                        url: f.type && f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
                      };
                    });
                    setAttachmentPreviews(previews);
                  };

                  const removeFileAt = (index) => {
                    const newFiles = selectedFiles.slice();
                    const removed = newFiles.splice(index, 1);
                    // revoke preview for removed
                    const removedPreview = attachmentPreviews[index];
                    if (removedPreview && removedPreview.url) {
                      try { URL.revokeObjectURL(removedPreview.url); } catch (e) {}
                    }
                    setSelectedFiles(newFiles);
                    setAttachmentPreviews(attachmentPreviews.filter((_, i) => i !== index));
                    field.onChange(newFiles);

                    // also update the underlying input value by creating a DataTransfer
                    if (attachmentInputRef.current) {
                      const dt = new DataTransfer();
                      newFiles.forEach((f) => dt.items.add(f));
                      attachmentInputRef.current.files = dt.files;
                    }
                  };

                  // const removeAll = () => {
                  //   // revoke previews
                  //   attachmentPreviews.forEach((p) => { try { if (p.url) URL.revokeObjectURL(p.url); } catch (e) {} });
                  //   setSelectedFiles([]);
                  //   setAttachmentPreviews([]);
                  //   field.onChange(null);
                  //   if (attachmentInputRef.current) attachmentInputRef.current.value = '';
                  // };

                  return (
                    <div className="mt-2">
                      <input
                        id="attachment"
                        ref={(e) => {
                          attachmentInputRef.current = e;
                          if (typeof field.ref === 'function') field.ref(e);
                        }}
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleChange}
                        className="mt-1"
                      />

                      {errors.attachment && (
                        <p id="attachment-error" className="text-sm text-destructive mt-2" role="alert">
                          {errors.attachment.message}
                        </p>
                      )}

                      {attachmentPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {attachmentPreviews.map((p, idx) => (
                            <div key={`${p.name}-${idx}`} className="flex items-center gap-3">
                              {p.url ? (
                                <img src={p.url} alt={p.name} className="h-24 w-24 object-cover rounded" />
                              ) : (
                                <div className="h-24 w-24 flex items-center justify-center rounded bg-muted text-sm px-2">{p.name}</div>
                              )}
                              <div>
                                <div className="text-sm">{p.name}</div>
                                <button type="button" onClick={() => removeFileAt(idx)} className="text-sm text-cyan-300 underline mt-2">Remove</button>
                              </div>
                            </div>
                          ))}
                          <div className="col-span-full">
                            {/* <button type="button" onClick={removeAll} className="text-sm text-destructive underline">Remove all</button> */}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </div>
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
