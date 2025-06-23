import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'headset_borrow_system',
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to execute a SQL query
export async function executeQuery({ query, values = [] }) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Database query failed');
  }
}

// Function to get a user by either username or employee ID
export async function getUserByIdentifier(identifier) {
  try {
    const users = await executeQuery({
      query: 'SELECT * FROM admin_users WHERE username = ? OR employee_id = ?',
      values: [identifier, identifier],
    });
    
    return users.length ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Function to get a user by ID
export async function getUserById(id) {
  try {
    const users = await executeQuery({
      query: 'SELECT id, name, username, employee_id FROM admin_users WHERE id = ?',
      values: [id],
    });
    
    return users.length ? users[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}