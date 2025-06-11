import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Get a specific position
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const query = `SELECT id, name FROM positions WHERE id = ?`;
    const positions = await executeQuery({ query, values: [id] });
    
    if (positions.length === 0) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ position: positions[0] });
  } catch (error) {
    console.error("Failed to fetch position:", error);
    return NextResponse.json(
      { error: "Failed to fetch position" },
      { status: 500 }
    );
  }
}

// Update a position
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, is_leader } = await request.json();
    
    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Position name is required" },
        { status: 400 }
      );
    }
    
    // Sanitize name
    const sanitizedName = name.trim();
    
    // Check for duplicate (excluding current position)
    const checkQuery = `SELECT id FROM positions WHERE name = ? AND id != ?`;
    const existing = await executeQuery({ 
      query: checkQuery, 
      values: [sanitizedName, id] 
    });
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A position with this name already exists" },
        { status: 409 }
      );
    }
    
    // Update position
    const updateQuery = `UPDATE positions SET name = ?, is_leader = ? WHERE id = ?`;
    await executeQuery({ query: updateQuery, values: [sanitizedName, is_leader ? 1 : 0, id] });
    
    return NextResponse.json({ 
      message: "Position updated successfully",
      position: { id: Number(id), name: sanitizedName, is_leader: is_leader ? 1 : 0 }
    });
  } catch (error) {
    console.error("Failed to update position:", error);
    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 500 }
    );
  }
}

// Delete a position
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if position is in use by any employee
    const checkQuery = `SELECT COUNT(*) as count FROM employees WHERE position_id = ?`;
    const result = await executeQuery({ query: checkQuery, values: [id] });
    
    if (result[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete position that has employees assigned to it" },
        { status: 400 }
      );
    }
    
    // Delete position
    const deleteQuery = `DELETE FROM positions WHERE id = ?`;
    await executeQuery({ query: deleteQuery, values: [id] });
    
    return NextResponse.json({ 
      message: "Position deleted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Failed to delete position:", error);
    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 500 }
    );
  }
}