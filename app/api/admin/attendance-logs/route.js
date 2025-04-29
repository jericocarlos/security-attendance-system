import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// Fetch attendance logs with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
    const limit = parseInt(searchParams.get("limit")) || 20; // Default 20 logs per page
    const offset = (page - 1) * limit;

    // Fetch logs with pagination and join with employees table for additional details
    const query = `
      SELECT 
        al.id AS log_id,
        al.ashima_id,
        e.name AS employee_name,
        e.department,
        e.position,
        al.log_type,
        al.timestamp
      FROM attendance_logs al
      LEFT JOIN employees e ON al.ashima_id = e.ashima_id
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `;
    const logs = await executeQuery({ query, values: [limit, offset] });

    // Fetch total count for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM attendance_logs`;
    const [{ total }] = await executeQuery({ query: countQuery });

    return NextResponse.json({ logs, total });
  } catch (error) {
    console.error("Error fetching attendance logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance logs." },
      { status: 500 }
    );
  }
}