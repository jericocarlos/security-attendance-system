"use client";

import React, { useEffect, useState } from "react";
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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
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
      enqueueSnackbar("Failed to load employees", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsAndPositions = async () => {
    setLoadingMetadata(true);
    try {
      const deptResponse = await fetch('/api/admin/departments');
      if (!deptResponse.ok) throw new Error("Failed to fetch departments");
      const deptData = await deptResponse.json();

      const posResponse = await fetch('/api/admin/positions');
      if (!posResponse.ok) throw new Error("Failed to fetch positions");
      const posData = await posResponse.json();

      setDepartments(deptData.departments || []);
      setPositions(posData.positions || []);
    } catch (error) {
      console.error("Error fetching departments/positions:", error);
      enqueueSnackbar("Failed to load form data", { variant: "warning" });
    } finally {
      setLoadingMetadata(false);
    }
  };

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
  }, [pagination.pageIndex, pagination.pageSize, searchQuery, filters]);

  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, []);

  const handleOpenForm = (employee = null) => {
    setCurrentEmployee(employee);
    fetchDepartmentsAndPositions();
    setIsFormDialogOpen(true);
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