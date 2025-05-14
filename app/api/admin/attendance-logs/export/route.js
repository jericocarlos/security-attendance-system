import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// Utility function to convert data to CSV format
function convertToCSV(data) {
  const headers = ['Ashima ID', 'Log Type', 'Timestamp'];
  const rows = data.map((row) => [
    row.ashima_id,
    row.log_type,
    new Date(row.timestamp).toLocaleString(),
  ]);

  return [headers, ...rows].map((line) => line.join(',')).join('\n');
}

// Export attendance logs as CSV
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract filters from query parameters
    const logType = searchParams.get('log_type') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    // Construct the SQL query with filters
    let query = `
      SELECT 
        attendance_logs.ashima_id,
        attendance_logs.log_type,
        attendance_logs.timestamp
      FROM attendance_logs
      WHERE 1 = 1
    `;

    // Apply log type filter
    if (logType) {
      query += ` AND attendance_logs.log_type = '${logType}'`;
    }

    // Apply date range filter
    if (startDate) {
      query += ` AND DATE(attendance_logs.timestamp) >= '${startDate}'`;
    }
    if (endDate) {
      query += ` AND DATE(attendance_logs.timestamp) <= '${endDate}'`;
    }

    // Order logs by timestamp (most recent first)
    query += ` ORDER BY attendance_logs.timestamp DESC`;

    // Execute the query
    const data = await executeQuery({ query });

    // Convert data to CSV format
    const csv = convertToCSV(data);

    // Return the CSV as a downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="attendance_logs.csv"',
      },
    });
  } catch (err) {
    console.error('Failed to export attendance logs:', err);
    return NextResponse.json(
      { message: 'Failed to export attendance logs' },
      { status: 500 }
    );
  }
}