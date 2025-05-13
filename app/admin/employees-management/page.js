"use client";

import React, { useEffect, useState } from "react";
import { useSnackbar } from 'notistack';
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeTable from "./_components/EmployeeTable";
import EmployeeFormDialog from "./_components/EmployeeFormDialog.js";
import DeleteConfirmationDialog from "./_components/DeleteConfirmationDialog";
import { Badge } from "@/components/ui/badge";

export default function EmployeesManagementPage() {
  // State variables
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  
  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Snackbar notifications
  const { enqueueSnackbar } = useSnackbar();

  // Stats summary
  const [stats, setStats] = useState({
    active: 0,
    inactive: 0,
    resigned: 0
  });

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });

      const response = await fetch(`/api/admin/employees?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      
      const data = await response.json();
      setEmployees(data.data);
      setTotalEmployees(data.total);
      
      // Calculate stats
      const activeCount = data.data.filter(e => e.status === 'active').length;
      const inactiveCount = data.data.filter(e => e.status === 'inactive').length;
      const resignedCount = data.data.filter(e => e.status === 'resigned').length;
      
      setStats({
        active: activeCount,
        inactive: inactiveCount,
        resigned: resignedCount
      });
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      enqueueSnackbar("Failed to load employees", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments and positions from actual API endpoints
  const fetchDepartmentsAndPositions = async () => {
    setLoadingMetadata(true);
    try {
      // Fetch departments
      const deptResponse = await fetch('/api/admin/departments');
      if (!deptResponse.ok) throw new Error('Failed to fetch departments');
      const deptData = await deptResponse.json();
      
      // Fetch positions
      const posResponse = await fetch('/api/admin/positions');
      if (!posResponse.ok) throw new Error('Failed to fetch positions');
      const posData = await posResponse.json();

      console.log("Departments API Response:", deptData);
      console.log("Positions API Response:", posData);
      
      // Update state with fetched data - using the correct property names
      // Your APIs return { departments: [...] } and { positions: [...] }
      setDepartments(deptData.departments || []);
      setPositions(posData.positions || []);
      
    } catch (error) {
      console.error("Error fetching departments/positions:", error);
      enqueueSnackbar("Failed to load form data", { variant: "warning" });
    } finally {
      setLoadingMetadata(false);
    }
  };

  // The rest of the component remains the same
  // ...

  // Handle employee deletion
  const handleDeleteEmployee = async () => {
    try {
      const response = await fetch(`/api/admin/employees?id=${currentEmployee.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        enqueueSnackbar("Employee deleted successfully", { variant: "success" });
        setIsDeleteDialogOpen(false);
        fetchEmployees();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      enqueueSnackbar(error.message || "Failed to delete employee", { 
        variant: "error" 
      });
    }
  };

  // Add/Edit form submission handler
  const handleEmployeeFormSubmit = async (formData, imagePreview) => {
    try {
      const employeeData = {
        ...formData,
        photo: imagePreview || (currentEmployee?.photo || null),
      };

      let url = "/api/admin/employees";
      let method = "POST";

      if (currentEmployee) {
        url = `/api/admin/employees/${currentEmployee.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (response.ok) {
        enqueueSnackbar(
          `Employee ${currentEmployee ? "updated" : "added"} successfully!`,
          { variant: "success" }
        );
        setIsFormDialogOpen(false);
        fetchEmployees();
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      enqueueSnackbar(error.message || "An error occurred", { variant: "error" });
      return false;
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchEmployees();
  }, [pagination.pageIndex, pagination.pageSize, searchQuery]);

  // Fetch departments and positions on initial load
  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, []);

  // Refetch departments and positions when opening the form
  const handleOpenForm = (employee = null) => {
    setCurrentEmployee(employee);
    // Refresh departments and positions data when opening form
    fetchDepartmentsAndPositions();
    setIsFormDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.active}</div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">Inactive</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resigned Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.resigned}</div>
              <Badge variant="outline" className="text-red-500 border-red-500">Resigned</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Employee Management Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Employee Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Button onClick={() => handleOpenForm()}>
              <FiPlus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FiRefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <EmployeeTable 
              employees={employees}
              totalEmployees={totalEmployees}
              pagination={pagination}
              setPagination={setPagination}
              onEdit={(employee) => handleOpenForm(employee)}
              onDelete={(employee) => {
                setCurrentEmployee(employee);
                setIsDeleteDialogOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        employee={currentEmployee}
        departments={departments}
        positions={positions}
        onSubmit={handleEmployeeFormSubmit}
        isLoadingOptions={loadingMetadata}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={currentEmployee}
        onConfirmDelete={handleDeleteEmployee}
      />
    </div>
  );
}