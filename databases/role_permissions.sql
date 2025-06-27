-- Role permissions table to store dynamic role-based access control
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('superadmin','admin', 'security', 'hr') NOT NULL,
  module VARCHAR(100) NOT NULL,
  permission JSON NOT NULL COMMENT 'JSON object containing permissions like {read: true, write: true, delete: false}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_module (role, module)
);

-- Insert default permissions
INSERT INTO role_permissions (role, module, permission) VALUES
('superadmin', 'employees_management', '{"read": true, "write": true, "delete": true, "export": true}'),
('superadmin', 'data_management', '{"read": true, "write": true, "delete": true, "export": true}'),
('superadmin', 'account_logins', '{"read": true, "write": true, "delete": true, "export": true}'),
('superadmin', 'attendance_logs', '{"read": true, "write": true, "delete": true, "export": true}'),
('superadmin', 'role_permissions', '{"read": true, "write": true, "delete": true, "export": true}'),

('admin', 'employees_management', '{"read": true, "write": true, "delete": false, "export": true}'),
('admin', 'data_management', '{"read": true, "write": true, "delete": false, "export": true}'),
('admin', 'account_logins', '{"read": true, "write": true, "delete": false, "export": true}'),
('admin', 'attendance_logs', '{"read": true, "write": false, "delete": false, "export": true}'),

('security', 'attendance_logs', '{"read": true, "write": false, "delete": false, "export": false}'),

('hr', 'attendance_logs', '{"read": true, "write": false, "delete": false, "export": true}'),
('hr', 'employees_management', '{"read": true, "write": false, "delete": false, "export": true}')

ON DUPLICATE KEY UPDATE
permission = VALUES(permission),
updated_at = CURRENT_TIMESTAMP;
