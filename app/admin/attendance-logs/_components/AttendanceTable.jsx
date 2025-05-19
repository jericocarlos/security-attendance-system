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

  // Function to generate limited pagination items
  const getPaginationItems = () => {
    // Always show at most 7 page buttons (including ellipses)
    const showMax = 7;
    // Show 1 page on either side of current page if possible
    const siblingsCount = 1;

    const items = [];

    // If we have 7 or fewer pages, show all of them
    if (totalPages <= showMax) {
      for (let i = 0; i < totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={pagination.pageIndex === i}
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: i }))}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return items;
    }

    // Always add first page
    items.push(
      <PaginationItem key={0}>
        <PaginationLink
          isActive={pagination.pageIndex === 0}
          onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate range around current page
    const leftSiblingIndex = Math.max(pagination.pageIndex - siblingsCount, 1);
    const rightSiblingIndex = Math.min(
      pagination.pageIndex + siblingsCount,
      totalPages - 2
    );

    // Should show left ellipsis?
    const shouldShowLeftEllipsis = leftSiblingIndex > 1;
    // Should show right ellipsis?
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2;

    // Add left ellipsis if needed
    if (shouldShowLeftEllipsis) {
      items.push(
        <PaginationItem key="left-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add page numbers around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={pagination.pageIndex === i}
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: i }))}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add right ellipsis if needed
    if (shouldShowRightEllipsis) {
      items.push(
        <PaginationItem key="right-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always add last page
    items.push(
      <PaginationItem key={totalPages - 1}>
        <PaginationLink
          isActive={pagination.pageIndex === totalPages - 1}
          onClick={() =>
            setPagination((prev) => ({ ...prev, pageIndex: totalPages - 1 }))
          }
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );

    return items;
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
              <TableHead>Log Type</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.ashima_id}</TableCell>
                  <TableCell>{log.name || "N/A"}</TableCell>
                  <TableCell>{log.department || "N/A"}</TableCell>
                  <TableCell>{log.log_type}</TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No attendance logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

            {/* Dynamic pagination items */}
            {totalPages > 0 && getPaginationItems()}

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