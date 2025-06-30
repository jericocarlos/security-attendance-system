/**
 * AttendanceTable Component
 * 
 * Displays attendance logs in a paginated table format with accessible markup.
 * Includes proper ARIA labels, keyboard navigation, and responsive design.
 * 
 * @component
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * Renders a table of attendance logs with pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.logs - Array of attendance log objects
 * @param {number} props.totalLogs - Total number of logs across all pages
 * @param {Object} props.pagination - Pagination state object
 * @param {Function} props.setPagination - Function to update pagination state
 * @param {boolean} props.loading - Whether the table is in loading state
 */
export default function AttendanceTable({
  logs = [],
  totalLogs = 0,
  pagination = { pageIndex: 0, pageSize: 100 },
  setPagination,
  loading = false,
}) {
  const totalPages = Math.ceil(totalLogs / pagination.pageSize);

  /**
   * Formats a date string to a localized time format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time string
   */
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  /**
   * Formats a date string to a localized date format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  /**
   * Handles pagination navigation
   * @param {number} newPageIndex - The target page index
   */
  const handlePageChange = (newPageIndex) => {
    if (newPageIndex >= 0 && newPageIndex < totalPages) {
      setPagination?.((prev) => ({
        ...prev,
        pageIndex: newPageIndex,
      }));
    }
  };

  return (
    <div role="region" aria-label="Attendance logs table">
      {/* Table Container */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                scope="col"
                className="whitespace-nowrap"
                aria-label="Employee ASHIMA ID"
              >
                ASHIMA ID
              </TableHead>
              <TableHead 
                scope="col"
                className="whitespace-nowrap"
                aria-label="Employee full name"
              >
                Employee Name
              </TableHead>
              <TableHead 
                scope="col"
                className="whitespace-nowrap"
                aria-label="Department name"
              >
                Department
              </TableHead>
              <TableHead 
                scope="col"
                className="whitespace-nowrap"
                aria-label="Attendance date"
              >
                Date
              </TableHead>
              <TableHead 
                scope="col"
                className="whitespace-nowrap"
                aria-label="Time in timestamp"
              >
                Time In
              </TableHead>
              <TableHead 
                scope="col"
                className="whitespace-nowrap"
                aria-label="Time out timestamp"
              >
                Time Out
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  className="text-center py-12"
                  aria-live="polite"
                >
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="md" />
                    <span className="text-sm text-muted-foreground">
                      Loading attendance logs...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow 
                  key={log.id}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-mono">
                    {log.ashima_id || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {log.department || "N/A"}
                  </TableCell>
                  <TableCell>
                    {formatDate(log.in_time)}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    <time 
                      dateTime={log.in_time}
                      title={`Time in: ${formatDateTime(log.in_time)}`}
                    >
                      {formatDateTime(log.in_time)}
                    </time>
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    <time 
                      dateTime={log.out_time}
                      title={`Time out: ${formatDateTime(log.out_time)}`}
                    >
                      {formatDateTime(log.out_time)}
                    </time>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  className="text-center py-12"
                  aria-live="polite"
                >
                  <div className="text-muted-foreground">
                    No attendance logs found.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div 
          className="text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {totalLogs > 0 ? (
            <>
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalLogs
              )}{" "}
              of {totalLogs} logs
            </>
          ) : (
            "No logs found"
          )}
        </div>
        
        {totalPages > 1 && (
          <Pagination role="navigation" aria-label="Attendance logs pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  disabled={pagination.pageIndex === 0}
                  aria-label="Go to previous page"
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  disabled={pagination.pageIndex === totalPages - 1}
                  aria-label="Go to next page"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}