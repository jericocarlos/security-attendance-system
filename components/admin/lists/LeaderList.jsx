'use client';

import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import ListTable from "./ListTable";

export default function SupervisorList() {
  const [supervisors, setSupervisors] = useState([]);
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

  // Debounce search to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((value) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchLeaders(1, pagination.limit, value);
    }, 300),
    [pagination.limit]
  );

  useEffect(() => {
    fetchLeaders(pagination.page, pagination.limit, searchQuery);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const fetchLeaders = async (page, limit, search = "") => {
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

      const response = await fetch(`/api/admin/leaders?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaders');
      }

      const data = await response.json();
      setSupervisors(data.leaders);
      setPagination(prev => ({
        ...prev,
        page: page,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (err) {
      setError(err.message);
      enqueueSnackbar('Failed to load leaders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (error && !loading) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <ListTable
        items={supervisors}
        // Do NOT pass onAdd to remove the Add Leader button
        itemName="Leader"
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        isLoading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
    </div>
  );
}

// Debounce utility function
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}