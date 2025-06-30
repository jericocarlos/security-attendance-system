/**
 * AttendanceStates Component
 * 
 * Handles and displays various states for the attendance logs view including:
 * - Loading states with skeleton UI
 * - Error states with retry functionality
 * - Empty states with helpful messaging
 * 
 * @component
 */

import { AlertCircle, Database, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Component to display various states (loading, error, empty) for attendance logs
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether data is currently loading
 * @param {string|null} props.error - Error message if any error occurred
 * @param {boolean} props.showEmptyState - Whether to show empty state
 * @param {boolean} props.hasFiltersOrSearch - Whether filters or search are active
 * @param {Function} props.onRefresh - Callback to refresh the data
 * @param {Function} props.onResetFilters - Callback to reset all filters
 */
export default function AttendanceStates({
  loading = false,
  error = null,
  showEmptyState = false,
  hasFiltersOrSearch = false,
  onRefresh,
  onResetFilters,
}) {
  // Don't render anything if we're not in a special state
  if (!loading && !error && !showEmptyState) {
    return null;
  }

  // Loading State
  if (loading) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-12"
        role="status"
        aria-label="Loading attendance logs"
      >
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading attendance logs...
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div 
            className="flex flex-col items-center justify-center py-8 text-center"
            role="alert"
            aria-live="polite"
          >
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Attendance Logs
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {error || "An unexpected error occurred while loading the attendance logs."}
            </p>
            
            <Button 
              onClick={onRefresh}
              variant="outline"
              className="flex items-center gap-2"
              aria-label="Retry loading attendance logs"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (showEmptyState) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-12 text-center"
        role="status"
        aria-label="No attendance logs found"
      >
        <div className="rounded-full bg-muted/50 p-6 mb-6">
          <Database className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {hasFiltersOrSearch ? "No Matching Records" : "No Attendance Logs"}
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          {hasFiltersOrSearch
            ? "No attendance logs match your current search criteria or filters. Try adjusting your search terms or removing some filters."
            : "There are no attendance logs to display. Logs will appear here once employees start recording their attendance."
          }
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {hasFiltersOrSearch && (
            <Button 
              variant="outline" 
              onClick={onResetFilters}
              className="flex items-center gap-2"
              aria-label="Clear all filters and search"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Clear Filters
            </Button>
          )}
          
          <Button 
            onClick={onRefresh}
            variant="default"
            className="flex items-center gap-2"
            aria-label="Refresh attendance logs"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
