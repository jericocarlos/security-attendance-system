const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rfid_attendance',
};

async function createUser(name, username, employeeId, password, role = 'admin') {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a database connection
    const connection = await mysql.createConnection(dbConfig);
    
    // Insert the user with role
    const [result] = await connection.execute(
      'INSERT INTO admin_users (name, username, employee_id, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, username, employeeId, hashedPassword, role]
    );
    
    await connection.end();
    
    console.log(`User created successfully! User ID: ${result.insertId}`);
    
    return result.insertId;
  } catch (error) {
    console.error(`Error creating user ${username}:`, error);
    throw error;
  }
}

// Define all users to add
const users = [
  {
    name: 'admin',
    username: 'damin',
    employeeId: '00-00000',
    password: '1111',
    role: 'admin' // Add role here
  }
];

// Run this script with Node.js to create all users
// node scripts/create-user.js
async function main() {
  console.log('Starting user creation process...');
  console.log(`Total users to create: ${users.length}`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of users) {
    try {
      console.log(`\nCreating user: ${user.username} (${user.employeeId})`);
      const userId = await createUser(
        user.name,
        user.username,
        user.employeeId,
        user.password,
        user.role // Pass role here
      );
      
      console.log(`✅ Created user ${user.username} with ID: ${userId}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create user ${user.username}`);
      failCount++;
      // Continue with next user
    }
  }
  
  console.log('\n===== User Creation Summary =====');
  console.log(`Total users attempted: ${users.length}`);
  console.log(`Successfully created: ${successCount}`);
  console.log(`Failed to create: ${failCount}`);
}

main();