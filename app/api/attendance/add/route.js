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

    // Step 1: Fetch employee information by RFID tag, including department and position names
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

    // Step 2: Convert photo blob to Base64 (if photo exists)
    if (employee.photo) {
      employee.photo = `data:image/png;base64,${Buffer.from(employee.photo).toString('base64')}`;
    }

    // Step 3: Determine the log type (IN or OUT) based on the latest log
    const latestLogQuery = `
      SELECT log_type
      FROM attendance_logs
      WHERE ashima_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const [latestLog] = await executeQuery({ query: latestLogQuery, values: [employee.ashima_id] });
    const nextLogType = latestLog?.log_type === 'IN' ? 'OUT' : 'IN';

    // Step 4: Insert the new attendance log
    const insertLogQuery = `
      INSERT INTO attendance_logs (ashima_id, log_type, timestamp)
      VALUES (?, ?, NOW())
    `;
    await executeQuery({ query: insertLogQuery, values: [employee.ashima_id, nextLogType] });

    // Step 5: Update the last_active column
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found for the provided RFID tag.' },
        { status: 404 }
      );
    }

    if (employee.status === 'inactive') {
      const updateStatusQuery = `
        UPDATE employees
        SET status = 'active', last_active = NOW()
        WHERE ashima_id = ?
      `;
      await executeQuery({ query: updateStatusQuery, values: [employee.ashima_id] });
    } else {
      // Update last_active for active users
      const updateLastActiveQuery = `
        UPDATE employees
        SET last_active = NOW()
        WHERE ashima_id = ?
      `;
      await executeQuery({ query: updateLastActiveQuery, values: [employee.ashima_id] });
    }

    // Step 6: Fetch the latest "Time In" and "Time Out" logs
    const timeLogsQuery = `
      SELECT 
        MAX(CASE WHEN log_type = 'IN' THEN timestamp END) AS timeIn,
        MAX(CASE WHEN log_type = 'OUT' THEN timestamp END) AS timeOut
      FROM attendance_logs
      WHERE ashima_id = ?
    `;
    const [timeLogs] = await executeQuery({ query: timeLogsQuery, values: [employee.ashima_id] });

    // Step 7: Return the employee data and the updated time logs
    return NextResponse.json({
      employee: {
        ...employee,
        timeIn: timeLogs.timeIn,
        timeOut: timeLogs.timeOut,
      },
      logType: nextLogType, // Return the current log type (IN or OUT)
    });
  } catch (error) {
    console.error('Error processing attendance log:', error);
    return NextResponse.json(
      { error: 'Failed to process attendance log.' },
      { status: 500 }
    );
  }
}