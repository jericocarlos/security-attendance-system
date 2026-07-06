/**
 * Form Error Display Component
 * Provides accessible error messaging for forms
 */

import React, { memo } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * FormErrorDisplay Component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Function} props.onDismiss - Error dismissal handler
 * @param {string} props.className - Additional CSS classes
 */
const FormErrorDisplay = memo(({ 
  error, 
  onDismiss,
  className = '' 
}) => {
  if (!error) return null;

  return (
    <Card className={`border-destructive bg-destructive/5 ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <FiAlertCircle 
            className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" 
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm text-destructive font-medium"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          </div>
          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
              aria-label="Dismiss error"
            >
              <FiX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

FormErrorDisplay.displayName = 'FormErrorDisplay';

export default FormErrorDisplay;
