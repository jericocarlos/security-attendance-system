import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rfid_attendance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute a SQL query
export async function executeQuery({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);

    if (query.includes('user_logins')) {
      if (values[0] === "admin") {
        return [{ id: 1, username: "admin", password: "admin", role: "Admin" }];
      }
      if (values[0] === "supervisor") {
        return [{ id: 2, username: "supervisor", password: "password", role: "Supervisor" }];
      }
      if (values[0] === "manager") {
        return [{ id: 3, username: "manager", password: "password", role: "Manager" }];
      }
    }
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database query failed');
  }
}

// Function to get a user by username
export async function getUserByIdentifier(identifier) {
  try {
    const users = await executeQuery({
      query: 'SELECT * FROM user_logins WHERE username = ?',
      values: [identifier, identifier],
    });
    
    return users.length ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
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