'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import ListTable from './ListTable';
import AddEditDialog from './AddEditDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PositionList() {
  const [positions, setPositions] = useState([]);
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
  const [leaderFilter, setLeaderFilter] = useState("all"); // Add leader filter state

  // Debounce search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
      fetchPositions(1, pagination.limit, value, leaderFilter);
    }, 300),
    [pagination.limit, leaderFilter]
  );

  useEffect(() => {
    fetchPositions(pagination.page, pagination.limit, searchQuery, leaderFilter);
  }, [pagination.page, pagination.limit, leaderFilter]); // Add leaderFilter to dependency array
  
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleLeaderFilterChange = (value) => {
    setLeaderFilter(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const fetchPositions = async (page, limit, search = "", leaderFilter = "all") => {
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
      
      // Add leader filter parameter
      if (leaderFilter !== "all") {
        searchParams.append('isLeader', leaderFilter === "leaders" ? "1" : "0");
      }
      
      const response = await fetch(`/api/admin/positions?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      
      const data = await response.json();
      setPositions(data.positions);
      setPagination(prev => ({
        ...prev,
        page: page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Failed to load positions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newPosition) => {
    try {
      const response = await fetch('/api/admin/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPosition,
          is_leader: newPosition.is_leader ? 1 : 0, // Ensure it's 1 or 0
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add position');
      }
      
      // Refresh the current page
      fetchPositions(pagination.page, pagination.limit, searchQuery);
      
      enqueueSnackbar('Position added successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to add position', { variant: 'error' });
    }
  };

  const handleEdit = async (updatedPosition) => {
    try {
      const response = await fetch(`/api/admin/positions/${updatedPosition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedPosition,
          is_leader: updatedPosition.is_leader ? 1 : 0,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update position');
      }
      
      // Update in the current list
      setPositions(
        positions.map((pos) =>
          pos.id === updatedPosition.id ? updatedPosition : pos
        )
      );
      setItemToEdit(null);
      enqueueSnackbar('Position updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to update position', { variant: 'error' });
    }
  };

  const handlePageChange = (newPage) => {
    fetchPositions(newPage, pagination.limit, searchQuery);
  };

  const handleEditClick = (item) => {
    setItemToEdit(item);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/admin/positions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete position');
      }
      
      // If we're on the last page and delete the only item, go to previous page
      if (positions.length === 1 && pagination.page > 1) {
        fetchPositions(pagination.page - 1, pagination.limit, searchQuery);
      } else {
        // Otherwise just refresh the current page
        fetchPositions(pagination.page, pagination.limit, searchQuery);
      }
      
      enqueueSnackbar('Position deleted successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to delete position', { variant: 'error' });
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

  // Create the filter component to pass to ListTable
  const leaderFilterComponent = (
    <div className="flex items-center space-x-2">
      <Label htmlFor="leader-filter" className="text-sm whitespace-nowrap">Filter:</Label>
      <Select 
        value={leaderFilter} 
        onValueChange={handleLeaderFilterChange}
      >
        <SelectTrigger id="leader-filter" className="w-[150px]">
          <SelectValue placeholder="All Positions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="leaders">Leaders</SelectItem>
          <SelectItem value="non-leaders">Non-Leaders</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      <ListTable
        items={positions}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onAdd={handleOpenAddDialog}
        itemName="Position"
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filterComponent={leaderFilterComponent} // Pass the filter component
      />
      
      <AddEditDialog 
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setItemToEdit(null);
        }}
        onSave={handleSave}
        itemName="Position" 
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