"use client";

import { useState, useEffect } from "react";

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]); // Initialize as an empty array
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/attendance-logs?page=${page}&limit=${limit}`);
        const data = await response.json();
        setLogs(data.data || []); // Fallback to an empty array if data.data is undefined
        setTotal(data.total || 0); // Fallback to 0 if total is undefined
      } catch (err) {
        console.error("Failed to fetch attendance logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Attendance Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length > 0 ? ( // Check if logs has data before rendering the table
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
                  <td className="border px-4 py-2">{log.employee_id}</td>
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