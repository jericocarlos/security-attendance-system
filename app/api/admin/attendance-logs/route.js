import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || ''; // Search term
    const filter = searchParams.get('filter') || ''; // Optional filter
    const offset = (page - 1) * limit;

    // Dynamic WHERE clause for search and filter
    const whereClause = `
      WHERE 
        (employees.ashima_id LIKE ? OR employees.name LIKE ?)
        ${filter ? `AND attendance_logs.log_type = ?` : ''}
    `;

    const query = `
      SELECT 
        attendance_logs.id AS log_id, 
        employees.ashima_id AS ashima_id, 
        employees.name, 
        employees.department, 
        attendance_logs.log_type, 
        attendance_logs.timestamp
      FROM 
        attendance_logs
      JOIN 
        employees 
      ON 
        attendance_logs.ashima_id = employees.id
      ${whereClause}
      ORDER BY 
        attendance_logs.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const values = [
      `%${search}%`, 
      `%${search}%`, 
      ...(filter ? [filter] : []), 
      limit, 
      offset,
    ];

    const logs = await executeQuery({ query, values });

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM attendance_logs 
      JOIN employees 
      ON attendance_logs.ashima_id = employees.id
      ${whereClause}
    `;
    const countValues = [
      `%${search}%`, 
      `%${search}%`, 
      ...(filter ? [filter] : []),
    ];
    const totalResult = await executeQuery({ query: countQuery, values: countValues });

    return NextResponse.json({
      data: logs,
      total: totalResult[0]?.total || 0,
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