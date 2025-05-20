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

export default function AttendanceTable({
  logs,
  totalLogs,
  pagination,
  setPagination,
  loading,
}) {
  const totalPages = Math.ceil(totalLogs / pagination.pageSize);

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format date only
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ashima ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.ashima_id}</TableCell>
                  <TableCell>{log.name || "N/A"}</TableCell>
                  <TableCell>{log.department || "N/A"}</TableCell>
                  <TableCell>{formatDate(log.in_time)}</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatDateTime(log.in_time)}
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {formatDateTime(log.out_time)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No attendance logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination component remains the same */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
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
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: Math.max(prev.pageIndex - 1, 0),
                  }))
                }
                disabled={pagination.pageIndex === 0}
              />
            </PaginationItem>

            {/* Pagination items */}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    pageIndex: Math.min(prev.pageIndex + 1, totalPages - 1),
                  }))
                }
                disabled={
                  pagination.pageIndex === totalPages - 1 || totalPages === 0
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}