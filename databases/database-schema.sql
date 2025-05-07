CREATE TABLE `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `employees` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ashima_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `rfid_tag` VARCHAR(50) UNIQUE,
  `photo` LONGBLOB,
  `emp_stat` VARCHAR(12),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `department_id` INT(11),
  `position_id` INT(11),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE TABLE `attendance_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ashima_id` VARCHAR(20) NOT NULL,
  `log_type` ENUM('IN','OUT') DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ashima_id`) REFERENCES `employees`(`ashima_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
