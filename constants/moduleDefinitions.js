/**
 * Constants for admin dashboard module definitions
 */
import { 
  Users, 
  CalendarCheck, 
  Database, 
  UserCog, 
  Shield 
} from "lucide-react";

export const MODULE_DEFINITIONS = {
  employees_management: {
    name: 'Employees',
    href: '/admin/employees-management',
    icon: <Users className="h-6 w-6" />,
    color: 'blue',
    description: 'Manage employee records',
    ariaLabel: 'Navigate to employee management'
  },
  data_management: {
    name: 'Lists',
    href: '/admin/lists',
    icon: <Database className="h-6 w-6" />,
    color: 'amber',
    description: 'Manage departments and positions',
    ariaLabel: 'Navigate to data management'
  },
  account_logins: {
    name: 'Account Logins',
    href: '/admin/account-logins',
    icon: <UserCog className="h-6 w-6" />,
    color: 'purple',
    description: 'Manage user accounts',
    ariaLabel: 'Navigate to account management'
  },
  attendance_logs: {
    name: 'Attendance Logs',
    href: '/admin/attendance-logs',
    icon: <CalendarCheck className="h-6 w-6" />,
    color: 'green',
    description: 'View attendance records',
    ariaLabel: 'Navigate to attendance logs'
  },
  role_permissions: {
    name: 'Role Permissions',
    href: '/admin/role-permissions',
    icon: <Shield className="h-6 w-6" />,
    color: 'red',
    description: 'Manage user permissions',
    ariaLabel: 'Navigate to role permissions'
  }
};
