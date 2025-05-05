"use client";

import { useState, useEffect, useCallback } from "react";
import ConfirmationModal from "./_components/ConfirmationModal";
import EditEmployeeForm from "./_components/EditEmployeeForm";
import AddEmployeeForm from "./_components/AddEmployeeForm";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const fetchEmployees = useCallback(async (signal) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/employees?page=${page}&limit=${limit}&search=${search}&department=${departmentFilter}&status=${statusFilter}`,
        { signal }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setEmployees(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Failed to fetch employees:", err);
        // You could add error state handling here if needed
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, departmentFilter, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEmployees(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchEmployees]);

  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (e, type) => {
    if (type === "department") setDepartmentFilter(e.target.value);
    if (type === "status") setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleAddEmployee = () => {
    setShowAddForm(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditForm(true);
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await fetch(`/api/admin/employees?id=${employeeToDelete.id}`, {
        method: "DELETE",
      });
      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== employeeToDelete.id)
      );
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete employee:", err);
    }
  };

  const handleSaveEmployee = (newEmployee) => {
    setEmployees((prev) =>
      selectedEmployee
        ? prev.map((emp) =>
            emp.id === newEmployee.id ? newEmployee : emp
          )
        : [...prev, newEmployee]
    );
    setShowAddForm(false);
    setShowEditForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
        <button
          onClick={handleAddEmployee}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Add Employee
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by ID or Name"
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <select
          value={departmentFilter}
          onChange={(e) => handleFilterChange(e, "department")}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Departments</option>
          <option value="HR">HR</option>
          <option value="IT">IT</option>
          <option value="Finance">Finance</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e, "status")}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Employee Table */}
      {loading ? (
        <p>Loading...</p>
      ) : employees.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Ashima ID</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Name</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Department</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Position</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Employee Status</th>
                <th className="px-4 py-2 text-left text-gray-600 font-medium">Status</th>
                {/* <th className="px-4 py-2 text-left text-gray-600 font-medium">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-t cursor-pointer hover:bg-gray-100"
                  onClick={() => handleEditEmployee(employee)} // Make row clickable
                >
                  <td className="px-4 py-2">{employee.ashima_id}</td>
                  <td className="px-4 py-2">{employee.name}</td>
                  <td className="px-4 py-2">{employee.department}</td>
                  <td className="px-4 py-2">{employee.position}</td>
                  <td className="px-4 py-2">{employee.emp_stat}</td>
                  <td className="px-4 py-2">{employee.status}</td>
                  {/* <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleDeleteEmployee(employee);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">No employees available.</p>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <AddEmployeeForm
          onClose={() => setShowAddForm(false)}
          onSave={handleSaveEmployee}
        />
      )}

      {/* Edit Employee Form */}
      {showEditForm && selectedEmployee && (
        <EditEmployeeForm
          employee={selectedEmployee}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveEmployee}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete ${employeeToDelete?.name}?`}
        />
      )}
    </div>
  );
}