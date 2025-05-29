"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PencilIcon, 
  TrashIcon, 
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  PlusIcon
} from "lucide-react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

export default function ListTable({ 
  items, 
  onEdit, 
  onDelete, 
  itemName,
  pagination,
  onPageChange,
  isLoading,
  onAdd,
  searchQuery,
  onSearchChange,
  filterComponent // Add new prop for filter component
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    onDelete(itemToDelete.id);
    setShowDeleteDialog(false);
  };

  const handleSearch = (e) => {
    onSearchChange(e.target.value);
  };
  
  // Check if we should show action buttons
  const showActions = !!onEdit || !!onDelete;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${itemName.toLowerCase()}...`}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          
          {/* Render filter component if provided */}
          {filterComponent}
        </div>
        
        {/* Only show Add button if onAdd prop is provided */}
        {onAdd && (
          <Button onClick={onAdd}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add {itemName}
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>{itemName} Name</TableHead>
              {/* Only show Actions column if we have edit or delete handlers */}
              {showActions && (
                <TableHead className="w-40 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {pagination ? (pagination.page - 1) * pagination.limit + index + 1 : index + 1}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  {/* Only show Actions cell if we have edit or delete handlers */}
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => onEdit(item)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50" 
                            onClick={() => handleDeleteClick(item)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {/* Adjust colspan based on whether we show Actions */}
                <TableCell colSpan={showActions ? 3 : 2} className="h-24 text-center">
                  {isLoading ? 
                    "Loading..." : 
                    `No ${itemName.toLowerCase()}s found.`
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && pagination.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {items.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={pagination.page === 1 || isLoading}
            >
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            
            <span className="text-sm px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Only show delete dialog if we have a delete handler */}
      {onDelete && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          item={itemToDelete}
          itemName={itemName}
          onConfirmDelete={confirmDelete}
        />
      )}
    </div>
  );
}