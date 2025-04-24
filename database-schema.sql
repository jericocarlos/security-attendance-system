CREATE DATABASE rfid_attendance;
USE rfid_attendance;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  rfid_tag VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  log_type ENUM('IN', 'OUT') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Insert some sample employees
INSERT INTO employees (employee_id, name, department, rfid_tag) VALUES
('EMP001', 'John Doe', 'Engineering', 'A1B2C3D4'),
('EMP002', 'Jane Smith', 'HR', 'E5F6G7H8'),
('EMP003', 'Bob Johnson', 'Marketing', 'I9J0K1L2');