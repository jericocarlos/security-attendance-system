"use client";
import { useState } from "react";
import EmployeeForm from "./_components/EmployeeForm";


export default function EmployeeManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleAddEmployee = () => {
    setSelectedEmployee(null); // Reset form for adding a new employee
    setShowForm(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee); // Load employee data into the form
    setShowForm(true);
  };

  const handleSaveEmployee = (newEmployee) => {
    // Update the employee list or refresh the data
    console.log("Employee saved:", newEmployee);
    setShowForm(false);
  };

  return (
    <div>
      <button
        onClick={handleAddEmployee}
        className="px-4 py-2 bg-green-500 text-white rounded-md"
      >
        Add Employee
      </button>

      {/* Render the EmployeeForm modal when showForm is true */}
      {showForm && (
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleSaveEmployee}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}