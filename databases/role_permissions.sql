-- Role permissions table to store dynamic role-based access control
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('superadmin','admin', 'security', 'hr') NOT NULL,
  module VARCHAR(100) NOT NULL,
  permission JSON NOT NULL COMMENT 'JSON object containing permissions like {"access": true}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_module (role, module)
);

-- Insert default permissions
INSERT INTO role_permissions (role, module, permission) VALUES
('superadmin', 'employees_management', '{"access": true}'),
('superadmin', 'data_management', '{"access": true}'),
('superadmin', 'account_logins', '{"access": true}'),
('superadmin', 'attendance_logs', '{"access": true}'),
('superadmin', 'role_permissions', '{"access": true}'),

('admin', 'employees_management', '{"access": true}'),
('admin', 'data_management', '{"access": true}'),
('admin', 'account_logins', '{"access": true}'),
('admin', 'attendance_logs', '{"access": true}'),

('security', 'attendance_logs', '{"access": true}'),

('hr', 'attendance_logs', '{"access": true}'),
('hr', 'employees_management', '{"access": true}')

ON DUPLICATE KEY UPDATE
permission = VALUES(permission),
updated_at = CURRENT_TIMESTAMP;
permission = VALUES(permission),
updated_at = CURRENT_TIMESTAMP;
