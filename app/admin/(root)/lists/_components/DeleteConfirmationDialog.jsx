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

export default function DeleteConfirmationDialog({ open, onOpenChange, item, itemName, onConfirmDelete }) {
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
            <span className="font-semibold">{item?.name}</span>?
          </DialogDescription>
          {/* The div inside p was causing the hydration error, so moved it outside */}
          <p className="mt-2 text-red-500 text-sm">
            This action cannot be undone. This {itemName.toLowerCase()} will be permanently removed.
          </p>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete {itemName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}