const mysql = require('mysql2/promise');

async function setupRolePermissions() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'rfid_attendance'
    });

    console.log('Connected to database');

    // Create role_permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('superadmin','admin', 'security', 'hr') NOT NULL,
        module VARCHAR(100) NOT NULL,
        permission JSON NOT NULL COMMENT 'JSON object containing permissions like {read: true, write: true, delete: false}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_module (role, module)
      )
    `);

    console.log('Role permissions table created');

    // Insert default permissions
    const defaultPermissions = [
      ['superadmin', 'employees_management', '{"read": true, "write": true, "delete": true, "export": true}'],
      ['superadmin', 'data_management', '{"read": true, "write": true, "delete": true, "export": true}'],
      ['superadmin', 'account_logins', '{"read": true, "write": true, "delete": true, "export": true}'],
      ['superadmin', 'attendance_logs', '{"read": true, "write": true, "delete": true, "export": true}'],
      ['superadmin', 'role_permissions', '{"read": true, "write": true, "delete": true, "export": true}'],
      
      ['admin', 'employees_management', '{"read": true, "write": true, "delete": false, "export": true}'],
      ['admin', 'data_management', '{"read": true, "write": true, "delete": false, "export": true}'],
      ['admin', 'account_logins', '{"read": true, "write": true, "delete": false, "export": true}'],
      ['admin', 'attendance_logs', '{"read": true, "write": false, "delete": false, "export": true}'],
      
      ['security', 'attendance_logs', '{"read": true, "write": false, "delete": false, "export": false}'],
      
      ['hr', 'attendance_logs', '{"read": true, "write": false, "delete": false, "export": true}'],
      ['hr', 'employees_management', '{"read": true, "write": false, "delete": false, "export": true}']
    ];

    for (const [role, module, permission] of defaultPermissions) {
      await connection.execute(`
        INSERT INTO role_permissions (role, module, permission) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        permission = VALUES(permission),
        updated_at = CURRENT_TIMESTAMP
      `, [role, module, permission]);
    }

    console.log('Default permissions inserted');
    console.log('Role permissions setup completed successfully!');

    await connection.end();
  } catch (error) {
    console.error('Error setting up role permissions:', error);
    process.exit(1);
  }
}

setupRolePermissions();
