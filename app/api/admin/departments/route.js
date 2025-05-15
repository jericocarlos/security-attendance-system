import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Get all departments with optional pagination and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query based on whether search is provided
    let query, queryParams, countQuery, countParams;
    
    if (search) {
      query = `
        SELECT id, name 
        FROM departments 
        WHERE name LIKE ? 
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;
      queryParams = [`%${search}%`, limit, offset];
      
      countQuery = `
        SELECT COUNT(*) as total
        FROM departments
        WHERE name LIKE ?
      `;
      countParams = [`%${search}%`];
    } else {
      query = `
        SELECT id, name 
        FROM departments 
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `;
      queryParams = [limit, offset];
      
      countQuery = `SELECT COUNT(*) as total FROM departments`;
      countParams = [];
    }
    
    // Execute queries
    const departments = await executeQuery({ query, values: queryParams });
    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0].total;
    
    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" }, 
      { status: 500 }
    );
  }
}

// Add a new department
export async function POST(request) {
  try {
    const { name } = await request.json();
    
    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Department name is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    // Sanitize name - trim whitespace
    const sanitizedName = name.trim();
    
    // Check for duplicate
    const checkQuery = `SELECT id FROM departments WHERE name = ?`;
    const existing = await executeQuery({ query: checkQuery, values: [sanitizedName] });
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A department with this name already exists" },
        { status: 409 }
      );
    }
    
    // Get the maximum ID and increment by 1
    const maxIdQuery = `SELECT MAX(id) as maxId FROM departments`;
    const maxIdResult = await executeQuery({ query: maxIdQuery });
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    
    // Insert new department with explicit ID
    const insertQuery = `INSERT INTO departments (id, name) VALUES (?, ?)`;
    const result = await executeQuery({ query: insertQuery, values: [nextId, sanitizedName] });
    
    // Return the created department with its ID
    const department = { id: nextId, name: sanitizedName };
    
    return NextResponse.json({ 
      message: "Department created successfully",
      department 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}