"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiRefreshCw } from "react-icons/fi";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    active: 0,
    inactive: 0,
    resigned: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/employees/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats({
        active: data.active || 0,
        inactive: data.inactive || 0,
        resigned: data.resigned || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <FiRefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading stats...</span>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.active}</div>
                <Badge variant="default" className="bg-green-500">Active</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inactive Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                  Inactive
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Resigned Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.resigned}</div>
                <Badge variant="outline" className="text-red-500 border-red-500">
                  Resigned
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}