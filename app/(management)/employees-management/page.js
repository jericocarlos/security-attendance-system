"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSnackbar } from 'notistack';
import { FiPlus, FiFilter, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeTable from "./_components/EmployeeTable";
import EmployeeFormDialog from "./_components/EmployeeFormDialog";
import DeleteConfirmationDialog from "./_components/DeleteConfirmationDialog";
import FilterDialog from "./_components/FilterDialog";
import DashboardStats from "./_components/DashboardStats";

export default function EmployeesManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ department: "", position: "", status: "" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        department: filters.department || "",
        position: filters.position || "",
        status: filters.status || "",
      });

      const response = await fetch(`/api/admin/employees?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch employees");
      
      const data = await response.json();
      setEmployees(data.data);
      setTotalEmployees(data.total);
    } catch (error) {
      console.error("Error fetching employees:", error);
      enqueueSnackbar("Failed to fetch employees", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, searchQuery, enqueueSnackbar]);

  const fetchDepartmentsAndPositions = useCallback(async () => {
    try {
      setLoadingMetadata(true);
      const deptResponse = await fetch('/api/admin/departments');
      if (!deptResponse.ok) throw new Error("Failed to fetch departments");
      const deptData = await deptResponse.json();

      const posResponse = await fetch('/api/admin/positions');
      if (!posResponse.ok) throw new Error("Failed to fetch positions");
      const posData = await posResponse.json();

      setDepartments(deptData.departments || []);
      setPositions(posData.positions || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      enqueueSnackbar("Failed to fetch departments and positions", { variant: "error" });
    } finally {
      setLoadingMetadata(false);
    }
  }, [enqueueSnackbar]);

  const handleEmployeeFormSubmit = async (formData, imagePreview) => {
    try {
      // Create payload as JSON instead of FormData
      const payload = {
        ashima_id: formData.ashima_id,
        name: formData.name,
        department_id: formData.department_id || null,
        position_id: formData.position_id || null,
        rfid_tag: formData.status === "resigned" ? null : formData.rfid_tag,
        emp_stat: formData.emp_stat || "regular",
        status: formData.status || "active",
        removePhoto: formData.removePhoto || formData.status === "resigned"
      };
      
      // Add photo data if available and not resigned
      if (imagePreview && formData.status !== "resigned" && !formData.removePhoto) {
        payload.photo = imagePreview;
      }
      
      // Send request to the appropriate endpoint
      const url = currentEmployee 
        ? `/api/admin/employees/${currentEmployee.id}` // Use ID, not ashima_id
        : "/api/admin/employees";
        
      const method = currentEmployee ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save employee");
      }
      
      // Get the response data with the new employee information
      const responseData = await response.json();
      console.log("New employee created with ID:", responseData.id);
      
      // You can optionally add the employee directly to the state 
      // instead of refreshing the whole list
      if (!currentEmployee && responseData.employee) {
        setEmployees(prev => [responseData.employee, ...prev]);
      }
      
      enqueueSnackbar(
        currentEmployee ? "Employee updated successfully" : "Employee added successfully",
        { variant: "success" }
      );
      
      // Refresh employee list
      fetchEmployees();
      
      return true;
    } catch (error) {
      console.error("Error saving employee:", error);
      enqueueSnackbar(error.message, { variant: "error" });
      return false;
    }
  };

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

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, [fetchDepartmentsAndPositions]);

  const handleOpenForm = (employee = null) => {
    setCurrentEmployee(employee);
    fetchDepartmentsAndPositions();
    setIsFormDialogOpen(true);
    console.log("Opening form for employee:", employee ? 
      `ID: ${employee.id}, ASHIMA ID: ${employee.ashima_id}` : "New employee");
  };

  const handleOpenFilter = () => {
    setIsFilterDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Main Employee Management Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
            <Button onClick={handleOpenFilter}>
              <FiFilter className="mr-2 h-4 w-4" /> Filter
            </Button>
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

      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        departments={departments}
        positions={positions}
        filters={filters}
        setFilters={setFilters}
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