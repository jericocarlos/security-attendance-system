import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attendance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function executeQuery({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export async function findEmployeeByRfid(rfidTag) {
  try {
    const query = 'SELECT * FROM employees WHERE rfid_tag = ?';
    const results = await executeQuery({ query, values: [rfidTag] });
    return results[0] || null;
  } catch (error) {
    console.error('Error finding employee by RFID:', error);
    throw error;
  }
}

export async function getLastAttendanceLog(employeeId) {
  try {
    const query = 'SELECT * FROM attendance_logs WHERE employee_id = ? ORDER BY timestamp DESC LIMIT 1';
    const results = await executeQuery({ query, values: [employeeId] });
    return results[0] || null;
  } catch (error) {
    console.error('Error getting last attendance log:', error);
    throw error;
  }
}

export async function createAttendanceLog(employeeId, logType) {
  try {
    const query = 'INSERT INTO attendance_logs (employee_id, log_type) VALUES (?, ?)';
    return await executeQuery({ query, values: [employeeId, logType] });
  } catch (error) {
    console.error('Error creating attendance log:', error);
    throw error;
  }
}

export async function getAttendanceLogs(limit = 20) {
  try {
    const query = `
      SELECT al.id, al.log_type, al.timestamp, e.name, e.employee_id as emp_id, e.department
      FROM attendance_logs al
      JOIN employees e ON al.employee_id = e.id
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    return await executeQuery({ query, values: [limit] });
  } catch (error) {
    console.error('Error getting attendance logs:', error);
    throw error;
  }
}