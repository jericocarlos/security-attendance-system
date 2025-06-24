"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, Users, CalendarCheck, FileText, ShieldAlert, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendance: 0,
    todayAttendance: 0,
    departments: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get user information
  const userName = session?.user?.name?.split(' ')[0] || "User";
  const userRole = session?.user?.role || "";
  const formattedRole = userRole === "superadmin" ? "Super Admin" : 
                        userRole === "hr" ? "HR" : 
                        userRole.charAt(0).toUpperCase() + userRole.slice(1);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {userName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome to the RFID Attendance System Dashboard. You are logged in as {formattedRole}.
        </p>
      </motion.div>

      {/* Quick Access Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Only show modules the user has access to */}
        {["superadmin", "admin"].includes(userRole) && (
          <motion.div variants={item}>
            <Link href="/admin/employees-management">
              <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500">
                <CardContent className="p-6 flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manage</p>
                    <h3 className="text-lg font-semibold">Employees</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        <motion.div variants={item}>
          <Link href="/admin/attendance-logs">
            <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500">
              <CardContent className="p-6 flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <CalendarCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">View</p>
                  <h3 className="text-lg font-semibold">Attendance Logs</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {["superadmin", "admin"].includes(userRole) && (
          <motion.div variants={item}>
            <Link href="/admin/account-logins">
              <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-purple-500">
                <CardContent className="p-6 flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <ShieldAlert className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manage</p>
                    <h3 className="text-lg font-semibold">Account Logins</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {["superadmin", "admin"].includes(userRole) && (
          <motion.div variants={item}>
            <Link href="/admin/lists">
              <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-amber-500">
                <CardContent className="p-6 flex items-center">
                  <div className="bg-amber-100 p-3 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Manage</p>
                    <h3 className="text-lg font-semibold">Lists</h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">System Overview</CardTitle>
          <CardDescription>
            Current statistics across the attendance system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold">
                  {loading ? "..." : stats.totalEmployees}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today&apos;s Logs</p>
                <p className="text-2xl font-semibold">
                  {loading ? "..." : stats.todayAttendance}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Departments</p>
                <p className="text-2xl font-semibold">
                  {loading ? "..." : stats.departments}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">All Time Logs</p>
                <p className="text-2xl font-semibold">
                  {loading ? "..." : stats.totalAttendance}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold">Need to view attendance records?</h3>
                <p className="text-gray-500">Access detailed attendance logs to monitor employee attendance</p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/admin/attendance-logs">
                  View Attendance Logs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}