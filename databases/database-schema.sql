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

CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL,
  `ashima_id` varchar(50) NOT NULL,
  `log_type` enum('IN','OUT') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `ashima_id` varchar(50) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `position` varchar(42) DEFAULT NULL,
  `rfid_tag` varchar(50) DEFAULT NULL,
  `photo` longblob DEFAULT NULL,
  `emp_stat` varchar(12) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;