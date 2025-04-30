"use client";

import { useState, useEffect } from "react";
import ConfirmationModal from "./_components/ConfirmationModal";
import EditEmployeeForm from "./_components/EditEmployeeForm";
import AddEmployeeForm from "./_components/AddEmployeeForm";


export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false); // Show Add Employee Form
  const [showEditForm, setShowEditForm] = useState(false); // Show Edit Employee Form
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Employee being edited
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/employees?page=${page}&limit=${limit}&search=${search}&department=${departmentFilter}&status=${statusFilter}`
        );
        const data = await response.json();
        setEmployees(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, limit, search, departmentFilter, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleFilterChange = (e, type) => {
    if (type === "department") setDepartmentFilter(e.target.value);
    if (type === "status") setStatusFilter(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleAddEmployee = () => {
    setShowAddForm(true); // Show Add Employee Form
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditForm(true); // Show Edit Employee Form
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
    setShowAddForm(false); // Hide Add Form
    setShowEditForm(false); // Hide Edit Form
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>

      {/* Search and Filters */}
      <div className="flex mb-4 gap-4">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by ID or Name"
          className="px-4 py-2 border rounded-md w-full"
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
        <button
          onClick={handleAddEmployee}
          className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Employee
        </button>
      </div>

      {/* Employee Table */}
      {loading ? (
        <p>Loading...</p>
      ) : employees.length > 0 ? (
        <div>
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Ashima ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Position</th>
                <th className="px-4 py-2">Employee Status</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="border px-4 py-2">{employee.ashima_id}</td>
                  <td className="border px-4 py-2">{employee.name}</td>
                  <td className="border px-4 py-2">{employee.department}</td>
                  <td className="border px-4 py-2">{employee.position}</td>
                  <td className="border px-4 py-2">{employee.emp_stat}</td>
                  <td className="border px-4 py-2">{employee.status}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p>No employees available.</p>
      )}

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