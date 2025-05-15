import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Get a specific department
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const query = `SELECT id, name FROM departments WHERE id = ?`;
    const departments = await executeQuery({ query, values: [id] });
    
    if (departments.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ department: departments[0] });
  } catch (error) {
    console.error("Failed to fetch department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

// Update a department
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name } = await request.json();
    
    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }
    
    // Check for duplicate (excluding current department)
    const checkQuery = `SELECT id FROM departments WHERE name = ? AND id != ?`;
    const existing = await executeQuery({ 
      query: checkQuery, 
      values: [name, id] 
    });
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A department with this name already exists" },
        { status: 409 }
      );
    }
    
    // Update department
    const updateQuery = `UPDATE departments SET name = ? WHERE id = ?`;
    await executeQuery({ query: updateQuery, values: [name, id] });
    
    return NextResponse.json({ id: Number(id), name });
  } catch (error) {
    console.error("Failed to update department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

// Delete a department
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if department is in use by any employee
    const checkQuery = `SELECT COUNT(*) as count FROM employees WHERE department_id = ?`;
    const result = await executeQuery({ query: checkQuery, values: [id] });
    
    if (result[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete department that has employees assigned to it" },
        { status: 400 }
      );
    }
    
    // Delete department
    const deleteQuery = `DELETE FROM departments WHERE id = ?`;
    await executeQuery({ query: deleteQuery, values: [id] });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}