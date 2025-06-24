import { Users, Clipboard, UserCog, Calendar } from "lucide-react";

export const NAV_ITEMS = {
  admin: [
    {
      name: 'Employees Management',
      href: '/admin/employees-management',
      icon: <Users className="h-[18px] w-[18px]" />,
    },
    {
      name: 'Lists',
      href: '/admin/lists',
      icon: <Clipboard className="h-[18px] w-[18px]" />,
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
  security: [
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
  ],
  hr: [
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <Calendar className="h-[18px] w-[18px]" />,
    },
  ],
};