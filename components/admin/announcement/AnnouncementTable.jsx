"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AnnouncementTable({ 
  announcements, 
  totalAnnouncements, 
  pagination, 
  setPagination,
  onEdit,
  onDelete,
}) {
  const [sorting, setSorting] = useState([]);

  // Define table columns for announcements
  const columns = [
    {
      header: "Title",
      accessorKey: "title",
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    },
    {
      header: "Announcement",
      accessorKey: "announcement",
      cell: ({ getValue }) => (
        <div className="truncate max-w-xl">{getValue()}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => <Badge>{getValue()}</Badge>,
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this announcement?")) {
                onDelete(row.original);
              }
            }}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Initialize TanStack table
  const table = useReactTable({
    data: announcements || [],
    columns,
    state: {
      sorting,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil((totalAnnouncements || 0) / pagination.pageSize),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Generate pagination UI with improved logic to avoid key conflicts
  const renderPaginationItems = () => {
    const pageCount = table.getPageCount();
    const currentPage = pagination.pageIndex;
    const visiblePages = 5; // Maximum number of visible page buttons

    // No pagination needed if there's only 1 page or no pages
    if (pageCount <= 1) return null;

    // For 5 or fewer total pages, just show all pages
    if (pageCount <= visiblePages) {
      return Array.from({ length: pageCount }).map((_, i) => (
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            onClick={() => table.setPageIndex(i)}
            isActive={currentPage === i}
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      ));
    }

    // For more pages, calculate which ones to show
    // Create an array to store the page numbers we want to display
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(0);
    
    // Calculate middle pages (around current page)
    let startMiddle = Math.max(1, currentPage - 1);
    let endMiddle = Math.min(pageCount - 2, currentPage + 1);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= 1) {
      endMiddle = 3;
    } else if (currentPage >= pageCount - 2) {
      startMiddle = pageCount - 4;
    }
    
    // Add ellipsis after first page if needed
    if (startMiddle > 1) {
      pageNumbers.push(-1); // -1 will render as ellipsis
    }
    
    // Add middle pages
    for (let i = startMiddle; i <= endMiddle; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endMiddle < pageCount - 2) {
      pageNumbers.push(-2); // -2 will render as ellipsis (different key from first ellipsis)
    }
    
    // Always show last page
    pageNumbers.push(pageCount - 1);

    // Render the pagination items
    return pageNumbers.map((pageNum, index) => {
      // If it's a negative number, it's a placeholder for ellipsis
      if (pageNum < 0) {
        return (
          <PaginationItem key={`ellipsis-${pageNum}`}>
            <span className="px-2">...</span>
          </PaginationItem>
        );
      }

      // Regular page number
      return (
        <PaginationItem key={`page-${pageNum}`}>
          <PaginationLink
            onClick={() => table.setPageIndex(pageNum)}
            isActive={currentPage === pageNum}
          >
            {pageNum + 1}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No announcements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            totalAnnouncements
          )}{" "}
          of {totalAnnouncements} announcements
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            
            {renderPaginationItems()}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}