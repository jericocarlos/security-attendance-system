'use client';

import { useEffect, useState } from 'react';
import HIDListener from '@/lib/HIDListeners';
import Clock from '@/components/Clock';

export default function Home() {
  const [logs, setLogs] = useState([]); // Attendance logs
  const [latestTag, setLatestTag] = useState(null); // Latest RFID tag scanned
  const [employeeInfo, setEmployeeInfo] = useState(null); // Employee information
  const [employeeStatus, setEmployeeStatus] = useState('Clocked Out'); // Employee status

  // Function to fetch attendance logs from the API
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/attendance/logs');
      const data = await response.json();

      if (response.ok) {
        setLogs(data); // Update logs state
      } else {
        console.error('Error fetching logs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Function to handle an RFID tag scan
  const handleTagRead = async (tag) => {
    try {
      const response = await fetch('/api/attendance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfid_tag: tag }),
      });

      const result = await response.json();

      if (response.ok) {
        setLogs((prevLogs) => [result, ...prevLogs]); // Prepend the new log to the logs
        setEmployeeInfo(result.employee); // Update employee info

        // Determine the employee's current status based on the latest log type
        const status = result.logType === 'IN' ? 'Clocked In' : 'Clocked Out';
        setEmployeeStatus(status);
      } else {
        console.error('Error processing tag:', result.error);
      }
    } catch (error) {
      console.error('Error sending tag to server:', error);
    }

    setLatestTag(tag); // Update the latest scanned tag
  };

  // Fetch attendance logs on initial load
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Clock */}
      <Clock />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Employee Info Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
          {employeeInfo ? (
            <>
              <p><strong>Ashima ID:</strong> {employeeInfo.ashima_id}</p>
              <p><strong>Name:</strong> {employeeInfo.name}</p>
              <p><strong>Department:</strong> {employeeInfo.department}</p>
              <p><strong>Position:</strong> {employeeInfo.position}</p>

              <div className="mt-4 border-t pt-4">
                <p className="text-xl font-semibold">Time Logs</p>
                <p><strong>Time In:</strong> {employeeInfo.timeIn || 'N/A'}</p>
                <p><strong>Time Out:</strong> {employeeInfo.timeOut || 'N/A'}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">Scan your RFID to view logs.</p>
          )}
        </div>

        {/* Image & Status */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-60 h-60 rounded-xl overflow-hidden shadow-md">
            <img
              src={employeeInfo?.photoUrl || '/placeholder.png'}
              alt={employeeInfo?.name || 'Placeholder'}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`text-2xl font-bold ${
              employeeStatus === 'Clocked Out'
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {employeeStatus} {/* Dynamically display the employee status */}
          </div>
        </div>
      </div>

      {/* Latest Tag */}
      {latestTag && (
        <div className="mt-6 bg-green-100 text-green-800 px-4 py-2 rounded-md">
          Latest Tag Scanned: <strong>{latestTag}</strong>
        </div>
      )}

      {/* HID Listener */}
      <HIDListener onTagRead={handleTagRead} />
    </div>
  );
}