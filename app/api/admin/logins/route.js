import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

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

// Get all positions with optional pagination and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const isLeader = searchParams.get('isLeader'); // Add isLeader parameter
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query based on search and isLeader filter
    let query = `SELECT id, name, is_leader FROM positions WHERE 1=1`;
    let queryParams = [];
    
    // Add search condition if provided
    if (search) {
      query += ` AND name LIKE ?`;
      queryParams.push(`%${search}%`);
    }
    
    // Add isLeader condition if provided
    if (isLeader !== null && isLeader !== undefined) {
      query += ` AND is_leader = ?`;
      queryParams.push(isLeader);
    }
    
    // Add order, limit and offset
    query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Count query with the same conditions (except limit/offset)
    let countQuery = `SELECT COUNT(*) as total FROM positions WHERE 1=1`;
    let countParams = [];
    
    if (search) {
      countQuery += ` AND name LIKE ?`;
      countParams.push(`%${search}%`);
    }
    
    if (isLeader !== null && isLeader !== undefined) {
      countQuery += ` AND is_leader = ?`;
      countParams.push(isLeader);
    }
    
    // Execute queries
    const positions = await executeQuery({ query, values: queryParams });
    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0].total;
    
    return NextResponse.json({
      positions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" }, 
      { status: 500 }
    );
  }
}

// Add a new position with manual ID generation
export async function POST(request) {
  try {
    const { name, is_leader } = await request.json();
    
    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Position name is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    // Sanitize name - trim whitespace
    const sanitizedName = name.trim();
    
    // Check for duplicate
    const checkQuery = `SELECT id FROM positions WHERE name = ?`;
    const existing = await executeQuery({ query: checkQuery, values: [sanitizedName] });
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A position with this name already exists" },
        { status: 409 }
      );
    }
    
    // Get the maximum ID and increment by 1
    const maxIdQuery = `SELECT MAX(id) as maxId FROM positions`;
    const maxIdResult = await executeQuery({ query: maxIdQuery });
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    
    // Insert new position with explicit ID
    const insertQuery = `INSERT INTO positions (id, name, is_leader) VALUES (?, ?, ?)`;
    await executeQuery({ query: insertQuery, values: [nextId, sanitizedName, is_leader ? 1 : 0] });
    
    // Return the created position with its ID
    const position = { id: nextId, name: sanitizedName, is_leader: is_leader ? 1 : 0 };
    
    return NextResponse.json({ 
      message: "Position created successfully",
      position 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create position:", error);
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}