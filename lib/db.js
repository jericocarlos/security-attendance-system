import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rfid_attendance',
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
  const query = 'SELECT * FROM employees WHERE rfid_tag = ?';
  const results = await executeQuery({ query, values: [rfidTag] });
  return results[0] || null;
}

export async function getLastAttendanceLog(employeeId) {
  const query = 'SELECT * FROM attendance_logs WHERE ashima_id = ? ORDER BY timestamp DESC LIMIT 1';
  const results = await executeQuery({ query, values: [employeeId] });
  return results[0] || null;
}

export async function createAttendanceLog(employeeId, logType) {
  const query = 'INSERT INTO attendance_logs (ashima_id, log_type) VALUES (?, ?)';
  return await executeQuery({ query, values: [employeeId, logType] });
}

export async function getAttendanceLogs(limit = 20) {
  const query = `
    SELECT al.id, al.log_type, al.timestamp, e.name, e.ashima_id as emp_id, e.department
    FROM attendance_logs al
    JOIN employees e ON al.ashima_id = e.id
    ORDER BY al.timestamp DESC
    LIMIT ?
  `;
  return await executeQuery({ query, values: [limit] });
}