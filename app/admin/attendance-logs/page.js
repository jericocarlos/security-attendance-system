"use client";

import { useEffect, useState, useCallback } from "react";
import { FiFilter, FiDownload, FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AttendanceTable from "./_components/AttendanceTable";
import FilterDialog from "./_components/FilterDialog";
import DashboardStats from "./_components/DashboardStats";

export default function AttendanceLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    logType: "",
    dateRange: { from: null, to: null },
  });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalLogs, setTotalLogs] = useState(0);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce utility function inside component
  const debounce = useCallback((func, timeout = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), timeout);
    };
  }, []);

  // Memoize the fetchLogs function
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchQuery,
        log_type: filters.logType || "",
        start_date: filters.dateRange.from
          ? filters.dateRange.from.toISOString().split("T")[0]
          : "",
        end_date: filters.dateRange.to
          ? filters.dateRange.to.toISOString().split("T")[0]
          : "",
      });

      const response = await fetch(`/api/admin/attendance-logs?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch attendance logs");

      const data = await response.json();
      setLogs(data.data);
      setTotalLogs(data.total);
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, searchQuery]);

  // Create debounced search handler with proper dependencies
  const debouncedSearch = useCallback(
    (value) => {
      const handleSearch = () => {
        setSearchQuery(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset to first page when searching
      };

      debounce(handleSearch, 500)();
    },
    [debounce, setPagination]
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Update the handleExportLogs function for better error handling
  const handleExportLogs = async () => {
    try {
      setLoading(true); // Show loading indicator while exporting
      
      const searchParams = new URLSearchParams({
        page: 1,
        limit: 10000, // Export all matching logs
        search: searchQuery,
        log_type: filters.logType || "",
        start_date: filters.dateRange.from
          ? filters.dateRange.from.toISOString().split("T")[0]
          : "",
        end_date: filters.dateRange.to
          ? filters.dateRange.to.toISOString().split("T")[0]
          : "",
      });

      const response = await fetch(
        `/api/admin/attendance-logs/export?${searchParams}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to export logs");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Add timestamp to filename for better organization
      const date = new Date().toISOString().split('T')[0];
      link.download = `attendance_logs_${date}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error("Error exporting logs:", error);
      // You could add a toast notification here if you have a UI component for that
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect with fetchLogs dependency
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Main Attendance Logs Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Logs</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ASHIMA ID..."
                className="pl-10 w-64"
                onChange={handleSearchChange}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <FiFilter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" onClick={handleExportLogs}>
              <FiDownload className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceTable
            logs={logs}
            totalLogs={totalLogs}
            pagination={pagination}
            setPagination={setPagination}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}