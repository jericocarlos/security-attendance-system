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
  FiMenu
} from "react-icons/fi";
import { cn } from "@/lib/utils"; // shadcn/ui utility
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    // {
    //   name: 'Attendance Logs',
    //   href: '/admin/attendance-logs',
    //   icon: <FiCalendar className="h-[18px] w-[18px]" />,
    // },
    {
      name: 'Employee Management',
      href: '/admin/employees-management',
      icon: <FiUsers className="h-[18px] w-[18px]" />,
    },
    // {
    //   name: 'Settings',
    //   href: '/admin/settings',
    //   icon: <FiSettings className="h-[18px] w-[18px]" />,
    // },
  ];

  return (
    <>
      {/* SideNav */}
      <div className={cn(
        "bg-slate-900 text-white h-screen flex flex-col fixed top-0 left-0 z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}>
        {/* SideNav Header */}
        <div className="p-5 flex items-center justify-center border-b border-slate-800 mb-4">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              className="rounded-lg hover:bg-slate-800 transition-colors"
              width={collapsed ? 60 : 128} 
              height={collapsed ? 60 : 60}
              priority
            />
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="ml-4 rounded-full hover:bg-slate-800 focus:outline-none"
            >
              <FiChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="absolute top-5 right-3 rounded-full hover:bg-slate-800 focus:outline-none"
            >
              <FiChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Navigation Items */}
        <div className="flex-grow flex justify-center">
          <nav className="w-full py-4">
            <ul className="space-y-3 px-3">
              {navItems.map((item) => (
                <li key={item.name}>
                  <TooltipProvider delayDuration={0} disableHoverableContent={!collapsed}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-start h-12 rounded-lg hover:bg-slate-800 transition-colors",
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
            &copy; {new Date().getFullYear()} EastWest BPO MCI
          </div>
        )}
      </div>
    </>
  );
}