"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FiUsers, 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight,
  FiSettings,
  FiHome
} from "react-icons/fi";
import { cn } from "@/lib/utils"; // shadcn/ui utility
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <FiHome className="h-[21px] w-[21px]" />,
    },
    {
      name: 'Attendance Logs',
      href: '/admin/attendance-logs',
      icon: <FiCalendar className="h-[21px] w-[21px]" />,
    },
    {
      name: 'Employee Management',
      href: '/admin/employees-management',
      icon: <FiUsers className="h-[21px] w-[21px]" />,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <FiSettings className="h-[21px] w-[21px]" />,
    },
  ];

  return (
    <div className={cn(
      "bg-slate-900 text-white h-screen flex flex-col fixed top-0 left-0 z-40 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* SideNav Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <h2 className="text-xl font-bold text-slate-100">EastWest BPO</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full hover:bg-slate-800 focus:outline-none"
        >
          {collapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Navigation Items - Centered vertically */}
      <div className="flex-grow flex items-center justify-center">
        <nav className="w-full py-4">
          <ul className="space-y-5 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <TooltipProvider delayDuration={0} disableHoverableContent={!collapsed}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-start h-15 rounded-lg hover:bg-slate-800 transition-colors",
                          collapsed ? "px-3 justify-center" : "px-4",
                          pathname.startsWith(item.href) ? 'bg-blue-700 hover:bg-blue-700/90' : ''
                        )}
                      >
                        <span className={cn("flex-shrink-0", collapsed ? "" : "mr-4")}>
                          {item.icon}
                        </span>
                        {!collapsed && <span className="text-[15px] font-medium">{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-4 text-center text-sm text-slate-400 border-t border-slate-800">
          &copy; {new Date().getFullYear()} EastWest BPO
        </div>
      )}
    </div>
  );
}