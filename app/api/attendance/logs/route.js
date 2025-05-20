import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the latest 10 attendance logs
    const query = `
      SELECT 
        a.id, 
        a.ashima_id, 
        a.employee_name as name, 
        a.department, 
        a.log_type, 
        a.timestamp
      FROM 
        attendance_logs a
      ORDER BY 
        a.timestamp DESC
      LIMIT 10
    `;

    const logs = await executeQuery({ query });

    // Format logs for display
    const formattedLogs = logs.map(log => ({
      id: log.id,
      ashima_id: log.ashima_id,
      name: log.name,
      department: log.department,
      log_type: log.log_type,
      timestamp: log.timestamp
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error("Failed to fetch attendance logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance logs" },
      { status: 500 }
    );
  }
}