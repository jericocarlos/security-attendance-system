import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// Fetch attendance logs with employee details
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Query to fetch attendance logs with employee details
    const query = `
      SELECT 
        attendance_logs.id,
        employees.ashima_id,
        employees.name,
        employees.department,
        attendance_logs.log_type,
        attendance_logs.timestamp
      FROM attendance_logs
      JOIN employees ON attendance_logs.ashima_id = ashima.id
      ORDER BY attendance_logs.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await executeQuery({
      query,
      values: [limit, offset],
    });

    // Query to count total attendance logs
    const countQuery = `SELECT COUNT(*) AS total FROM attendance_logs`;
    const countResult = await executeQuery({
      query: countQuery,
    });

    return NextResponse.json({
      data: rows,
      total: countResult[0]?.total || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('Failed to fetch attendance logs:', err);
    return NextResponse.json(
      { message: 'Failed to fetch attendance logs' },
      { status: 500 }
    );
  }
}