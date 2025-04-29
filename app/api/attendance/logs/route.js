import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { parse } from "json2csv";

// Fetch attendance logs with pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    // Fetch logs with employee details (joining with employees table)
    const query = `
      SELECT 
        al.id,
        al.ashima_id,
        e.name,
        e.department,
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

// Export attendance logs as CSV
export async function POST() {
  try {
    const query = `
      SELECT 
        al.id,
        al.ashima_id,
        e.name,
        e.department,
        al.log_type,
        al.timestamp
      FROM attendance_logs al
      LEFT JOIN employees e ON al.ashima_id = e.ashima_id
      ORDER BY al.timestamp DESC
    `;
    const logs = await executeQuery({ query });

    // Convert logs to CSV format
    const csv = parse(logs, {
      fields: ["id", "ashima_id", "name", "department", "log_type", "timestamp"],
    });

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=attendance_logs.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting attendance logs as CSV:", error);
    return NextResponse.json(
      { error: "Failed to export attendance logs." },
      { status: 500 }
    );
  }
}