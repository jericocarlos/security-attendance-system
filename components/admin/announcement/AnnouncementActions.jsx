/**
 * Announcement management header actions
 * Contains the primary action buttons for announcement
 */

import React, { memo } from 'react';
import { FiPlus, FiDownload, FiUpload } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

/**
 * AnnouncementActions Component
 * @param {Object} props - Component props
 * @param {Function} props.onAddAnnouncement - Handler for adding new intern
 * @param {Function} props.onExportInterns - Handler for exporting interns
 * @param {Function} props.onImportInterns - Handler for importing interns
 * @param {boolean} props.loading - Loading state
 * @param {number} props.totalInterns - Total number of interns
 */
const AnnouncementActions = memo(({
  onAddAnnouncement,
  onExportInterns,
  onImportInterns,
  loading = false,
  totalInterns = 0
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Add Announcement Button */}
      <Button
        onClick={onAddAnnouncement}
        disabled={loading}
        aria-label="Add new announcement"
        className="bg-primary hover:bg-primary/90"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Announcement
      </Button>
    </div>
  );
});

AnnouncementActions.displayName = 'AnnouncementActions';

export default AnnouncementActions;