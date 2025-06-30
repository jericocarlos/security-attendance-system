/**
 * Dashboard Header Component
 * Displays personalized greeting and logout button
 */
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

/**
 * Get time-based greeting
 * @returns {string} Greeting message based on current time
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Format user role for display
 * @param {string} userRole - Raw user role
 * @returns {string} Formatted role name
 */
function formatUserRole(userRole) {
  if (!userRole) return "";
  
  const roleMap = {
    superadmin: "Super Admin",
    hr: "HR"
  };
  
  return roleMap[userRole] || userRole.charAt(0).toUpperCase() + userRole.slice(1);
}

export default function DashboardHeader({ session, onLogout }) {
  const userName = session?.user?.name?.split(' ')[0] || "User";
  const formattedRole = formatUserRole(session?.user?.role);

  return (
    <motion.header 
      className="mb-8 flex justify-between items-start"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="banner"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome to the RFID Attendance System Dashboard. You are logged in as {formattedRole}.
        </p>
      </div>
      
      <Button 
        variant="outline" 
        onClick={onLogout}
        className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
        aria-label="Logout from the system"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </Button>
    </motion.header>
  );
}
