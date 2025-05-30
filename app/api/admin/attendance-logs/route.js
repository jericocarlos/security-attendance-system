import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

// Fetch attendance logs with employee details
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100'); // Change default to 100
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const logType = searchParams.get('log_type') || 'ALL';
    const department = searchParams.get('department') || ''; // Add department filter
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    // Build the search condition
    let conditions = [];
    const values = [];

    // Add search condition
    if (search) {
      conditions.push("(l.ashima_id LIKE ? OR e.name LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    // Add log type filter
    if (logType === 'IN') {
      conditions.push("l.out_time IS NULL");
    } else if (logType === 'OUT') {
      conditions.push("l.out_time IS NOT NULL");
    }
    
    // Add department filter
    if (department) {
      conditions.push("e.department_id = ?");
      values.push(department);
    }

    // Add date range filters
    if (startDate) {
      conditions.push("DATE(l.in_time) >= ?");
      values.push(startDate);
    }

    if (endDate) {
      conditions.push("DATE(l.in_time) <= ?");
      values.push(endDate);
    }

    // Combine conditions
    const whereClause = conditions.length > 0 
      ? "WHERE " + conditions.join(" AND ") 
      : "";

    // Add pagination values
    values.push(limit, offset);

    // Query to fetch logs with pagination
    const query = `
      SELECT
        l.id, l.ashima_id, e.name, e.department_id,
        d.name AS department, l.log_type,
        l.in_time, l.out_time
      FROM
        attendance_logs l
      LEFT JOIN
        employees e ON e.ashima_id = l.ashima_id
      LEFT JOIN
        departments d ON e.department_id = d.id
      ${whereClause}
      ORDER BY l.in_time DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await executeQuery({ query, values });

    // Count total records for pagination
    const countConditions = conditions.length > 0 
      ? "WHERE " + conditions.join(" AND ") 
      : "";
    const countValues = values.slice(0, values.length - 2); // Remove limit and offset

    const countQuery = `
      SELECT COUNT(*) as total
      FROM attendance_logs l
      LEFT JOIN employees e ON e.ashima_id = l.ashima_id
      LEFT JOIN departments d ON e.department_id = d.id
      ${countConditions}
    `;

    const countResult = await executeQuery({ query: countQuery, values: countValues });
    const total = countResult[0].total;

    return NextResponse.json({ 
      data: logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) 
    });
  } catch (err) {
    console.error("Failed to fetch attendance logs:", err);
    return NextResponse.json(
      { message: `Failed to fetch attendance logs: ${err.message}` },
      { status: 500 }
    );
  }
}