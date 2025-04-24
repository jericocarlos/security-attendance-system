import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request) {
  try {
    const { rfid_tag } = await request.json();

    if (!rfid_tag) {
      return NextResponse.json(
        { error: 'RFID tag is required.' },
        { status: 400 }
      );
    }

    // Fetch employee by RFID tag
    const employeeQuery = 'SELECT * FROM employees WHERE rfid_tag = ?';
    const [employee] = await executeQuery({ query: employeeQuery, values: [rfid_tag] });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found for the provided RFID tag.' },
        { status: 404 }
      );
    }

    // Check the last log type to determine IN or OUT
    const lastLogQuery = `
      SELECT log_type FROM attendance_logs
      WHERE employee_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const [lastLog] = await executeQuery({ query: lastLogQuery, values: [employee.id] });

    const logType = lastLog?.log_type === 'IN' ? 'OUT' : 'IN';

    // Insert new attendance log
    const insertLogQuery = 'INSERT INTO attendance_logs (employee_id, log_type) VALUES (?, ?)';
    await executeQuery({ query: insertLogQuery, values: [employee.id, logType] });

    return NextResponse.json({
      success: true,
      message: `Attendance ${logType} recorded successfully!`,
      employee,
      logType,
    });
  } catch (error) {
    console.error('Error adding attendance log:', error);
    return NextResponse.json(
      { error: 'Failed to add attendance log.' },
      { status: 500 }
    );
  }
}