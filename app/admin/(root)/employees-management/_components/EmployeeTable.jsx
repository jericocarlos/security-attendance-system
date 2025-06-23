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

export default function EmployeeTable({ 
  employees, 
  totalEmployees, 
  pagination, 
  setPagination,
  onEdit,
  onDelete
}) {
  const [sorting, setSorting] = useState([]);
  
  // Define table columns
  const columns = [
    {
      header: "Photo",
      accessorKey: "photo",
      cell: ({ row }) => (
        <Avatar>
          {row.original.photo ? (
            <AvatarImage 
              src={row.original.photo} 
              alt={`${row.original.name}'s photo`}
            />
          ) : (
            <AvatarImage 
              src="/placeholder.png" 
              alt="Placeholder image"
            />
          )}
          <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      header: "ID",
      accessorKey: "ashima_id",
      cell: ({ getValue }) => <span>{getValue() || "N/A"}</span>,
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Department",
      accessorKey: "department",
    },
    {
      header: "Position",
      accessorKey: "position",
    },
    {
      header: "Reporting to",
      accessorKey: "leader_name", // <- Use the correct field name from your API
      cell: ({ getValue }) => <span>{getValue() || "None"}</span>,
    },
    {
      header: "RFID Tag",
      accessorKey: "rfid_tag",
      cell: ({ getValue }) => <span>{getValue() || "Not Assigned"}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge 
            variant={
              status === "active" ? "default" : 
              status === "inactive" ? "outline" : 
              "secondary"
            }
            className={
              status === "active" ? "bg-green-500" : 
              status === "inactive" ? "border-yellow-500 text-yellow-500" : 
              "bg-red-100 text-red-500"
            }
          >
            {status}
          </Badge>
        );
      },
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
          {/* <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(row.original)}
          >
            <FiTrash2 className="h-4 w-4" />
          </Button> */}
        </div>
      ),
    },
  ];

  // Initialize TanStack table
  const table = useReactTable({
    data: employees,
    columns,
    state: {
      sorting,
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(totalEmployees / pagination.pageSize),
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
                  No employees found.
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
            totalEmployees
          )}{" "}
          of {totalEmployees} employees
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