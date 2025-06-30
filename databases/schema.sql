-- RFID Attendance System Database Schema
-- Created: June 30, 2025
-- Description: Complete database schema for the RFID-based employee attendance tracking system

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Create Database (Optional - uncomment if needed)
-- --------------------------------------------------------
-- CREATE DATABASE IF NOT EXISTS `rfid_attendance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- USE `rfid_attendance`;

-- --------------------------------------------------------
-- Table structure for table `admin_users`
-- --------------------------------------------------------

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `employee_id` varchar(50) NOT NULL COMMENT 'Ashima ID - unique employee identifier',
  `password` varchar(255) NOT NULL COMMENT 'Hashed password using bcrypt',
  `role` enum('superadmin','admin','security','hr') NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL COMMENT 'Records the timestamp of user''s most recent login',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `departments`
-- --------------------------------------------------------

CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `positions`
-- --------------------------------------------------------

CREATE TABLE `positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_leader` tinyint(1) DEFAULT 0 COMMENT '1 if this position has leadership responsibilities',
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `employees`
-- --------------------------------------------------------

CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ashima_id` varchar(12) NOT NULL COMMENT 'Unique employee ID in format XX-XXXXX',
  `name` varchar(150) NOT NULL,
  `rfid_tag` varchar(50) DEFAULT NULL COMMENT 'RFID card/tag identifier',
  `photo` longblob DEFAULT NULL COMMENT 'Employee photo stored as binary data',
  `emp_stat` varchar(12) DEFAULT 'Regular' COMMENT 'Employment status (Regular, Probationary, etc.)',
  `status` enum('active','inactive','resigned') DEFAULT 'active',
  `department_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL,
  `leader` int(11) DEFAULT NULL COMMENT 'Reference to employee ID who is the direct supervisor',
  `last_active` datetime DEFAULT NULL COMMENT 'Last recorded activity timestamp',
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ashima_id` (`ashima_id`),
  UNIQUE KEY `rfid_tag` (`rfid_tag`),
  KEY `department_id` (`department_id`),
  KEY `position_id` (`position_id`),
  KEY `leader` (`leader`),
  KEY `status` (`status`),
  CONSTRAINT `employees_department_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employees_position_fk` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employees_leader_fk` FOREIGN KEY (`leader`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `attendance_logs`
-- --------------------------------------------------------

CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL COMMENT 'Reference to employees table',
  `ashima_id` varchar(20) NOT NULL COMMENT 'Employee Ashima ID for backward compatibility',
  `log_type` enum('time_in','time_out','break_in','break_out') NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `rfid_tag` varchar(50) DEFAULT NULL COMMENT 'RFID tag used for this log entry',
  `device_id` varchar(50) DEFAULT NULL COMMENT 'RFID scanner/device identifier',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `ashima_id` (`ashima_id`),
  KEY `timestamp` (`timestamp`),
  KEY `log_type` (`log_type`),
  CONSTRAINT `attendance_logs_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `role_permissions`
-- --------------------------------------------------------

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('superadmin','admin','security','hr') NOT NULL,
  `module` varchar(100) NOT NULL COMMENT 'Module name (employees_management, attendance_logs, etc.)',
  `permission` json NOT NULL COMMENT 'JSON object containing permissions like {"access": true}',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_module` (`role`, `module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_logs`
-- --------------------------------------------------------

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Admin user who performed the action',
  `action` varchar(100) NOT NULL COMMENT 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)',
  `table_name` varchar(100) DEFAULT NULL COMMENT 'Database table affected',
  `record_id` int(11) DEFAULT NULL COMMENT 'ID of the affected record',
  `old_values` json DEFAULT NULL COMMENT 'Previous values before change',
  `new_values` json DEFAULT NULL COMMENT 'New values after change',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `table_name` (`table_name`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `audit_logs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `system_settings`
-- --------------------------------------------------------

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0 COMMENT '1 if setting can be accessed by non-admin users',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Insert default data
-- --------------------------------------------------------

-- Default admin user (password: admin123)
INSERT INTO `admin_users` (`name`, `username`, `employee_id`, `password`, `role`) VALUES
('System Administrator', 'admin', '00-00000', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');

-- Default role permissions
INSERT INTO `role_permissions` (`role`, `module`, `permission`) VALUES
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

-- Default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) VALUES
('company_name', 'RFID Attendance System', 'string', 'Company name displayed in the application', 1),
('timezone', 'Asia/Manila', 'string', 'Default timezone for the application', 0),
('attendance_grace_period', '15', 'number', 'Grace period in minutes for late attendance', 0),
('max_daily_hours', '8', 'number', 'Maximum working hours per day', 0),
('enable_photo_capture', 'true', 'boolean', 'Enable photo capture during attendance logging', 0),
('rfid_scan_timeout', '5000', 'number', 'RFID scan timeout in milliseconds', 0)

ON DUPLICATE KEY UPDATE
setting_value = VALUES(setting_value),
updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------
-- Create indexes for performance
-- --------------------------------------------------------

-- Additional indexes for attendance_logs
CREATE INDEX `idx_attendance_date` ON `attendance_logs` (`timestamp`);
CREATE INDEX `idx_attendance_employee_date` ON `attendance_logs` (`employee_id`, `timestamp`);

-- Additional indexes for employees
CREATE INDEX `idx_employee_name` ON `employees` (`name`);
CREATE INDEX `idx_employee_department_status` ON `employees` (`department_id`, `status`);

-- Additional indexes for audit_logs
CREATE INDEX `idx_audit_user_action` ON `audit_logs` (`user_id`, `action`);
CREATE INDEX `idx_audit_table_record` ON `audit_logs` (`table_name`, `record_id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
