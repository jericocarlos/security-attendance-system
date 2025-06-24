"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Clock,
  PanelLeft,
  PanelLeftClose,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useCurrentUtcTime } from '@/hooks/useCurrentUtcTime';
import { useSession, signOut } from "next-auth/react";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export default function Header({ onMenuToggle, isCollapsed }) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const currentTime = useCurrentUtcTime();
  const [notifications, setNotifications] = useState([]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  const formatDateTime = (time) => {
    return time.format('YYYY-MM-DD HH:mm:ss');
  };

  const formatDateReadable = (time) => {
    return time.format('dddd, MMMM D, YYYY');
  };

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

  const userInfo = {
    name: session?.user?.name || "Unknown",
    email: session?.user?.email || "",
    image: session?.user?.image,
    initial: session?.user?.name?.[0]?.toUpperCase() || "U",
    role: session?.user?.role || "user"
  };

  return (
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
                {currentTime.format('HH:mm:ss')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-sm text-gray-500">
                {formatDateReadable(currentTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Profile */}
        <div className="flex items-center space-x-3">
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userInfo.image} alt={userInfo.name} />
                  <AvatarFallback className="bg-blue-500 text-white font-semibold">
                    {userInfo.initial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Current User's Login: {userInfo.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userInfo.email}
                  </p>
                  <p className="text-xs leading-none text-blue-600 mt-1">
                    {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} User
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Time Display */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">
              Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {formatDateTime(currentTime)}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-6">
            Current User's Login: {userInfo.name}
          </span>
        </div>
      </div>
    </motion.header>
  );
}