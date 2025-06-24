import { Users, Clipboard, UserCog, Calendar, Database } from "lucide-react";

export const NAV_ITEMS = {
  // Super Admin can access everything
  superadmin: [
    {
      name: 'Employees Management',
      href: '/admin/employees-management',
      icon: <Users className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Data Management',
      href: '/admin/lists',
      icon: <Database className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Account Logins',
      href: '/admin/account-logins',
      icon: <UserCog className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
    // {
    //   name: 'Module Assignment',
    //   href: '/admin/module-assignment',
    //   icon: <UserCog className="h-[18px] w-[18px]" />,
    // },
  ],
  admin: [
    {
      name: 'Employees Management',
      href: '/admin/employees-management',
      icon: <Users className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Data Management',
      href: '/admin/lists',
      icon: <Database className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Account Logins',
      href: '/admin/account-logins',
      icon: <UserCog className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
  ],
  // Security only gets Attendance Logs
  security: [
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
  ],
  // HR only gets Attendance Logs
  hr: [
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
  ],
};