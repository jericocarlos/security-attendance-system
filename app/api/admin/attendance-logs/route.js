import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

// Fetch attendance logs with employee details
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || ''; // For searching by name or ashima_id
    const logType = searchParams.get('log_type') || ''; // For filtering by log_type
    const startDate = searchParams.get('start_date'); // Start date for date range filter
    const endDate = searchParams.get('end_date'); // End date for date range filter

    // Add this near the top of your GET function
    let adjustedEndDate = null;
    if (endDate) {
      // Add one day to end date and subtract 1 second to get 23:59:59 of the selected day
      adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      adjustedEndDate = adjustedEndDate.toISOString().split('T')[0];
    }

    // Validate query parameters
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { message: 'Page and limit must be positive integers' },
        { status: 400 }
      );
    }

    if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
      return NextResponse.json(
        { message: 'Invalid start date or end date' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Base query for fetching attendance logs - updated to search by both name and ashima_id
    let query = `
      SELECT
        a.id, a.ashima_id, e.name, e.department_id,
        d.name AS department, a.log_type,
        a.timestamp
      FROM
        attendance_logs a
      LEFT JOIN
        employees e ON e.ashima_id = a.ashima_id
      LEFT JOIN
        departments d ON e.department_id = d.id
      WHERE
        (a.ashima_id LIKE ? OR e.name LIKE ?)
        ${logType && logType !== 'all' ? 'AND a.log_type = ?' : ''}
        ${startDate ? 'AND a.timestamp >= ?' : ''}
        ${endDate ? 'AND a.timestamp < ?' : ''}
      ORDER BY a.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    // Build query values - now includes search term twice for ashima_id and name
    const queryValues = [`%${search}%`, `%${search}%`];
    if (logType && logType !== 'all') queryValues.push(logType);
    if (startDate) queryValues.push(startDate);
    if (endDate) queryValues.push(adjustedEndDate);
    queryValues.push(limit, offset);

    // Execute the query to fetch logs
    const rows = await executeQuery({
      query,
      values: queryValues,
    });

    // Count query for total records with applied filters - updated for name search
    let countQuery = `
      SELECT COUNT(*) AS total
      FROM attendance_logs a
      LEFT JOIN employees e ON e.ashima_id = a.ashima_id
      WHERE (a.ashima_id LIKE ? OR e.name LIKE ?)
      ${logType && logType !== 'all' ? 'AND a.log_type = ?' : ''}
      ${startDate ? 'AND a.timestamp >= ?' : ''}
      ${endDate ? 'AND a.timestamp < ?' : ''}
    `;

    // Build count query values - also includes search term twice
    const countValues = [`%${search}%`, `%${search}%`];
    if (logType && logType !== 'all') countValues.push(logType);
    if (startDate) countValues.push(startDate);
    if (endDate) countValues.push(adjustedEndDate);

    const countResult = await executeQuery({
      query: countQuery,
      values: countValues,
    });

    // Return the logs along with pagination details
    return NextResponse.json({
      data: rows,
      total: countResult[0]?.total || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error('Failed to fetch attendance logs:', err.message);
    return NextResponse.json(
      { message: 'Failed to fetch attendance logs' },
      { status: 500 }
    );
  }
}