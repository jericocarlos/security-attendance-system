"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";

export default function DeleteConfirmationDialog({ open, onOpenChange, employee, onConfirmDelete }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Confirm Deletion</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{employee?.name}</span>?
            <div className="mt-2 text-red-500 text-sm">
              This action cannot be undone. All associated data will be permanently removed.
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}