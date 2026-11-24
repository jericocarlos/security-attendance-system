/**
 * Custom hook for managing employee data, state, and operations
 * Centralizes all employee-related business logic and API calls
 */

import { useState, useCallback, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = '';
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (insideQuotes) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        insideQuotes = false;
      } else {
        value += character;
      }
    } else if (character === '"' && value.length === 0) {
      insideQuotes = true;
    } else if (character === ',') {
      row.push(value);
      value = '';
    } else if (character === '\n' || character === '\r') {
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
      if (character === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      value += character;
    }
  }

  if (insideQuotes) throw new Error('The CSV file contains an unclosed quoted field.');
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);

  return rows;
};

/**
 * Hook for managing employees data and operations
 * @returns {Object} Employee management state and functions
 */
export const useEmployeesManager = () => {
  // Core data state
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ 
    department: '', 
    position: '', 
    leader: '', 
    status: '' 
  });
  const [pagination, setPagination] = useState({ 
    pageIndex: 0, 
    pageSize: 10 
  });
  
  // Metadata state
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [leaders, setLeaders] = useState([]);
  
  // Dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Error state
  const [error, setError] = useState(null);
  
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Fetches employees with current filters and pagination
   */
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        department: filters.department || '',
        position: filters.position || '',
        status: filters.status || '',
        leader: filters.leader || '',
      });

      const response = await fetch(`/api/admin/employees?${searchParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data.data || []);
      setTotalEmployees(data.total || 0);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to fetch employees', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, searchQuery, enqueueSnackbar]);

  /**
   * Fetches metadata (departments, positions, leaders) for form options
   */
  const fetchMetadata = useCallback(async () => {
    try {
      setLoadingMetadata(true);
      setError(null);
      
      const [deptResponse, posResponse, leadersResponse] = await Promise.all([
        fetch('/api/admin/departments'),
        fetch('/api/admin/positions'),
        fetch('/api/admin/leaders?limit=1000')
      ]);
      
      if (!deptResponse.ok || !posResponse.ok || !leadersResponse.ok) {
        throw new Error('Failed to fetch form options');
      }
      
      const [deptData, posData, leadersData] = await Promise.all([
        deptResponse.json(),
        posResponse.json(),
        leadersResponse.json()
      ]);
      
      setDepartments(deptData.departments || []);
      setPositions(posData.positions || []);
      setLeaders(leadersData.leaders || []);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setError(error.message);
      enqueueSnackbar('Failed to load form options', { variant: 'error' });
    } finally {
      setLoadingMetadata(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Handles employee form submission (create/update)
   * @param {Object} formData - Employee form data
   * @param {string} imagePreview - Base64 image data
   */
  const handleEmployeeSubmit = useCallback(async (formData, imagePreview) => {
    try {
      setSubmitting(true);
      setError(null);

      const method = currentEmployee ? 'PUT' : 'POST';
      const url = currentEmployee 
        ? `/api/admin/employees/${currentEmployee.id}`
        : '/api/admin/employees';

      const apiData = {
        ...formData,
        photo: imagePreview,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save employee');
      }

      // Close dialog and refresh data
      setIsFormDialogOpen(false);
      setCurrentEmployee(null);
      await fetchEmployees();
      
      enqueueSnackbar(
        `Employee ${currentEmployee ? 'updated' : 'added'} successfully`, 
        { variant: 'success' }
      );
    } catch (error) {
      console.error('Error submitting employee data:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Failed to save employee', { 
        variant: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  }, [currentEmployee, fetchEmployees, enqueueSnackbar]);

  /**
   * Opens the employee form dialog
   * @param {Object|null} employee - Employee to edit, or null for new employee
   */
  const openEmployeeForm = useCallback((employee = null) => {
    setCurrentEmployee(employee);
    setIsFormDialogOpen(true);
  }, []);

  /**
   * Resets all filters to default values
   */
  const resetFilters = useCallback(() => {
    setFilters({ department: '', position: '', leader: '', status: '' });
    setSearchQuery('');
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  /**
   * Refreshes employee data
   */
  const refreshEmployees = useCallback(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleExportEmployees = useCallback(async () => {
    try {
      setExporting(true);

      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: '1',
        limit: String(totalEmployees),
        department: filters.department || '',
        position: filters.position || '',
        status: filters.status || '',
        leader: filters.leader || '',
      });
      const response = await fetch(`/api/admin/employees?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export employees');
      }

      const { data = [] } = await response.json();
      const columns = [
        ['Employee ID', 'ashima_id'],
        ['Name', 'name'],
        ['Department', 'department'],
        ['Department ID', 'department_id'],
        ['Position', 'position'],
        ['Position ID', 'position_id'],
        ['Leader', 'leader_name'],
        ['Leader ID', 'leader'],
        ['RFID Tag', 'rfid_tag'],
        ['Employee Status', 'emp_stat'],
        ['Status', 'status'],
      ];
      const escapeCsvValue = (value) => {
        const text = value == null ? '' : String(value);
        const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
        return `"${safeText.replace(/"/g, '""')}"`;
      };
      const csv = [
        columns.map(([label]) => escapeCsvValue(label)).join(','),
        ...data.map((employee) =>
          columns.map(([, key]) => escapeCsvValue(employee[key])).join(',')
        ),
      ].join('\r\n');
      const blob = new Blob([`\uFEFF${csv}`], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      enqueueSnackbar('Employees exported successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error exporting employees:', error);
      enqueueSnackbar(error.message || 'Failed to export employees', {
        variant: 'error',
      });
    } finally {
      setExporting(false);
    }
  }, [searchQuery, totalEmployees, filters, enqueueSnackbar]);

  const handleImportEmployees = useCallback(async (file) => {
    if (!file) return;

    try {
      setImporting(true);
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please select a CSV file.');
      }

      const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''));
      if (rows.length < 2) {
        throw new Error('The CSV file must contain a header and at least one employee.');
      }

      const normalizeHeader = (header) =>
        header.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_-]+/g, '');
      const headerIndexes = new Map(
        rows[0].map((header, index) => [normalizeHeader(header), index])
      );
      const findColumn = (...names) =>
        names.map(normalizeHeader).map((name) => headerIndexes.get(name))
          .find((index) => index !== undefined);
      const employeeIdColumn = findColumn('Employee ID', 'ashima_id');
      const nameColumn = findColumn('Name');

      if (employeeIdColumn === undefined || nameColumn === undefined) {
        throw new Error('CSV headers must include Employee ID (or ashima_id) and Name.');
      }

      const readCell = (row, column) =>
        column === undefined ? '' : (row[column] || '').trim();
      const departmentColumn = findColumn('department_id', 'Department');
      const positionColumn = findColumn('position_id', 'Position');
      const leaderColumn = findColumn('leader_id', 'Leader', 'leader');
      const rfidColumn = findColumn('RFID Tag', 'rfid_tag');
      const employmentStatusColumn = findColumn('Employee Status', 'emp_stat');
      const statusColumn = findColumn('Status', 'status');
      const resolveReference = (value, items, label, nameField = 'name') => {
        if (!value) return null;
        if (/^\d+$/.test(value)) return value;

        const matches = items.filter((item) =>
          String(item[nameField] || '').trim().toLowerCase() === value.toLowerCase()
        );
        if (matches.length !== 1) {
          throw new Error(matches.length
            ? `${label} "${value}" is ambiguous.`
            : `${label} "${value}" was not found.`);
        }
        return String(matches[0].id);
      };
      const seenEmployeeIds = new Set();
      const seenRfidTags = new Set();
      const failures = [];
      let importedCount = 0;

      for (let index = 1; index < rows.length; index += 1) {
        const rowNumber = index + 1;
        const row = rows[index];

        try {
          const ashimaId = readCell(row, employeeIdColumn);
          const name = readCell(row, nameColumn);
          const departmentValue = readCell(row, departmentColumn);
          const positionValue = readCell(row, positionColumn);
          const leaderValue = readCell(row, leaderColumn);
          const rfidTag = readCell(row, rfidColumn);
          const empStat = readCell(row, employmentStatusColumn) || 'regular';
          const status = (readCell(row, statusColumn) || 'active').toLowerCase();

          if (!ashimaId || !name) {
            throw new Error('Employee ID and Name are required.');
          }
          if (!['active', 'inactive', 'resigned'].includes(status)) {
            throw new Error(`Invalid status "${status}".`);
          }
          if (status !== 'resigned' && !rfidTag) {
            throw new Error('RFID Tag is required unless status is resigned.');
          }

          const normalizedEmployeeId = ashimaId.toLowerCase();
          const normalizedRfidTag = rfidTag.toLowerCase();
          if (seenEmployeeIds.has(normalizedEmployeeId)) {
            throw new Error(`Duplicate Employee ID "${ashimaId}" in this file.`);
          }
          if (normalizedRfidTag && seenRfidTags.has(normalizedRfidTag)) {
            throw new Error(`Duplicate RFID Tag "${rfidTag}" in this file.`);
          }
          seenEmployeeIds.add(normalizedEmployeeId);
          if (normalizedRfidTag) seenRfidTags.add(normalizedRfidTag);

          const payload = {
            ashima_id: ashimaId,
            name,
            department_id: resolveReference(departmentValue, departments, 'Department'),
            position_id: resolveReference(positionValue, positions, 'Position'),
            leader: resolveReference(leaderValue, leaders, 'Leader'),
            rfid_tag: status === 'resigned' ? null : rfidTag,
            emp_stat: empStat,
            status,
          };
          const response = await fetch('/api/admin/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add employee.');
          }
          importedCount += 1;
        } catch (error) {
          failures.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      if (importedCount > 0) await fetchEmployees();
      if (failures.length > 0) {
        console.error('Employee CSV import row errors:', failures);
        enqueueSnackbar(
          `Imported ${importedCount}; ${failures.length} row(s) failed. ${failures[0]}`,
          { variant: importedCount ? 'warning' : 'error', autoHideDuration: 10000 }
        );
      } else {
        enqueueSnackbar(`Imported ${importedCount} employee(s) successfully.`, {
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error importing employees:', error);
      enqueueSnackbar(error.message || 'Failed to import employees', {
        variant: 'error',
      });
    } finally {
      setImporting(false);
    }
  }, [departments, positions, leaders, fetchEmployees, enqueueSnackbar]);

  // Initial data loading
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    // Data state
    employees,
    totalEmployees,
    departments,
    positions,
    leaders,
    
    // Loading states
    loading,
    loadingMetadata,
    submitting,
    exporting,
    importing,
    
    // Filter and search state
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    
    // Dialog state
    isFormDialogOpen,
    setIsFormDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    currentEmployee,
    
    // Error state
    error,
    setError,
    
    // Actions
    handleEmployeeSubmit,
    openEmployeeForm,
    resetFilters,
    refreshEmployees,
    handleExportEmployees,
    handleImportEmployees,
    fetchEmployees,
    fetchMetadata,
  };
};
