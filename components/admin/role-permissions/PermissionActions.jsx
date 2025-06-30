import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Save, RotateCcw } from "lucide-react";

/**
 * Action buttons for permission management
 * @param {Object} props - Component props
 * @param {function} props.onSave - Save handler
 * @param {function} props.onRefresh - Refresh handler
 * @param {boolean} props.saving - Save loading state
 * @param {boolean} props.refreshing - Refresh loading state
 * @param {boolean} props.hasChanges - Whether there are unsaved changes
 */
export default function PermissionActions({ 
  onSave, 
  onRefresh, 
  saving = false, 
  refreshing = false,
  hasChanges = false 
}) {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onRefresh} 
        variant="outline"
        disabled={refreshing || saving}
        aria-label="Refresh permissions data"
      >
        {refreshing ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        Refresh
      </Button>
      
      <Button 
        onClick={onSave} 
        disabled={saving || !hasChanges}
        aria-label={hasChanges ? "Save changes to permissions" : "No changes to save"}
        className={hasChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
      >
        {saving ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
