"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useAccessibleModules, useAttendanceAccess } from "@/hooks/useModuleAccess";
import { MODULE_DEFINITIONS } from "@/constants/moduleDefinitions";
import LogoutConfirmationDialog from "@/components/auth/LogoutConfirmationDialog";
import {
  DashboardHeader,
  ModuleAccessCards,
  QuickAction
} from "@/components/admin/dashboard";

/**
 * Admin Dashboard Component
 * 
 * Main dashboard page for the RFID Attendance System admin interface.
 * Provides an overview of system statistics, quick access to modules based on
 * user permissions, and personalized user experience.
 * 
 * Features:
 * - Time-based personalized greeting
 * - Role-based module access with permission checking
 * - Real-time system statistics with error handling
 * - Responsive design with loading states
 * - Accessible UI with ARIA labels and keyboard navigation
 * - Logout confirmation dialog
 * 
 * @returns {JSX.Element} The admin dashboard page
 */
export default function AdminDashboard() {
  // Session and permissions
  const { data: session, status } = useSession();
  const { permissions, loading: permissionsLoading } = useRolePermissions();
  
  // Logout dialog state
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  
  // Computed values using custom hooks
  const accessibleModules = useAccessibleModules(session, permissions, MODULE_DEFINITIONS);
  const hasAttendanceAccess = useAttendanceAccess(session, permissions, accessibleModules);
  
  // Loading state computation
  const isLoading = status === "loading" || permissionsLoading;

  /**
   * Handle logout button click
   * Opens confirmation dialog instead of immediate logout
   */
  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  return (
    <main className="container mx-auto px-4 py-8" role="main">
      {/* Welcome Section with Logout */}
      <DashboardHeader 
        session={session} 
        onLogout={handleLogout} 
      />

      {/* Quick Access Cards - Dynamic based on permissions */}
      <ModuleAccessCards 
        isLoading={isLoading}
        accessibleModules={accessibleModules}
      />

      {/* Quick Action - Attendance Logs */}
      <QuickAction hasAttendanceAccess={hasAttendanceAccess} />
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog 
        open={logoutDialogOpen} 
        onOpenChange={setLogoutDialogOpen} 
      />
    </main>
  );
}