"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Download } from "lucide-react";

export default function AttendanceLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filters, setFilters] = useState({
    search: "",
    logType: "",
    dateRange: { from: null, to: null },
  });
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        log_type: filters.logType === "all" ? "" : filters.logType,
        start_date: filters.dateRange.from ? filters.dateRange.from.toISOString().split("T")[0] : "",
        end_date: filters.dateRange.to ? filters.dateRange.to.toISOString().split("T")[0] : "",
      });

      console.log('Date filter params:', {
        start: filters.dateRange.from ? filters.dateRange.from.toISOString() : 'none',
        end: filters.dateRange.to ? filters.dateRange.to.toISOString() : 'none'
      });

      const res = await fetch(`/api/admin/attendance-logs?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch logs: ${res.status}`);
      }
      
      const data = await res.json();
      setLogs(data.data);
      setTotalLogs(data.total);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError(err.message || "Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page on filter change
  };

  const handleLogTypeChange = (value) => {
    setFilters({ ...filters, logType: value });
    setPagination({ ...pagination, page: 1 }); // Reset to first page on filter change
  };

  const handleDateRangeChange = (range) => {
    setFilters({ ...filters, dateRange: range });
    setPagination({ ...pagination, page: 1 }); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      logType: "",
      dateRange: { from: null, to: null },
    });
    setPagination({ ...pagination, page: 1 });
  };

  const exportToCSV = async () => {
    try {
      // Get all records for export
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 10000, // Large limit to get all records
        search: filters.search,
        log_type: filters.logType === "all" ? "" : filters.logType,
        start_date: filters.dateRange.from ? filters.dateRange.from.toISOString().split("T")[0] : "",
        end_date: filters.dateRange.to ? filters.dateRange.to.toISOString().split("T")[0] : "",
      });
      
      const res = await fetch(`/api/admin/attendance-logs?${queryParams.toString()}`);
      const data = await res.json();
      
      // Format data for CSV
      const csvData = [
        ['Ashima ID', 'Employee Name', 'Department', 'Log Type', 'Timestamp'],
        ...data.data.map(log => [
          log.ashima_id,
          log.name || 'N/A',
          log.department || 'N/A',
          log.log_type,
          new Date(log.timestamp).toLocaleString()
        ])
      ];
      
      // Convert to CSV format
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const totalPages = Math.ceil(totalLogs / pagination.limit);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Attendance Logs</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reset Filters
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <Input
          placeholder="Search by Ashima ID"
          value={filters.search}
          onChange={handleSearchChange}
          className="w-64"
        />

        {/* Log Type Filter */}
        <Select onValueChange={handleLogTypeChange} value={filters.logType || "all"}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Log Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="IN">IN</SelectItem>
            <SelectItem value="OUT">OUT</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DatePickerWithRange
          className="w-[300px]"
          onChange={handleDateRangeChange}
          date={filters.dateRange} // Pass the current date range
        />
      </div>

      {/* Error message */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Attendance Logs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ashima ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Log Type</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.ashima_id}</TableCell>
                  <TableCell>{log.name || "N/A"}</TableCell>
                  <TableCell>{log.department || "N/A"}</TableCell>
                  <TableCell>{log.log_type}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                />
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  [...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={pagination.page === page}
                          onClick={() => setPagination({ ...pagination, page })}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })
                ) : (
                  // Show limited pages with ellipsis for many pages
                  <>
                    <PaginationItem>
                      <PaginationLink
                        isActive={pagination.page === 1}
                        onClick={() => setPagination({ ...pagination, page: 1 })}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    
                    {pagination.page > 3 && <PaginationItem>...</PaginationItem>}
                    
                    {pagination.page > 2 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        >
                          {pagination.page - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {pagination.page !== 1 && pagination.page !== totalPages && (
                      <PaginationItem>
                        <PaginationLink isActive>
                          {pagination.page}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {pagination.page < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        >
                          {pagination.page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {pagination.page < totalPages - 2 && <PaginationItem>...</PaginationItem>}
                    
                    <PaginationItem>
                      <PaginationLink
                        isActive={pagination.page === totalPages}
                        onClick={() => setPagination({ ...pagination, page: totalPages })}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationNext
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === totalPages}
                />
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}