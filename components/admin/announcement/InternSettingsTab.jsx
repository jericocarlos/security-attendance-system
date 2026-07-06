/**
 * Intern Settings Tab Component
 * Handles RFID tag and photo upload functionality
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { FiX, FiUpload, FiAlertTriangle } from 'react-icons/fi';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * InternSettingsTab Component
 * @param {Object} props - Component props
 * @param {Function} props.register - React Hook Form register function
 * @param {Object} props.errors - Form validation errors
 * @param {string} props.imagePreview - Current image preview URL
 * @param {Function} props.onImageChange - Image change handler
 * @param {Function} props.onImageRemove - Image removal handler
 * @param {boolean} props.isDiscontinued - Whether intern is discontinued
 * @param {string} props.status - Current intern status
 */
const InternSettingsTab = memo(({
  register,
  errors,
  imagePreview,
  onImageChange,
  onImageRemove,
  isDiscontinued = false,
  status = 'active'
}) => {
  /**
   * Handles file input change with validation
   * @param {Event} event - File input change event
   */
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(event);
    }
  };

  /**
   * Handles drag and drop functionality
   * @param {DragEvent} event - Drag event
   */
  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Create a synthetic event for the file input
        const syntheticEvent = {
          target: { files: [file] }
        };
        onImageChange(syntheticEvent);
      }
    }
  };

  /**
   * Prevents default drag behavior
   * @param {DragEvent} event - Drag event
   */
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6" role="tabpanel" aria-labelledby="settings-tab">
      {/* Discontinued Intern Warning */}
      {isDiscontinued && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  Discontinued Intern Notice
                </p>
                <p className="text-amber-700">
                  RFID tag and photo are automatically removed for discontinued interns 
                  and cannot be modified until the status is changed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">Intern Photo</legend>
        
        <div className="space-y-4">
          <Label htmlFor="photo" className="text-sm font-medium">
            Profile Photo
            {isDiscontinued && (
              <span className="ml-2 text-amber-600 font-normal">
                (Removed for discontinued interns)
              </span>
            )}
          </Label>

          {/* Photo Upload Area */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* File Input or Drop Zone */}
            <div className="flex-1 w-full">
              {!isDiscontinued ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <FiUpload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-2 cursor-pointer"
                      aria-describedby="photo-help"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center bg-muted/30">
                  <FiAlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Photo upload disabled for discontinued interns
                  </p>
                </div>
              )}
              
              <p id="photo-help" className="text-xs text-muted-foreground mt-2">
                Recommended: Square image, minimum 200x200 pixels for best display quality
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative flex-shrink-0">
                <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                  <Image
                    src={imagePreview}
                    alt="Intern photo preview"
                    fill
                    className="rounded-lg object-cover border"
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
                {!isDiscontinued && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow-md"
                    onClick={onImageRemove}
                    aria-label="Remove photo"
                  >
                    <FiX className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* RFID Tag Section */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">RFID Configuration</legend>
        
        <div className="space-y-2">
          <Label htmlFor="rfid_tag" className="text-sm font-medium">
            RFID Tag Number
            {!isDiscontinued && (
              <span className="text-destructive ml-1" aria-label="required">*</span>
            )}
            {isDiscontinued && (
              <span className="ml-2 text-amber-600 font-normal">
                (Removed for discontinued interns)
              </span>
            )}
          </Label>
          
          <Input
            id="rfid_tag"
            type="text"
            placeholder={isDiscontinued ? 'RFID tag removed' : 'Enter RFID tag number'}
            disabled={isDiscontinued}
            aria-describedby={
              errors.rfid_tag ? 'rfid_tag-error' : 'rfid_tag-help'
            }
            aria-invalid={!!errors.rfid_tag}
            className={isDiscontinued ? 'bg-muted' : ''}
            {...register('rfid_tag', {
              required: !isDiscontinued ? 'RFID Tag is required for active interns' : false,
              pattern: {
                value: /^[A-Fa-f0-9]+$/,
                message: 'RFID tag must contain only hexadecimal characters (0-9, A-F)'
              },
              minLength: {
                value: 8,
                message: 'RFID tag must be at least 8 characters long'
              },
              maxLength: {
                value: 20,
                message: 'RFID tag must be less than 20 characters long'
              }
            })}
          />
          
          {errors.rfid_tag && (
            <p 
              id="rfid_tag-error" 
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.rfid_tag.message}
            </p>
          )}
          
          {!errors.rfid_tag && (
            <p id="rfid_tag-help" className="text-xs text-muted-foreground">
              {isDiscontinued
                ? 'RFID tag is automatically removed for discontinued interns'
                : 'Enter the unique RFID tag identifier. This will be used for claiming free meals.'
              }
            </p>
          )}
        </div>

        {/* RFID Tag Guidelines */}
        {!isDiscontinued && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-2">
                  RFID Tag Guidelines:
                </p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside">
                  <li>Each intern must have a unique RFID tag</li>
                  <li>Tag numbers are case-insensitive</li>
                  <li>Only hexadecimal characters are allowed (0-9, A-F)</li>
                  <li>Contact IT support if you need help obtaining an RFID tag</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </fieldset>
    </div>
  );
});

InternSettingsTab.displayName = 'InternSettingsTab';

export default InternSettingsTab;
