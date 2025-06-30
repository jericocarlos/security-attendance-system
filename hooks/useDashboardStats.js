/**
 * Custom hook for dashboard statistics management
 * Handles fetching, caching, and error states for dashboard stats
 */
import { useState, useEffect, useCallback } from 'react';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendance: 0,
    todayAttendance: 0,
    departments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/admin/dashboard/stats");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
}
