"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FiUsers, FiShield, FiUserPlus, FiUserCheck } from "react-icons/fi";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    adminAccounts: 0,
    securityAccounts: 0,
    hrAccounts: 0,
    recentAccounts: 0, // Added new stat to replace active/inactive
    loading: true
  });

  useEffect(() => {
    const fetchAccountStats = async () => {
      try {
        const response = await fetch("/api/admin/accounts/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch account statistics");
        }
        const data = await response.json();
        setStats({
          totalAccounts: data.total || 0,
          adminAccounts: (data.admin || 0) + (data.superadmin || 0), // Combine admin counts
          securityAccounts: data.security || 0,
          hrAccounts: data.hr || 0,
          recentAccounts: data.recentAccounts || 0,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching account statistics:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAccountStats();
  }, []);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Accounts */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
            <p className="text-3xl font-bold">
              {stats.loading ? <span className="animate-pulse">...</span> : stats.totalAccounts}
            </p>
          </div>
          <FiUsers className="h-10 w-10 text-blue-500 opacity-80" />
        </CardContent>
      </Card>

      {/* Admin Accounts */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Admin Accounts</p>
            <p className="text-3xl font-bold">
              {stats.loading ? <span className="animate-pulse">...</span> : stats.adminAccounts}
            </p>
          </div>
          <FiShield className="h-10 w-10 text-purple-500 opacity-80" />
        </CardContent>
      </Card>
      
      {/* Security Accounts */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Security Accounts</p>
            <p className="text-3xl font-bold">
              {stats.loading ? <span className="animate-pulse">...</span> : stats.securityAccounts}
            </p>
          </div>
          <FiUserCheck className="h-10 w-10 text-green-500 opacity-80" />
        </CardContent>
      </Card>
      
      {/* HR Accounts or Recent Accounts */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recently Added</p>
            <p className="text-3xl font-bold">
              {stats.loading ? <span className="animate-pulse">...</span> : stats.recentAccounts}
            </p>
          </div>
          <FiUserPlus className="h-10 w-10 text-amber-500 opacity-80" />
        </CardContent>
      </Card>
    </div>
  );
}