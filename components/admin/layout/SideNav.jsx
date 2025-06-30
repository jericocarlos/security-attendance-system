"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Calendar,
  Clipboard,
  Users,
  UserCog,
  Shield,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from "next-auth/react";
import { useRolePermissions } from '@/hooks/useRolePermissions';
import SideNavSkeleton from './SideNavSkeleton';

// Module definitions with their corresponding routes and icons
const MODULE_DEFINITIONS = {
  employees_management: {
    name: 'Employees Management',
    href: '/admin/employees-management',
    icon: <Users className="h-[18px] w-[18px]" />,
  },
  data_management: {
    name: 'Data Management',
    href: '/admin/lists',
    icon: <Database className="h-[18px] w-[18px]" />,
  },
  account_logins: {
    name: 'Account Logins',
    href: '/admin/account-logins',
    icon: <UserCog className="h-[18px] w-[18px]" />,
  },
  attendance_logs: {
    name: 'Attendance Logs',
    href: '/admin/attendance-logs',
    icon: <Calendar className="h-[18px] w-[18px]" />,
  },
  role_permissions: {
    name: 'Role Permissions',
    href: '/admin/role-permissions',
    icon: <Shield className="h-[18px] w-[18px]" />,
  },
};

export default function SideNav({ collapsed }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { permissions, loading: permissionsLoading } = useRolePermissions();
  const isLoading = status === "loading" || permissionsLoading;

  // Build navigation items based on permissions
  const navItems = React.useMemo(() => {
    if (!permissions || !session?.user?.role) return [];

    // All roles (including superadmin) get modules based on their database permissions
    return Object.entries(MODULE_DEFINITIONS)
      .filter(([moduleKey]) => permissions[moduleKey]?.access)
      .map(([, moduleInfo]) => moduleInfo);
  }, [permissions, session?.user?.role]);

  // Show skeleton loading state while session or permissions are loading
  if (isLoading) {
    return <SideNavSkeleton collapsed={collapsed} />;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div 
        className={cn(
          "bg-slate-900 text-white h-screen sticky top-0 left-0 z-40 flex flex-col border-r border-slate-800",
          collapsed ? "w-16" : "w-64"
        )}
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header with company logo */}
        <div className="p-4 flex items-center justify-center border-b border-slate-800">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full"
              >
                {/* Compact logo for collapsed state */}
                <div className="relative w-10 h-10 bg-transparent rounded-lg flex items-center justify-center overflow-hidden">
                  <Image 
                    src="/ew-logo-compact.png" 
                    alt="EastWest BPO" 
                    width={40} 
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded-logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center w-full justify-center"
              >
                {/* Full logo for expanded state */}
                <div className="relative w-full h-12">
                  <Image 
                    src="/ew-logo-full.png"
                    alt="EastWest BPO MCI"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {navItems.map((item, index) => {
              const isActive = pathname.startsWith(item.href);
              
              return (
                <motion.li 
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center h-11 rounded-lg transition-all duration-200 group",
                          collapsed ? "px-3 justify-center" : "px-4",
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        )}
                      >
                        <span className={cn(
                          "flex-shrink-0 transition-transform group-hover:scale-110",
                          collapsed ? "" : "mr-3"
                        )}>
                          {item.icon}
                        </span>
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span 
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-sm font-medium truncate"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                        <span>{item.name}</span>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </motion.li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer with RFID system name */}
        <div className="p-4 border-t border-slate-800">
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center text-xs text-slate-400"
              >
                <p className="font-semibold">RFID Attendance System</p>
                <p>&copy; {new Date().getFullYear()}</p>
                <p className="mt-1 text-blue-400">v2.0.0</p>
              </motion.div>
            )}
          </AnimatePresence>
          {collapsed && (
            <div className="text-center text-xs text-slate-400">
              &copy;
            </div>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
}