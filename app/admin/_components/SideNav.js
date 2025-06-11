"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight,
  FiClipboard,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";
import { cn } from "@/lib/utils"; // shadcn/ui utility
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from 'next/image';

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Example: get user role from props, context, or authentication
  const role = "Admin"; // Change this as needed

  let navItems;
  if (role === "Admin") {
    navItems = [
      {
        name: 'Employee Management',
        href: '/admin/employees-management',
        icon: <FiUsers className="h-[18px] w-[18px]" />,
      },
      {
        name: 'Lists',
        href: '/admin/lists',
        icon: <FiClipboard className="h-[18px] w-[18px]" />,
      },
      {
        name: 'Logout',
        href: '/login',
        icon: <FiLogOut className="h-[18px] w-[18px]" />,
      },
    ];
  } else if (role === "Supervisor" || role === "Manager") {
    navItems = [
      {
        name: 'Attendance Logs',
        href: '/admin/attendance-logs',
        icon: <FiCalendar className="h-[18px] w-[18px]" />,
      },
      {
        name: 'Employee Management',
        href: '/admin/employees-management',
        icon: <FiUsers className="h-[18px] w-[18px]" />,
      },
      {
        name: 'Lists',
        href: '/admin/lists',
        icon: <FiClipboard className="h-[18px] w-[18px]" />,
      },
      {
        name: 'Logout',
        href: '/login',
        icon: <FiLogOut className="h-[18px] w-[18px]" />,
      },
    ];
  } else {
    navItems = [];
  }

  return (
    <>
      {/* SideNav - Using flex layout to position footer at bottom */}
      <div className={cn(
        "bg-slate-900 text-white h-screen sticky top-0 left-0 z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}>
        {/* SideNav Header */}
        <div className="p-5 flex items-center justify-center border-b border-slate-800">
          <div className="flex items-center justify-center">
            {collapsed ? (
              <Image
                src="/ewbpo.png"
                alt="EWBPO Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            ) : (
              <Image
                src="/ewbpo.png"
                alt="EWBPO Logo"
                width={200}
                height={80}
                className="object-contain"
                priority
              />
            )}
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
        
        {/* Navigation Items - Using flex-1 to fill available space */}
        <nav className="flex-1 py-4 overflow-y-auto">
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
        
        {/* Footer - mt-auto not needed with flex parent, border-top for visual separation */}
        <div className="p-4 text-center text-sm text-slate-400 border-slate-800">
            Logged in as <span className="font-semibold">Supervisor</span> 
          </div>
        {!collapsed && (
          <div className="p-4 text-center text-sm text-slate-400 border-t border-slate-800">
            &copy; {new Date().getFullYear()} EastWest BPO MCI
          </div>
        )}
        {collapsed && (
          <div className="p-4 text-center text-sm text-slate-400 border-t border-slate-800">
            &copy;
          </div>
        )}
      </div>
    </>
  );
}