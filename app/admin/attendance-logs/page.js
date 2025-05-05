"use client";

import { useState, useEffect, useCallback } from "react";

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/attendance-logs?page=${page}&limit=${limit}`, {
        signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Failed to fetch attendance logs:", err);
        setError("Failed to load attendance logs. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/admin/attendance-logs/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_logs.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance Logs</h1>
      <button
        onClick={handleExportCSV}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Export as CSV
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length > 0 ? (
        <div>
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Employee ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Log Type</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="border px-4 py-2">{log.ashima_id}</td>
                  <td className="border px-4 py-2">{log.name}</td>
                  <td className="border px-4 py-2">{log.department}</td>
                  <td className="border px-4 py-2">{log.log_type}</td>
                  <td className="border px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p>No attendance logs available.</p>
      )}
    </div>
  );
}