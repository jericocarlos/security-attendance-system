import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // SQL query to fetch the latest attendance logs
    const query = `
      SELECT 
        al.id, 
        e.rfid_tag, 
        e.name, 
        e.department, 
        e.position, 
        al.log_type, 
        al.timestamp 
      FROM attendance_logs al
      JOIN employees e 
        ON al.ashima_id = e.ashima_id
      ORDER BY al.timestamp DESC
      LIMIT 20
    `;

    // Execute the query
    const logs = await executeQuery({ query });

    // Return the logs as a JSON response
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching attendance logs:', error);

    // Return an error response if the query fails
    return NextResponse.json(
      { error: 'Failed to fetch attendance logs.' },
      { status: 500 }
    );
  }
}