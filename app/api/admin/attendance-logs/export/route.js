import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const logType = searchParams.get('log_type') || '';
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

    // Query to fetch logs for export
    const query = `
      SELECT
        l.ashima_id, e.name, d.name AS department, 
        DATE(l.in_time) AS log_date,
        l.in_time, l.out_time
      FROM
        attendance_logs l
      LEFT JOIN
        employees e ON e.ashima_id = l.ashima_id
      LEFT JOIN
        departments d ON e.department_id = d.id
      ${whereClause}
      ORDER BY l.in_time DESC
    `;

    const logs = await executeQuery({ query, values });

    // Generate CSV content
    const headers = ["Ashima ID", "Name", "Department", "Date", "Time In", "Time Out"];
    
    let csvContent = headers.join(",") + "\n";
    
    logs.forEach(log => {
      const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString();
      };
      
      const formatTime = (datetime) => {
        if (!datetime) return "";
        return new Date(datetime).toLocaleTimeString();
      };
      
      const row = [
        log.ashima_id || "",
        (log.name || "").replace(/,/g, " "), // Replace commas in names
        (log.department || "").replace(/,/g, " "), // Replace commas in department names
        formatDate(log.log_date),
        formatTime(log.in_time),
        formatTime(log.out_time)
      ];
      
      csvContent += row.join(",") + "\n";
    });

    // Return CSV as a downloadable file
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_logs_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Failed to export attendance logs:", error);
    return NextResponse.json(
      { message: "Failed to export attendance logs" },
      { status: 500 }
    );
  }
}