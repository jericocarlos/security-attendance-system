-- RFID Attendance System - Development Setup
-- This file contains the essential tables and data for development

-- Create database
CREATE DATABASE IF NOT EXISTS `rfid_attendance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `rfid_attendance`;

-- Admin users table
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','security','hr') NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Departments table
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Positions table
CREATE TABLE `positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_leader` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Employees table
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ashima_id` varchar(12) NOT NULL,
  `name` varchar(150) NOT NULL,
  `rfid_tag` varchar(50) DEFAULT NULL,
  `photo` longblob DEFAULT NULL,
  `emp_stat` varchar(12) DEFAULT 'Regular',
  `status` enum('active','inactive','resigned') DEFAULT 'active',
  `department_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL,
  `leader` int(11) DEFAULT NULL,
  `last_active` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ashima_id` (`ashima_id`),
  UNIQUE KEY `rfid_tag` (`rfid_tag`),
  KEY `department_id` (`department_id`),
  KEY `position_id` (`position_id`),
  KEY `leader` (`leader`),
  CONSTRAINT `employees_department_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_position_fk` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_leader_fk` FOREIGN KEY (`leader`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Attendance logs table
CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `ashima_id` varchar(20) NOT NULL,
  `log_type` enum('time_in','time_out','break_in','break_out') NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `rfid_tag` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `ashima_id` (`ashima_id`),
  KEY `timestamp` (`timestamp`),
  CONSTRAINT `attendance_logs_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Role permissions table
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('superadmin','admin','security','hr') NOT NULL,
  `module` varchar(100) NOT NULL,
  `permission` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_module` (`role`, `module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default admin user (password: admin123)
INSERT INTO `admin_users` (`name`, `username`, `employee_id`, `password`, `role`) VALUES
('System Administrator', 'admin', '00-00000', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');

-- Insert default role permissions
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
('hr', 'employees_management', '{"access": true}');

-- Insert sample departments
INSERT INTO `departments` (`name`) VALUES
('IT DEPARTMENT'),
('HR DEPARTMENT'),
('ACCOUNTING DEPARTMENT'),
('SECURITY DEPARTMENT'),
('OPERATIONS');

-- Insert sample positions
INSERT INTO `positions` (`name`, `is_leader`) VALUES
('PROGRAMMER', 0),
('TEAM LEADER', 1),
('HR OFFICER', 0),
('ACCOUNTANT', 0),
('SECURITY GUARD', 0),
('OPERATIONS MANAGER', 1),
('SYSTEM ADMINISTRATOR', 0);
