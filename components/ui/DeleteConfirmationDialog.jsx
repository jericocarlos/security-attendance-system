/**
 * DeleteConfirmationDialog Component
 * 
 * A reusable confirmation dialog for delete operations with consistent styling,
 * accessibility features, and customizable content.
 * 
 * Features:
 * - Accessible design with proper ARIA labels
 * - Keyboard navigation support
 * - Customizable title, description, and button text
 * - Loading state support
 * - Destructive action styling
 * 
 * @component
 */

import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Delete confirmation dialog component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Callback when dialog open state changes
 * @param {Function} props.onConfirm - Callback when delete is confirmed
 * @param {boolean} props.loading - Whether the delete operation is in progress
 * @param {string} props.title - Dialog title (default: "Confirm Deletion")
 * @param {string} props.description - Main description text
 * @param {string} props.itemName - Name of the item being deleted (for highlighting)
 * @param {string} props.itemType - Type of item being deleted (e.g., "employee", "permission")
 * @param {string} props.warningText - Additional warning text
 * @param {string} props.confirmButtonText - Text for confirm button (default: "Delete")
 * @param {string} props.cancelButtonText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.destructive - Whether this is a destructive action (default: true)
 * @param {Array} props.consequences - List of consequences to display
 */
export default function DeleteConfirmationDialog({
  open = false,
  onOpenChange,
  onConfirm,
  loading = false,
  title = "Confirm Deletion",
  description,
  itemName,
  itemType,
  warningText,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
  destructive = true,
  consequences = [],
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  /**
   * Handles the confirm action with loading state
   */
  const handleConfirm = async () => {
    if (loading || isConfirming) return;
    
    setIsConfirming(true);
    try {
      await onConfirm?.();
    } finally {
      setIsConfirming(false);
    }
  };

  /**
   * Handles dialog close
   */
  const handleClose = () => {
    if (loading || isConfirming) return;
    onOpenChange?.(false);
  };

  /**
   * Handles keyboard events for accessibility
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleConfirm();
    }
  };

  const isProcessing = loading || isConfirming;

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      onKeyDown={handleKeyDown}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          if (isProcessing) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isProcessing) {
            e.preventDefault();
          }
        }}
        aria-describedby="delete-dialog-description"
      >
        <DialogHeader className="space-y-3">
          {/* Header with icon */}
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${
              destructive 
                ? 'bg-red-100 text-red-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {destructive ? (
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>

          {/* Description */}
          <DialogDescription 
            id="delete-dialog-description"
            className="text-sm text-muted-foreground space-y-3"
          >
            {/* Main description */}
            {description && (
              <p>{description}</p>
            )}

            {/* Item being deleted */}
            {itemName && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {itemType ? `${itemType}:` : 'Item:'}
                </span>
                <Badge variant="secondary" className="font-mono">
                  {itemName}
                </Badge>
              </div>
            )}

            {/* Warning text */}
            {warningText && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{warningText}</p>
              </div>
            )}

            {/* Consequences list */}
            {consequences.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                  {consequences.map((consequence, index) => (
                    <li key={index} className="text-muted-foreground">
                      {consequence}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Irreversible warning */}
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border-l-2 border-muted">
              <strong>Note:</strong> This action cannot be undone.
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {cancelButtonText}
          </Button>
          
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto"
            aria-describedby="confirm-button-help"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                {destructive ? 'Deleting...' : 'Processing...'}
              </>
            ) : (
              confirmButtonText
            )}
          </Button>
          
          {/* Keyboard shortcut hint */}
          <div id="confirm-button-help" className="sr-only">
            Press Ctrl+Enter to confirm deletion
          </div>
        </DialogFooter>

        {/* Loading overlay */}
        {isProcessing && (
          <div 
            className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg"
            aria-live="polite"
            aria-label="Processing deletion"
          >
            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              Processing...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
