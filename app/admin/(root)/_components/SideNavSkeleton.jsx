"use client";

import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function SideNavSkeleton({ collapsed }) {
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
        {/* Header skeleton */}
        <div className="p-4 flex items-center justify-center border-b border-slate-800">
          {collapsed ? (
            <div className="w-8 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
          ) : (
            <div className="flex items-center space-x-3 w-full">
              <div className="w-8 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 mt-1 bg-slate-800 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation skeleton */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {[1, 2, 3, 4].map((item) => (
              <li key={item}>
                <div className={cn(
                  "flex items-center h-11 rounded-lg bg-slate-800/50 animate-pulse",
                  collapsed ? "px-3 justify-center" : "px-4"
                )}>
                  <div className="w-[18px] h-[18px] rounded-full bg-slate-700"></div>
                  {!collapsed && (
                    <div className="h-4 ml-3 bg-slate-700 rounded w-2/3"></div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer skeleton */}
        <div className="p-4 border-t border-slate-800">
          {!collapsed && (
            <div className="text-center space-y-1">
              <div className="h-3 bg-slate-800 rounded w-1/2 mx-auto animate-pulse"></div>
              <div className="h-3 bg-slate-800 rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-3 mt-1 bg-slate-800 rounded w-1/4 mx-auto animate-pulse"></div>
            </div>
          )}
          {collapsed && (
            <div className="text-center">
              <div className="h-3 bg-slate-800 rounded w-4 mx-auto animate-pulse"></div>
            </div>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  );
}