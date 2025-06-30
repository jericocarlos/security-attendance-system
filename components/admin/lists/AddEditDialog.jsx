'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';


export default function AddEditDialog({ onSave, itemName, editItem = null, open, onOpenChange }) {
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLeader, setIsLeader] = useState(editItem?.is_leader ? true : false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setIsEditing(true);
      setIsLeader(editItem.is_leader ? true : false);
    } else {
      setName('');
      setIsEditing(false);
      setIsLeader(false);
    }
  }, [editItem, open]);

  const handleOpenChange = (isOpen) => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    if (!isOpen) {
      setName('');
      setIsEditing(false);
      setIsLeader(false);
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      if (isEditing && editItem) {
        // Only include is_leader if this is the Position form
        if (itemName.toLowerCase() === "position") {
          onSave({ id: editItem.id, name: name.trim(), is_leader: isLeader ? 1 : 0 });
        } else {
          onSave({ id: editItem.id, name: name.trim() });
        }
      } else {
        if (itemName.toLowerCase() === "position") {
          onSave({ name: name.trim(), is_leader: isLeader ? 1 : 0 });
        } else {
          onSave({ name: name.trim() });
        }
      }
      setName('');
      setIsLeader(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`${isEditing ? 'Edit' : 'Add'} ${itemName}`}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Update the ${itemName.toLowerCase()} details below.` 
              : `Enter a name for the new ${itemName.toLowerCase()}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${itemName.toLowerCase()} name`}
              className="col-span-3"
              autoFocus
            />
          </div>
          {/* Only show the checkbox if this is the Position form */}
          {itemName.toLowerCase() === "position" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isLeader" className="text-right">
                Leader
              </Label>
              <label className="flex items-center gap-2 col-span-3">
                <input
                  id="isLeader"
                  type="checkbox"
                  checked={isLeader}
                  onChange={e => setIsLeader(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{isLeader ? 'Yes' : 'No'}</span>
              </label>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}