/**
 * AttendanceHeader Component
 * 
 * Renders the header section of the attendance logs page with title, search, filter, and export controls.
 * Includes accessibility features like ARIA labels and keyboard navigation support.
 * 
 * @component
 */

import { FiFilter, FiDownload, FiSearch, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * Header component for attendance logs with search, filter, and export functionality
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFilterClick - Callback when filter button is clicked
 * @param {Function} props.onExportClick - Callback when export button is clicked  
 * @param {Function} props.onSearchChange - Callback when search input changes
 * @param {boolean} props.exporting - Whether export is in progress
 * @param {boolean} props.hasActiveFilters - Whether there are active filters applied
 * @param {Function} props.onResetFilters - Callback to reset all filters
 */
export default function AttendanceHeader({
  onFilterClick,
  onExportClick,
  onSearchChange,
  exporting = false,
  hasActiveFilters = false,
  onResetFilters,
}) {
  /**
   * Handles search input changes with proper event handling
   * @param {Event} e - Input change event
   */
  const handleSearchInputChange = (e) => {
    onSearchChange?.(e.target.value);
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-4">
        <CardTitle className="text-2xl font-semibold">
          Attendance Logs
        </CardTitle>
        
        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              Filters Active
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-4 w-4 p-0 hover:bg-transparent"
                aria-label="Clear all filters"
                title="Clear all filters"
              >
                <FiX className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div 
        className="flex items-center gap-4"
        role="group"
        aria-label="Attendance logs controls"
      >
        {/* Search Input */}
        <div className="relative">
          <FiSearch 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by name or ASHIMA ID..."
            className="pl-10 w-64"
            onChange={handleSearchInputChange}
            aria-label="Search attendance logs by employee name or ASHIMA ID"
          />
        </div>

        {/* Filter Button */}
        <Button
          variant="outline"
          onClick={onFilterClick}
          aria-label="Open filters dialog"
          className="flex items-center gap-2"
        >
          <FiFilter className="h-4 w-4" aria-hidden="true" />
          Filter
        </Button>

        {/* Export Button */}
        <Button 
          variant="outline" 
          onClick={onExportClick}
          disabled={exporting}
          aria-label={exporting ? "Exporting logs..." : "Export logs to CSV"}
          className="flex items-center gap-2"
        >
          <FiDownload className="h-4 w-4" aria-hidden="true" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
    </CardHeader>
  );
}
