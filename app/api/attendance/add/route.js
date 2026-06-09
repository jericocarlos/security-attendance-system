import { NextResponse } from 'next/server';
import { executeQuery, attendancePool, freemealPool } from '@/lib/db';

function formatEmployeePhoto(photo) {
  if (!photo) {
    return null;
  }

  const photoBuffer = Buffer.isBuffer(photo) ? photo : Buffer.from(photo);
  if (photoBuffer.length === 0) {
    return null;
  }

  return `data:image/png;base64,${photoBuffer.toString('base64')}`;
}

// Helper function to update employee status across multiple tables
async function updateEmployeeStatusByTable(conn, ashimaId, isEnabled) {
  // Try updating employees table
  const [result1] = await conn.execute(
    `UPDATE employees SET is_enabled = ? WHERE ashima_id = ?`,
    [isEnabled, ashimaId]
  );
  
  if (result1.affectedRows > 0) {
    return; // Successfully updated employees table
  }
  
  // Try updating interns table by id_number
  const [result2] = await conn.execute(
    `UPDATE interns SET is_enabled = ? WHERE id_number = ?`,
    [isEnabled, ashimaId]
  );
  
  if (result2.affectedRows > 0) {
    return; // Successfully updated interns table
  }
  
  // Try updating trainees table by ashima_id
  const [result3] = await conn.execute(
    `UPDATE trainees SET is_enabled = ? WHERE ashima_id = ?`,
    [isEnabled, ashimaId]
  );
  
  if (result3.affectedRows > 0) {
    return; // Successfully updated trainees table
  }
}

// async function insertUnclaimedFreemealLogIfNeeded(conn, ashimaId) {
//   const [claimedRows] = await conn.execute(
//     `SELECT 1 FROM freemeal_logs WHERE ashima_id = ? AND DATE(date_claimed) = CURDATE() LIMIT 1`,
//     [ashimaId]
//   );

//   if (!claimedRows.length) {
//     await conn.execute(
//       `INSERT INTO unclaimed_freemeal_logs (unclaim_date, ashima_id, log_type)
//        VALUES (?, ?, 'UNCLAIMED')`,
//       [new Date(), ashimaId] // meal_type can be determined based on your business logic, using 'UNKNOWN' as a placeholder
//     );
//   }
// }

export async function POST(request) {
  let attendanceConn;
  let freemealConn;

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

    employee.photo = formatEmployeePhoto(employee.photo);

    // Step 1: Get latest attendance log for this user
    const latestLogQuery = `
      SELECT id, log_type, in_time, out_time
      FROM attendance_logs
      WHERE ashima_id = ?
      ORDER BY in_time DESC
      LIMIT 1
    `;
    const [latestLog] = await executeQuery({ query: latestLogQuery, values: [employee.ashima_id] });
    attendanceConn = await attendancePool.getConnection();
    freemealConn = await freemealPool.getConnection();

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

      // ------------------------------- code added 01-14-2026 ------------------------------------------------
      // const attendanceConn = await attendancePool.getConnection();
      // const freemealConn = await freemealPool.getConnection();

      //const conn = await freemealPool.getConnection();
      //await freemealConn.ping();
      // freemealConn.release();
      //console.log('Freemeal DB connected');

      try {
        // separate transactions (NOT atomic together)
        await attendanceConn.beginTransaction();
        await freemealConn.beginTransaction();

        // 1️⃣ Insert on Attendance DB (Server A)
        await attendanceConn.execute(insertLogQuery, insertLogValues);

        // 2️⃣ Update on HR DB (Server B) - check employees, interns, then trainees tables
        await updateEmployeeStatusByTable(freemealConn, employee.ashima_id, 1);

        await attendanceConn.commit();
        await freemealConn.commit();

      } catch (err) {
        await attendanceConn.rollback();
        await freemealConn.rollback();
        throw err;
      }
      // ------------------------------------------------------------------------------------------------------
    } else if (latestLog.log_type === "IN" && !latestLog.out_time) {
      // Last log is IN and has no out_time: this should be OUT and update the previous IN
      nextLogType = "OUT";
      // Update the previous IN with out_time and log_type OUT
      const updateQuery = `
        UPDATE attendance_logs
        SET log_type = 'OUT', out_time = NOW()
        WHERE id = ?
      `;

      // ------------------------------- code added 01-14-2026 ------------------------------------------------
      //const conn = await freemealPool.getConnection();
      // await freemealConn.ping();
      // console.log('Freemeal DB connected');

      try {
        // separate transactions (NOT atomic together)
        await attendanceConn.beginTransaction();
        await freemealConn.beginTransaction();

        // 1️⃣ Update on Attendance DB (Server A)
        await attendanceConn.execute(updateQuery, [latestLog.id]);

        // 2️⃣ Update on HR DB (Server B) - check employees, interns, then trainees tables
        await updateEmployeeStatusByTable(freemealConn, employee.ashima_id, 0);
        
        // 3️⃣ If the employee is checking OUT and has not claimed a meal today,
        // insert a record into the unclaimed_freemeal_logs table.
        //await insertUnclaimedFreemealLogIfNeeded(freemealConn, employee.ashima_id);

        await attendanceConn.commit();
        await freemealConn.commit();
      } catch (err) {
        await attendanceConn.rollback();
        await freemealConn.rollback();
        throw err;
      }
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
      SELECT id, log_type, in_time, out_time
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
  } finally {
    if (attendanceConn) {
      attendanceConn.release();
    }

    if (freemealConn) {
      freemealConn.release();
    }
  }
}
