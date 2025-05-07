CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL,
  `ashima_id` varchar(20) NOT NULL,
  `log_type` enum('IN','OUT') DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL
);

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `ashima_id` varchar(50) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `rfid_tag` varchar(50) DEFAULT NULL,
  `photo` longblob DEFAULT NULL,
  `emp_stat` varchar(12) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `department_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL
);
