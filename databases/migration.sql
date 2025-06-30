-- Migration script to update existing rfid_attendance database to new schema
-- Run this script on existing databases to bring them up to the latest schema

USE `rfid_attendance`;

-- Add missing columns to existing tables
-- --------------------------------------------------------

-- Update admin_users table
ALTER TABLE `admin_users` 
ADD COLUMN IF NOT EXISTS `last_login` datetime DEFAULT NULL COMMENT 'Records the timestamp of user''s most recent login';

-- Update departments table 
ALTER TABLE `departments` 
ADD COLUMN IF NOT EXISTS `description` text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `status` enum('active','inactive') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
ADD COLUMN IF NOT EXISTS `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

-- Update positions table
ALTER TABLE `positions`
ADD COLUMN IF NOT EXISTS `description` text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `status` enum('active','inactive') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
ADD COLUMN IF NOT EXISTS `updated_at` timestamp NOT NULL DEFAULT current_timestamp();

-- Update employees table
ALTER TABLE `employees`
ADD COLUMN IF NOT EXISTS `hire_date` date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
ADD COLUMN IF NOT EXISTS `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

-- Update attendance_logs table structure
-- First, add the new columns
ALTER TABLE `attendance_logs`
ADD COLUMN IF NOT EXISTS `employee_id` int(11) DEFAULT NULL COMMENT 'Reference to employees table',
ADD COLUMN IF NOT EXISTS `log_type` enum('time_in','time_out','break_in','break_out') DEFAULT 'time_in',
ADD COLUMN IF NOT EXISTS `timestamp` datetime DEFAULT current_timestamp(),
ADD COLUMN IF NOT EXISTS `rfid_tag` varchar(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `device_id` varchar(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `notes` text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `created_at` timestamp NOT NULL DEFAULT current_timestamp();

-- Populate employee_id from ashima_id
UPDATE `attendance_logs` al 
SET employee_id = (
    SELECT e.id 
    FROM employees e 
    WHERE e.ashima_id = al.ashima_id
)
WHERE al.employee_id IS NULL AND al.ashima_id IS NOT NULL;

-- Convert old log_type values to new enum format if needed
UPDATE `attendance_logs` SET log_type = 'time_in' WHERE log_type = 'in' OR log_type = 'IN';
UPDATE `attendance_logs` SET log_type = 'time_out' WHERE log_type = 'out' OR log_type = 'OUT';

-- Create new tables that might not exist
-- --------------------------------------------------------

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `table_name` (`table_name`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create system_settings table
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add foreign key constraints if they don't exist
-- --------------------------------------------------------

-- Check and add foreign keys for employees table
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE CONSTRAINT_NAME = 'employees_department_fk' 
    AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE employees ADD CONSTRAINT employees_department_fk FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "employees_department_fk constraint already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for positions
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE CONSTRAINT_NAME = 'employees_position_fk' 
    AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE employees ADD CONSTRAINT employees_position_fk FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "employees_position_fk constraint already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for leader (self-referencing)
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE CONSTRAINT_NAME = 'employees_leader_fk' 
    AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE employees ADD CONSTRAINT employees_leader_fk FOREIGN KEY (leader) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "employees_leader_fk constraint already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for attendance_logs
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE CONSTRAINT_NAME = 'attendance_logs_employee_fk' 
    AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE attendance_logs ADD CONSTRAINT attendance_logs_employee_fk FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE',
    'SELECT "attendance_logs_employee_fk constraint already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for audit_logs
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE CONSTRAINT_NAME = 'audit_logs_user_fk' 
    AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_fk FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "audit_logs_user_fk constraint already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update role_permissions to simplified access-only structure
-- --------------------------------------------------------
UPDATE role_permissions 
SET permission = JSON_OBJECT('access', true)
WHERE JSON_EXTRACT(permission, '$.read') = true 
   OR JSON_EXTRACT(permission, '$.write') = true 
   OR JSON_EXTRACT(permission, '$.delete') = true 
   OR JSON_EXTRACT(permission, '$.export') = true
   OR JSON_EXTRACT(permission, '$.access') = true;

-- Ensure superadmin always has access to all modules
UPDATE role_permissions 
SET permission = JSON_OBJECT('access', true)
WHERE role = 'superadmin';

-- Insert default system settings if they don't exist
-- --------------------------------------------------------
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) VALUES
('company_name', 'RFID Attendance System', 'string', 'Company name displayed in the application', 1),
('timezone', 'Asia/Manila', 'string', 'Default timezone for the application', 0),
('attendance_grace_period', '15', 'number', 'Grace period in minutes for late attendance', 0),
('max_daily_hours', '8', 'number', 'Maximum working hours per day', 0),
('enable_photo_capture', 'true', 'boolean', 'Enable photo capture during attendance logging', 0),
('rfid_scan_timeout', '5000', 'number', 'RFID scan timeout in milliseconds', 0);

-- Create additional indexes for performance
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS `idx_attendance_date` ON `attendance_logs` (`timestamp`);
CREATE INDEX IF NOT EXISTS `idx_attendance_employee_date` ON `attendance_logs` (`employee_id`, `timestamp`);
CREATE INDEX IF NOT EXISTS `idx_employee_name` ON `employees` (`name`);
CREATE INDEX IF NOT EXISTS `idx_employee_department_status` ON `employees` (`department_id`, `status`);
CREATE INDEX IF NOT EXISTS `idx_audit_user_action` ON `audit_logs` (`user_id`, `action`);
CREATE INDEX IF NOT EXISTS `idx_audit_table_record` ON `audit_logs` (`table_name`, `record_id`);

-- Show migration completion status
SELECT 
    'Migration completed successfully!' as status,
    NOW() as completed_at;

-- Show updated table structures
SHOW TABLES;
