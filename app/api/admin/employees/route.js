import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Helper function to decode Base64 to binary
function decodeBase64ToBinary(base64String) {
  return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64");
}

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
        (e.ashima_id LIKE ? OR e.name LIKE ?)
        ${department ? `AND d.id = ?` : ""}
        ${status ? `AND e.status = ?` : ""}
    `;

    const query = `
      SELECT 
        e.id, e.ashima_id, e.name, 
        d.name AS department, p.name AS position, 
        e.rfid_tag, e.photo, e.emp_stat, e.status,
        e.department_id, e.position_id
      FROM 
        employees e
      LEFT JOIN 
        departments d ON e.department_id = d.id
      LEFT JOIN 
        positions p ON e.position_id = p.id
      ${whereClause}
      ORDER BY 
        e.id DESC
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
    const formattedEmployees = employees.map((employee) => ({
      ...employee,
      photo: employee.photo
        ? `data:image/jpeg;base64,${Buffer.from(employee.photo).toString('base64')}`
        : null,
    }));

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
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
      data: formattedEmployees,
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
    const { ashima_id, name, department_id, position_id, rfid_tag, photo, emp_stat, status } = body;

    // Decode Base64 photo to binary
    const binaryPhoto = photo ? decodeBase64ToBinary(photo) : null;

    const query = `
      INSERT INTO employees (ashima_id, name, department_id, position_id, rfid_tag, photo, emp_stat, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [ashima_id, name, department_id, position_id, rfid_tag, binaryPhoto, emp_stat, status || "active"];

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