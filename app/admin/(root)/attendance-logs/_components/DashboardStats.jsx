"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiRefreshCw } from "react-icons/fi";

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/attendance-logs/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {loading ? (
        <div className="col-span-3 flex justify-center items-center py-8">
          <FiRefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading stats...</span>
        </div>
      ) : error ? (
        <div className="col-span-3 bg-red-50 text-red-500 p-4 rounded-md">
          Error: {error}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.total_logs}</div>
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  All Records
                </Badge>
              </div>
            </CardContent>
          </Card>
          
        </>
      )}
    </div>
  );
}