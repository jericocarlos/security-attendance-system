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

    // Fetch employee info
    const employeeQuery = `
      SELECT 
        e.id AS employee_id, 
        e.ashima_id, 
        e.name, 
        d.name AS department, 
        p.name AS position, 
        e.photo, 
        e.emp_stat, 
        e.status
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.rfid_tag = ?
    `;
    const [employee] = await executeQuery({ query: employeeQuery, values: [rfid_tag] });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found for the provided RFID tag.' },
        { status: 404 }
      );
    }

    if (employee.photo) {
      employee.photo = `data:image/png;base64,${Buffer.from(employee.photo).toString('base64')}`;
    }

    // Step 1: Get latest attendance log for this user
    const latestLogQuery = `
      SELECT id, log_type, in_time, out_time
      FROM attendance_logs
      WHERE ashima_id = ?
      ORDER BY in_time DESC
      LIMIT 1
    `;
    const [latestLog] = await executeQuery({ query: latestLogQuery, values: [employee.ashima_id] });

    let nextLogType = "IN";
    let insertLogQuery = "";
    let insertLogValues = [];

    if (!latestLog || latestLog.log_type === "OUT" || (latestLog.log_type === "IN" && latestLog.out_time)) {
      // No log, or last log is OUT, or last IN already paired: this should be a new IN
      nextLogType = "IN";
      insertLogQuery = `
        INSERT INTO attendance_logs (ashima_id, log_type, in_time, out_time)
        VALUES (?, 'IN', NOW(), NULL)
      `;
      insertLogValues = [employee.ashima_id];
    } else if (latestLog.log_type === "IN" && !latestLog.out_time) {
      // Last log is IN and has no out_time: this should be OUT and update the previous IN
      nextLogType = "OUT";
      // Update the previous IN with out_time and log_type OUT
      const updateQuery = `
        UPDATE attendance_logs
        SET log_type = 'OUT', out_time = NOW()
        WHERE id = ?
      `;
      await executeQuery({ query: updateQuery, values: [latestLog.id] });
    }

    // Only do insert if this is a new IN
    if (insertLogQuery) {
      await executeQuery({ query: insertLogQuery, values: insertLogValues });
    }

    // Update status/last_active as before
    if (employee.status === 'inactive') {
      const updateStatusQuery = `
        UPDATE employees
        SET status = 'active', last_active = NOW()
        WHERE ashima_id = ?
      `;
      await executeQuery({ query: updateStatusQuery, values: [employee.ashima_id] });
    } else {
      const updateLastActiveQuery = `
        UPDATE employees
        SET last_active = NOW()
        WHERE ashima_id = ?
      `;
      await executeQuery({ query: updateLastActiveQuery, values: [employee.ashima_id] });
    }

    // Return the latest attendance entry for this user
    const mergedLogsQuery = `
      SELECT *
      FROM attendance_logs
      WHERE ashima_id = ?
      ORDER BY in_time DESC
      LIMIT 1
    `;
    const [attendanceLog] = await executeQuery({ query: mergedLogsQuery, values: [employee.ashima_id] });

    return NextResponse.json({
      employee,
      attendanceLog,
      logType: nextLogType
    });
  } catch (error) {
    console.error('Error processing attendance log:', error);
    return NextResponse.json(
      { error: 'Failed to process attendance log.' },
      { status: 500 }
    );
  }
}