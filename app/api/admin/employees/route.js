import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Fetch Employees with Search, Filters, and Pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    // Dynamic WHERE clause for search and filters
    const whereClause = `
      WHERE 
        (ashima_id LIKE ? OR name LIKE ?)
        ${department ? `AND department = ?` : ""}
        ${status ? `AND status = ?` : ""}
    `;

    const query = `
      SELECT 
        id, ashima_id, name, department, position, rfid_tag, photo_url, emp_stat, status, created_at
      FROM 
        employees
      ${whereClause}
      ORDER BY 
        created_at DESC
      LIMIT ? OFFSET ?
    `;

    const values = [
      `%${search}%`,
      `%${search}%`,
      ...(department ? [department] : []),
      ...(status ? [status] : []),
      limit,
      offset,
    ];

    const employees = await executeQuery({ query, values });

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM employees 
      ${whereClause}
    `;

    const countValues = [
      `%${search}%`,
      `%${search}%`,
      ...(department ? [department] : []),
      ...(status ? [status] : []),
    ];

    const totalResult = await executeQuery({ query: countQuery, values: countValues });

    return NextResponse.json({
      data: employees,
      total: totalResult[0]?.total || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    return NextResponse.json(
      { message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST: Add a New Employee
export async function POST(req) {
  try {
    const body = await req.json();
    const { ashima_id, name, department, position, rfid_tag, photo_url, emp_stat, status } = body;

    const query = `
      INSERT INTO employees (ashima_id, name, department, position, rfid_tag, photo_url, emp_stat, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [ashima_id, name, department, position, rfid_tag, photo_url, emp_stat, status || "active"];

    const result = await executeQuery({ query, values });

    return NextResponse.json({ id: result.insertId, message: "Employee added successfully" }, { status: 201 });
  } catch (err) {
    console.error("Failed to add employee:", err);
    return NextResponse.json(
      { message: "Failed to add employee" },
      { status: 500 }
    );
  }
}

// PUT: Update an Existing Employee
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ashima_id, name, department, position, rfid_tag, photo_url, emp_stat, status } = body;

    const query = `
      UPDATE employees 
      SET 
        ashima_id = ?, 
        name = ?, 
        department = ?, 
        position = ?, 
        rfid_tag = ?, 
        photo_url = ?, 
        emp_stat = ?, 
        status = ?
      WHERE 
        id = ?
    `;

    const values = [ashima_id, name, department, position, rfid_tag, photo_url, emp_stat, status, id];

    await executeQuery({ query, values });

    return NextResponse.json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error("Failed to update employee:", err);
    return NextResponse.json(
      { message: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an Employee
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const query = `
      DELETE FROM employees 
      WHERE id = ?
    `;

    await executeQuery({ query, values: [id] });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Failed to delete employee:", err);
    return NextResponse.json(
      { message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}