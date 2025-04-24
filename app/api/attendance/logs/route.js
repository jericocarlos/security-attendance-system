import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT al.id, al.log_type, al.timestamp, e.name, e.department
      FROM attendance_logs al
      JOIN employees e ON al.employee_id = e.id
      ORDER BY al.timestamp DESC
      LIMIT 20
    `;
    const logs = await executeQuery({ query });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance logs.' },
      { status: 500 }
    );
  }
}