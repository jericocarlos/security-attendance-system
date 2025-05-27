'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from "lucide-react";
import { useSnackbar } from 'notistack';
import ListTable from './ListTable';
import AddEditDialog from './AddEditDialog';

export default function SupervisorList() {
  const [supervisors, setSupervisors] = useState([]);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Debounce search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
      fetchSupervisors(1, pagination.limit, value);
    }, 300),
    [pagination.limit]
  );

  useEffect(() => {
    fetchSupervisors(pagination.page, pagination.limit, searchQuery);
  }, [pagination.page, pagination.limit]);
  
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const fetchSupervisors = async (page, limit, search = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        page: page,
        limit: limit
      });
      
      if (search) {
        searchParams.append('search', search);
      }
      
      const response = await fetch(`/api/admin/supervisors?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch supervisors');
      }
      
      const data = await response.json();
      setSupervisors(data.supervisors);
      setPagination(prev => ({
        ...prev,
        page: page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Failed to load supervisors', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newSupervisor) => {
    try {
      const response = await fetch('/api/admin/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupervisor),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add supervisor');
      }
      
      // Refresh the current page
      fetchSupervisors(pagination.page, pagination.limit, searchQuery);
      
      enqueueSnackbar('Supervisor added successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to add supervisor', { variant: 'error' });
    }
  };

  const handleEdit = async (updatedSupervisor) => {
    try {
      const response = await fetch(`/api/admin/supervisors/${updatedSupervisor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSupervisor),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update supervisor');
      }
      
      // Update in the current list
      setSupervisors(
        supervisors.map((sup) =>
          sup.id === updatedSupervisor.id ? updatedSupervisor : sup
        )
      );
      setItemToEdit(null);
      enqueueSnackbar('Supervisor updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to update supervisor', { variant: 'error' });
    }
  };

  const handlePageChange = (newPage) => {
    fetchSupervisors(newPage, pagination.limit, searchQuery);
  };

  const handleEditClick = (item) => {
    setItemToEdit(item);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/supervisors/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete supervisor');
      }
      
      // If we're on the last page and delete the only item, go to previous page
      if (supervisors.length === 1 && pagination.page > 1) {
        fetchSupervisors(pagination.page - 1, pagination.limit, searchQuery);
      } else {
        // Otherwise just refresh the current page
        fetchSupervisors(pagination.page, pagination.limit, searchQuery);
      }
      
      enqueueSnackbar('Supervisor deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to delete supervisor', { variant: 'error' });
    }
  };

  const handleOpenAddDialog = () => {
    setItemToEdit(null);
    setIsAddDialogOpen(true);
  };

  const handleSave = async (item) => {
    if (item.id) {
      await handleEdit(item);
    } else {
      await handleAdd(item);
    }
    setIsAddDialogOpen(false);
  };

  if (error && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <ListTable
        items={supervisors}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onAdd={handleOpenAddDialog}
        itemName="Leader"
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      
      <AddEditDialog 
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setItemToEdit(null);
        }}
        onSave={handleSave}
        itemName="Leader" 
        editItem={itemToEdit}
      />
    </div>
  );
}

// Debounce utility function
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}