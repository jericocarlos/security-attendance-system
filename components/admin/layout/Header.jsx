"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Clock,
  PanelLeft,
  PanelLeftClose,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { useSession } from "next-auth/react";
import ProfileDropdown from './ProfileDropdown';
import LogoutConfirmationDialog from "@/components/auth/LogoutConfirmationDialog";

export default function Header({ onMenuToggle, isCollapsed }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Update time every second for the clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left Section - Menu Toggle & Time */}
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="hidden md:flex flex-col space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Right Section - Profile */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>

        {/* Mobile Time Display */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex flex-col space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.header 
        className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left Section - Menu Toggle & Time */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="hover:bg-gray-100"
            >
              {isCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
            
            <div className="hidden md:flex flex-col">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {formatTime(currentTime)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {formatDate(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Profile */}
          <div className="flex items-center space-x-3">
            {/* Pass the logout dialog state setter to the ProfileDropdown */}
            <ProfileDropdown 
              session={session} 
              onLogout={() => setShowLogoutDialog(true)} 
            />
          </div>
        </div>

        {/* Mobile Time Display */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm">
                {currentTime.toISOString().slice(0, 19).replace('T', ' ')}
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-6">
              Hello, {session?.user?.name?.split(' ')[0] || "User"}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />
    </>
  );
}