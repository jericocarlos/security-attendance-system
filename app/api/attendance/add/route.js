import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(request) {
  try {
    const { rfid_tag } = await request.json();

    if (!rfid_tag) {
      return NextResponse.json({ error: "RFID tag is required" }, { status: 400 });
    }

    // Fetch employee info
    const employeeQuery = `
      SELECT e.id, e.ashima_id, e.name, e.rfid_tag, e.photo, 
             d.name as department, p.name as position
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.rfid_tag = ? AND e.status = 'active'
    `;

    const employeeResults = await executeQuery({ 
      query: employeeQuery, 
      values: [rfid_tag] 
    });

    if (employeeResults.length === 0) {
      return NextResponse.json(
        { error: "No active employee found with this RFID tag" }, 
        { status: 404 }
      );
    }

    const employee = {
      id: employeeResults[0].id,
      ashima_id: employeeResults[0].ashima_id,
      name: employeeResults[0].name,
      rfid_tag: employeeResults[0].rfid_tag,
      department: employeeResults[0].department,
      position: employeeResults[0].position,
    };

    // If photo exists, convert it to base64
    if (employeeResults[0].photo) {
      const base64Photo = Buffer.from(employeeResults[0].photo).toString('base64');
      employee.photo = `data:image/jpeg;base64,${base64Photo}`;
    }

    // Get the latest log for this employee - using timestamp, not in_time
    const latestLogQuery = `
      SELECT id, log_type, timestamp
      FROM attendance_logs
      WHERE ashima_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const latestLogResults = await executeQuery({ 
      query: latestLogQuery, 
      values: [employee.ashima_id] 
    });

    // Determine log type (IN or OUT)
    let logType = "IN"; // Default to IN
    if (latestLogResults.length > 0) {
      // If latest log is IN, then this should be OUT, and vice versa
      logType = latestLogResults[0].log_type === "IN" ? "OUT" : "IN";
    }

    // Insert new attendance log
    const insertLogQuery = `
      INSERT INTO attendance_logs (ashima_id, employee_name, department, log_type, timestamp)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const insertResult = await executeQuery({ 
      query: insertLogQuery, 
      values: [
        employee.ashima_id, 
        employee.name, 
        employee.department || "N/A",
        logType
      ] 
    });

    // Get the newly created log
    const newLogQuery = `
      SELECT id, log_type, timestamp
      FROM attendance_logs
      WHERE id = ?
    `;

    const newLogResults = await executeQuery({ 
      query: newLogQuery, 
      values: [insertResult.insertId] 
    });

    // Create a response-friendly attendance log structure
    let attendanceLog = {
      id: newLogResults[0].id,
      log_type: newLogResults[0].log_type,
      timestamp: newLogResults[0].timestamp
    };

    // Format as in_time/out_time for the UI
    if (logType === "IN") {
      attendanceLog.in_time = newLogResults[0].timestamp;
      attendanceLog.out_time = null;
    } else {
      // For OUT logs, find the corresponding IN log
      const inLogQuery = `
        SELECT timestamp
        FROM attendance_logs
        WHERE ashima_id = ? AND log_type = 'IN'
        ORDER BY timestamp DESC
        LIMIT 1
      `;
      
      const inLogResults = await executeQuery({
        query: inLogQuery,
        values: [employee.ashima_id]
      });
      
      if (inLogResults.length > 0) {
        attendanceLog.in_time = inLogResults[0].timestamp;
        attendanceLog.out_time = newLogResults[0].timestamp;
      } else {
        attendanceLog.in_time = null;
        attendanceLog.out_time = newLogResults[0].timestamp;
      }
    }

    return NextResponse.json({
      message: `${employee.name} successfully logged ${logType}`,
      employee,
      attendanceLog,
      logType
    });
  } catch (err) {
    console.error("Error processing attendance log:", err);
    return NextResponse.json(
      { error: "Failed to process attendance log" },
      { status: 500 }
    );
  }
}