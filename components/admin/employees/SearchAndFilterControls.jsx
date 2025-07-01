/**
 * Search and filter controls for employee management
 * Provides a clean interface for searching and filtering employees
 */

import React, { memo } from 'react';
import { FiFilter, FiRefreshCw, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/**
 * SearchAndFilterControls Component
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Handler for search input changes
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onOpenFilter - Handler to open filter dialog
 * @param {Function} props.onResetFilters - Handler to reset all filters
 * @param {Function} props.onRefresh - Handler to refresh data
 * @param {boolean} props.loading - Loading state
 */
const SearchAndFilterControls = memo(({
  searchQuery,
  onSearchChange,
  filters,
  onOpenFilter,
  onResetFilters,
  onRefresh,
  loading = false
}) => {
  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  /**
   * Handles search input changes with debouncing consideration
   * @param {Event} event - Input change event
   */
  const handleSearchChange = (event) => {
    onSearchChange(event.target.value);
  };

  /**
   * Handles keyboard navigation for search input
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      onSearchChange('');
      event.target.blur();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Input
          type="search"
          placeholder="Search employees by name, email, or employee ID..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          className="pl-4 pr-10"
          aria-label="Search employees"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <Badge variant="secondary" className="mr-2">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
          </Badge>
        )}

        {/* Filter Dialog Button */}
        <Button
          variant="outline"
          onClick={onOpenFilter}
          disabled={loading}
          aria-label={`Open filter dialog${hasActiveFilters ? ` (${activeFiltersCount} active)` : ''}`}
        >
          <FiFilter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Refresh Button */}
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh employee data"
        >
          <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
});

SearchAndFilterControls.displayName = 'SearchAndFilterControls';

export default SearchAndFilterControls;
