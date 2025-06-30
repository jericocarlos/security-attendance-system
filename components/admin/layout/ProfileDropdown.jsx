"use client";

import { useState, useRef } from "react";
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
import { User, LogOut } from 'lucide-react';
import { getFirstName } from '@/utils/dateUtils';
import LogoutConfirmationDialog from "@/components/auth/LogoutConfirmationDialog";
import ProfileDialog from "@/components/profile/ProfileDialog";

export default function ProfileDropdown({ session }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef(null);

  if (!session) return null;
  
  const userInfo = {
    name: session?.user?.name || "Unknown",
    email: session?.user?.email || "",
    image: session?.user?.image,
    initial: session?.user?.name?.[0]?.toUpperCase() || "U",
    role: session?.user?.role || "user",
    firstName: getFirstName(session?.user?.name || "Unknown")
  };

  // Format role for display
  const formattedRole = userInfo.role === "superadmin" 
    ? "Super Admin" 
    : userInfo.role === "hr"
      ? "HR"
      : userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1);

  // Handle opening profile dialog
  const handleOpenProfile = () => {
    setShowProfileDialog(true);
    setDropdownOpen(false); // Close dropdown when dialog opens
  };

  // Handle opening logout dialog
  const handleOpenLogout = () => {
    setShowLogoutDialog(true);
    setDropdownOpen(false); // Close dropdown when dialog opens
  };

  // Handle profile dialog close
  const handleProfileDialogClose = (open) => {
    setShowProfileDialog(open);
    // If dialog is closing, return focus to trigger button
    if (!open && triggerRef.current) {
      setTimeout(() => {
        triggerRef.current.focus();
      }, 0);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            ref={triggerRef}
            variant="ghost" 
            className="relative h-10 w-10 rounded-full focus-visible:ring-offset-2"
          >
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
                Hello, {userInfo.firstName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userInfo.email}
              </p>
              <p className="text-xs leading-none text-blue-600 mt-1">
                {formattedRole} User
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleOpenLogout} 
            className="text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />

      {/* Profile Dialog */}
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={handleProfileDialogClose}
      />
    </>
  );
}