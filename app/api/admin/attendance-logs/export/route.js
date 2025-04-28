import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// Utility function to convert data to CSV format
function convertToCSV(data) {
  const headers = ['Employee ID', 'Name', 'Department', 'Log Type', 'Timestamp'];
  const rows = data.map((row) => [
    row.ashima_id,
    row.name,
    row.department,
    row.log_type,
    new Date(row.timestamp).toLocaleString(),
  ]);

  return [headers, ...rows].map((line) => line.join(',')).join('\n');
}

// Export attendance logs as CSV
export async function GET(req) {
  try {
    const query = `
      SELECT 
        attendance_logs.id,
        employees.ashima_id,
        employees.name,
        employees.department,
        attendance_logs.log_type,
        attendance_logs.timestamp
      FROM attendance_logs
      JOIN employees ON attendance_logs.ashima_id = employees.id
      ORDER BY attendance_logs.timestamp DESC
    `;

    const data = await executeQuery({ query });

    const csv = convertToCSV(data);

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