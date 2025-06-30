/**
 * Custom hook for managing attendance logs data, state, and operations
 * Centralizes all attendance logs related business logic and API calls
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const useDebounce = (func, delay = 300) => {
  const debouncedFunc = useMemo(() => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, [func, delay]);

  return debouncedFunc;
};

/**
 * Hook for managing attendance logs data and operations
 * @returns {Object} Attendance logs management state and functions
 */
export const useAttendanceLogsManager = () => {
  // Core data state
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [departments, setDepartments] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    logType: '',
    department: '',
    dateRange: { from: null, to: null },
  });
  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: 100 
  });
  
  // Dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Fetches attendance logs with current filters and pagination
   */
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchQuery,
        log_type: filters.logType || '',
        department: filters.department || '',
        start_date: filters.dateRange.from
          ? filters.dateRange.from.toISOString().split('T')[0]
          : '',
        end_date: filters.dateRange.to
          ? filters.dateRange.to.toISOString().split('T')[0]
          : '',
      });

      const response = await fetch(`/api/admin/attendance-logs?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch attendance logs');
      }
      
      const data = await response.json();
      setLogs(data.data || []);
      setTotalLogs(data.total || 0);
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to fetch attendance logs', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, searchQuery, enqueueSnackbar]);

  /**
   * Fetches departments for filter options
   */
  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingDepartments(true);
      setError(null);
      
      const response = await fetch('/api/admin/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.message);
      enqueueSnackbar('Failed to load departments for filtering', { 
        variant: 'error' 
      });
    } finally {
      setLoadingDepartments(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Handles search query updates with debouncing
   */
  const handleSearchQueryUpdate = useCallback((query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const debouncedSearchUpdate = useDebounce(handleSearchQueryUpdate, 500);

  /**
   * Handles search input changes
   * @param {string} value - Search input value
   */
  const handleSearchChange = useCallback((value) => {
    debouncedSearchUpdate(value);
  }, [debouncedSearchUpdate]);

  /**
   * Exports attendance logs as CSV
   */
  const handleExportLogs = useCallback(async () => {
    try {
      setExporting(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        page: 1,
        limit: 10000, // Export all matching logs
        search: searchQuery,
        log_type: filters.logType || '',
        department: filters.department || '',
        start_date: filters.dateRange.from
          ? filters.dateRange.from.toISOString().split('T')[0]
          : '',
        end_date: filters.dateRange.to
          ? filters.dateRange.to.toISOString().split('T')[0]
          : '',
      });

      const response = await fetch(`/api/admin/attendance-logs/export?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export logs');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Add timestamp to filename for better organization
      const date = new Date().toISOString().split('T')[0];
      link.download = `attendance_logs_${date}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      enqueueSnackbar('Attendance logs exported successfully', { 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to export logs', { 
        variant: 'error' 
      });
    } finally {
      setExporting(false);
    }
  }, [searchQuery, filters, enqueueSnackbar]);

  /**
   * Opens the filter dialog
   */
  const openFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(true);
  }, []);

  /**
   * Resets all filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters({
      logType: '',
      department: '',
      dateRange: { from: null, to: null },
    });
    setSearchQuery('');
    setPagination({ pageIndex: 0, pageSize: 100 });
  }, []);

  /**
   * Refreshes attendance logs data
   */
  const refreshLogs = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  /**
   * Computed values for UI state
   */
  const computedValues = useMemo(() => {
    const hasActiveFilters = Boolean(
      filters.logType || 
      filters.department || 
      filters.dateRange.from || 
      filters.dateRange.to
    );
    const hasSearchQuery = searchQuery.trim().length > 0;
    const hasFiltersOrSearch = hasActiveFilters || hasSearchQuery;
    const showEmptyState = !loading && logs.length === 0;
    
    return {
      hasActiveFilters,
      hasSearchQuery,
      hasFiltersOrSearch,
      showEmptyState,
    };
  }, [filters, searchQuery, loading, logs.length]);

  // Initial data loading
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    // Data state
    logs,
    totalLogs,
    departments,
    
    // Loading states
    loading,
    loadingDepartments,
    exporting,
    
    // Filter and search state
    searchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    
    // Dialog state
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    
    // Error state
    error,
    setError,
    
    // Computed values
    computedValues,
    
    // Actions
    handleSearchChange,
    handleExportLogs,
    openFilterDialog,
    resetFilters,
    refreshLogs,
    fetchLogs,
    fetchDepartments,
  };
};
