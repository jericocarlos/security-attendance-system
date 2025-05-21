import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // SQL query to fetch the latest attendance logs from the new attendance_logs table
    const query = `
      SELECT 
        al.id, 
        e.rfid_tag, 
        e.name, 
        d.name AS department, 
        p.name AS position, 
        al.log_type, 
        al.in_time, 
        al.out_time
      FROM attendance_logs al
      JOIN employees e 
        ON al.ashima_id = e.ashima_id
      LEFT JOIN departments d
        ON e.department_id = d.id
      LEFT JOIN positions p
        ON e.position_id = p.id
      ORDER BY al.in_time DESC
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