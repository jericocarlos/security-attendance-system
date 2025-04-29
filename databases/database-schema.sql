CREATE DATABASE rfid_attendance;
USE rfid_attendance;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ashima_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  rfid_tag VARCHAR(50) UNIQUE NOT NULL,
  photo_url VARCHAR(255),
  emp_stat varchar(50) DEFAULT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ashima_id VARCHAR(50) NOT NULL,
  log_type ENUM('IN', 'OUT') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample employees
INSERT INTO employees (ashima_id, name, department, rfid_tag) VALUES
('EMP001', 'John Doe', 'Engineering', 'A1B2C3D4'),
('EMP002', 'Jane Smith', 'HR', 'E5F6G7H8'),
('EMP003', 'Bob Johnson', 'Marketing', 'I9J0K1L2');