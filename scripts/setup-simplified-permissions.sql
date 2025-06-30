-- Script to set up role permissions with access-only structure
-- Run this script to create or reset your role permissions table

-- Drop existing table if you want a fresh start (optional)
-- DROP TABLE IF EXISTS role_permissions;

-- Create the table with updated structure
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('superadmin','admin', 'security', 'hr') NOT NULL,
  module VARCHAR(100) NOT NULL,
  permission JSON NOT NULL COMMENT 'JSON object containing permissions like {"access": true}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_module (role, module)
);

-- Clear existing data and insert new simplified permissions
DELETE FROM role_permissions;

-- Insert default permissions with access-only structure
INSERT INTO role_permissions (role, module, permission) VALUES
-- Superadmin permissions (full access to all modules)
('superadmin', 'employees_management', '{"access": true}'),
('superadmin', 'data_management', '{"access": true}'),
('superadmin', 'account_logins', '{"access": true}'),
('superadmin', 'attendance_logs', '{"access": true}'),
('superadmin', 'role_permissions', '{"access": true}'),

-- Admin permissions (access to most modules)
('admin', 'employees_management', '{"access": true}'),
('admin', 'data_management', '{"access": true}'),
('admin', 'account_logins', '{"access": true}'),
('admin', 'attendance_logs', '{"access": true}'),

-- Security permissions (limited access)
('security', 'attendance_logs', '{"access": true}'),

-- HR permissions (employee and attendance focused)
('hr', 'attendance_logs', '{"access": true}'),
('hr', 'employees_management', '{"access": true}')

ON DUPLICATE KEY UPDATE
permission = VALUES(permission),
updated_at = CURRENT_TIMESTAMP;

-- Verify the data was inserted correctly
SELECT 
  id,
  role,
  module,
  permission,
  created_at,
  updated_at
FROM role_permissions 
ORDER BY 
  FIELD(role, 'superadmin', 'admin', 'security', 'hr'),
  module;
