"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

// Updated column definitions without email
const ACCOUNT_COLUMNS = [
  { id: "username", header: "Username" },
  { id: "name", header: "Full Name" },
  { id: "role", header: "Role" },
  { id: "lastLogin", header: "Last Login" },
  { id: "actions", header: "Actions" },
];

export default function AccountTable({
  accounts,
  totalAccounts,
  pagination,
  setPagination,
  onEdit,
  onDelete,
  session,
}) {
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Helper function to format role names
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-600 hover:bg-purple-700";
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "security":
        return "bg-green-500 hover:bg-green-600";
      case "hr":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Check if the current user can edit/delete a specific account
  const canManageAccount = (account) => {
    // Only superadmin can manage superadmin accounts
    if (account.role === "superadmin") {
      return session?.user?.role === "superadmin";
    }
    // Admin and superadmin can manage other accounts
    return ["admin", "superadmin"].includes(session?.user?.role);
  };

  // Handle delete confirmation
  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      onDelete(accountToDelete.id);
      setShowDeleteDialog(false);
      setAccountToDelete(null);
    }
  };

  // Handle pagination
  const pageCount = Math.ceil(totalAccounts / pagination.pageSize);

  const handlePreviousPage = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.max(0, prev.pageIndex - 1),
    }));
  };

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.min(pageCount - 1, prev.pageIndex + 1),
    }));
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {ACCOUNT_COLUMNS.map((column) => (
              <TableHead key={column.id}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={ACCOUNT_COLUMNS.length}
                className="text-center py-10 text-muted-foreground"
              >
                No accounts found
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.username}</TableCell>
                <TableCell>{account.name}</TableCell>
                {/* Email cell removed */}
                <TableCell>
                  <Badge className={getRoleBadgeStyle(account.role)}>
                    {account.role === "superadmin"
                      ? "Super Admin"
                      : account.role === "hr"
                      ? "HR"
                      : account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{account.lastLogin ? formatDate(account.lastLogin) : "Never"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(account)}
                      disabled={!canManageAccount(account)}
                      title={
                        !canManageAccount(account)
                          ? "You don't have permission to edit this account"
                          : "Edit account"
                      }
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(account)}
                      disabled={!canManageAccount(account) || account.id === session?.user?.id}
                      title={
                        account.id === session?.user?.id
                          ? "You cannot delete your own account"
                          : !canManageAccount(account)
                          ? "You don't have permission to delete this account"
                          : "Delete account"
                      }
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {accounts.length} of {totalAccounts} accounts
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pagination.pageIndex === 0}
          >
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {pagination.pageIndex + 1} of {Math.max(1, pageCount)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={pagination.pageIndex >= pageCount - 1 || pageCount === 0}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for{" "}
              {accountToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}