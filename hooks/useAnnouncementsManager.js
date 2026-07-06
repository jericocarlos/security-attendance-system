/**
 * Custom hook for managing announcement data, state, and operations
 * Centralizes all announcement-related business logic and API calls
 */

import { useState, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';

/**
 * Hook for managing announcements data and operations
 * @returns {Object} Announcement management state and functions
 */
export const useAnnouncementsManager = () => {
  // Core data state
  const [announcements, setAnnouncements] = useState([]);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ 
    department: '', 
    position: '', 
    status: '' 
  });
  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: 10 
  });
  
  // Metadata state
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  
  // Dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  
  // Error state
  const [error, setError] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Fetches announcements with current filters and pagination
   */
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        department: filters.department || '',
        position: filters.position || '',
        status: filters.status || '',
      });

      const response = await fetch(`/api/admin/announcements?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch announcements');
      }
      
      const data = await response.json();
      setAnnouncements(data.data || []);
      setTotalAnnouncements(data.total || 0);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to fetch announcements', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, searchQuery, enqueueSnackbar]);

  /**
   * Fetches metadata (departments, positions) for form options
   */
  const fetchMetadata = useCallback(async () => {
    try {
      setLoadingMetadata(true);
      setError(null);
      
      const [deptResponse, posResponse] = await Promise.all([
        fetch('/api/admin/departments'),
        fetch('/api/admin/positions'),
      ]);
      
      if (!deptResponse.ok || !posResponse.ok) {
        throw new Error('Failed to fetch form options');
      }
      
      const [deptData, posData] = await Promise.all([
        deptResponse.json(),
        posResponse.json(),
      ]);
      
      setDepartments(deptData.departments || []);
      setPositions(posData.positions || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setError(error.message);
      enqueueSnackbar('Failed to load form options', { variant: 'error' });
    } finally {
      setLoadingMetadata(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Handles announcement form submission (create/update)
   * @param {Object} formData - Announcement form data
   */
  const handleAnnouncementSubmit = useCallback(async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      const method = currentAnnouncement ? 'PUT' : 'POST';
      const url = currentAnnouncement 
        ? `/api/admin/announcements/${currentAnnouncement.id}`
        : '/api/admin/announcements';

      const apiData = {
        ...formData,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save announcement');
      }

      // Close dialog and refresh data
      setIsFormDialogOpen(false);
      setCurrentAnnouncement(null);
      await fetchAnnouncements();
      
      enqueueSnackbar(
        `Announcement ${currentAnnouncement ? 'updated' : 'created'} successfully`, 
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Error submitting announcement data:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to save announcement', { 
        variant: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  }, [currentAnnouncement, fetchAnnouncements, enqueueSnackbar]);

  
  /**
   * Deletes an announcement
   * @param {Object} announcement - Announcement to delete
   */
  const deleteAnnouncement = useCallback(async (announcement) => {
    if (!announcement?.id) {
      enqueueSnackbar('Announcement ID is required for deletion', { variant: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Primary attempt: use RESTful dynamic route
      let response;
      try {
        response = await fetch(`/api/admin/announcements/${announcement.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (fetchErr) {
        // Network-level failure (route may not exist). Try query-param fallback.
        console.warn('Primary DELETE failed, trying fallback:', fetchErr);
        response = await fetch(`/api/admin/announcements?id=${announcement.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        let errorMessage = 'Failed to delete announcement';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Refresh data
      await fetchAnnouncements();
      
      enqueueSnackbar('Announcement deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to delete announcement', { 
        variant: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  }, [fetchAnnouncements, enqueueSnackbar]);
  
  /**
   * Opens the announcement form dialog
   * @param {Object|null} announcement - Announcement to edit, or null for new announcement
   */
  const openAnnouncementForm = useCallback((announcement = null) => {
    setCurrentAnnouncement(announcement);
    setIsFormDialogOpen(true);
  }, []);

  /**
   * Resets all filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters({ department: '', position: '', status: '' });
    setSearchQuery('');
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  /**
   * Refreshes announcement data
   */
  const refreshAnnouncements = useCallback(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);
  // Initial data loading
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    // Data state
    announcements,
    totalAnnouncements,
    departments,
    positions,
    
    // Loading states
    loading,
    loadingMetadata,
    submitting,
    
    // Filter and search state
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    
    // Dialog state
    isFormDialogOpen,
    setIsFormDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    currentAnnouncement,
    
    // Error state
    error,
    setError,
    
    // Actions
    handleAnnouncementSubmit,
    deleteAnnouncement,
    openAnnouncementForm,
    resetFilters,
    refreshAnnouncements,
    fetchAnnouncements,
    fetchMetadata,
  };
};
