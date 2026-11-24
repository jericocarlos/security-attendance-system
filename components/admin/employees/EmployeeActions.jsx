/**
 * Employee management header actions
 * Contains the primary action buttons for employee management
 */

import React, { memo, useRef } from 'react';
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
 * EmployeeActions Component
 * @param {Object} props - Component props
 * @param {Function} props.onAddEmployee - Handler for adding new employee
 * @param {Function} props.onExportEmployees - Handler for exporting employees
 * @param {Function} props.onImportEmployees - Handler for importing employees
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.exporting - Export state
 * @param {boolean} props.importing - Import state
 * @param {number} props.totalEmployees - Total number of employees
 */
const EmployeeActions = memo(({
  onAddEmployee,
  onExportEmployees,
  onImportEmployees,
  loading = false,
  exporting = false,
  importing = false,
  totalEmployees = 0
}) => {
  const fileInputRef = useRef(null);
  const isBusy = loading || exporting || importing;

  return (
    <div className="flex items-center gap-2">
      {/* Export/Import Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={isBusy}
            aria-label={exporting ? "Exporting employees..." : importing ? "Importing employees..." : "Export or import employee data"}
          >
            <FiDownload className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : importing ? 'Importing...' : 'Export/Import'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onExportEmployees}
            disabled={loading || exporting || totalEmployees === 0}
            className="cursor-pointer"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="cursor-pointer"
          >
            <FiUpload className="mr-2 h-4 w-4" />
            Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        aria-label="Select employee CSV file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImportEmployees(file);
          event.target.value = '';
        }}
      />

      {/* Add Employee Button */}
      <Button
        onClick={onAddEmployee}
        disabled={loading}
        aria-label="Add new employee"
        className="bg-primary hover:bg-primary/90"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
    </div>
  );
});

EmployeeActions.displayName = 'EmployeeActions';

export default EmployeeActions;
