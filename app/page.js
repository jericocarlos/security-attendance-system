'use client';

import { useEffect, useState } from 'react';
import HIDListener from '@/lib/HIDListeners';
import Clock from '@/components/Clock';

export default function Home() {
  const [logs, setLogs] = useState([]); // Attendance logs
  const [employeeInfo, setEmployeeInfo] = useState(null); // Employee information
  const [employeeStatus, setEmployeeStatus] = useState(null); // Employee status
  const [error, setError] = useState(null); // Error message

  // Function to fetch attendance logs
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/attendance/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch attendance logs');
      }
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load attendance logs.');
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
        setError(null); // Clear any previous errors

        // Determine the employee's current status based on the latest log type
        const status = result.logType === 'IN' ? 'Clocked In' : 'Clocked Out';
        setEmployeeStatus(status);
      } else if (response.status === 404) {
        // Handle case where RFID tag does not exist in the database
        console.error('RFID tag not found:', result.error);
        setError('RFID tag not found. Please try again with a valid tag.');
        setEmployeeInfo(null); // Clear employee info if RFID tag is invalid
        setEmployeeStatus(null); // Clear employee status if RFID tag is invalid
      } else {
        console.error('Error processing tag:', result.error);
        setError(result.error || 'An unexpected error occurred.'); // Display the error message to the user
        setEmployeeInfo(null); // Clear employee info on error
        setEmployeeStatus(null); // Clear employee status on error
      }
    } catch (error) {
      console.error('Error sending tag to server:', error);
      setError('An unexpected error occurred while processing the RFID tag.');
      setEmployeeInfo(null); // Clear employee info on error
      setEmployeeStatus(null); // Clear employee status on error
    }
  };

  useEffect(() => {
    fetchLogs(); // Call fetchLogs on component mount
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-10 py-12">
      {/* Clock */}
      <div className="mb-10 text-center">
        <Clock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Employee Info Card */}
        <div className="bg-white shadow-2xl rounded-3xl p-10 space-y-6 transform transition-all duration-300 hover:scale-105">
          {employeeInfo ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800">Employee Information</h2>
              <p className="text-lg"><strong className="text-gray-700">Ashima ID:</strong> {employeeInfo.ashima_id}</p>
              <p className="text-lg"><strong className="text-gray-700">Name:</strong> {employeeInfo.name}</p>
              <p className="text-lg"><strong className="text-gray-700">Department:</strong> {employeeInfo.department || 'N/A'}</p>
              <p className="text-lg"><strong className="text-gray-700">Position:</strong> {employeeInfo.position || 'N/A'}</p>

              <div className="mt-6 border-t border-gray-300 pt-6">
                <h3 className="text-xl font-semibold text-gray-800">Time Logs</h3>
                <p className="text-[30px]">
                  <strong className="text-gray-700">Time In:</strong>{' '}
                  <span className="font-bold text-[40px]">
                    {employeeInfo?.timeIn ? new Date(employeeInfo.timeIn).toLocaleTimeString() : 'N/A'}
                  </span>
                </p>
                {/* Conditionally render "Time Out" only if it exists and the employee has clocked out */}
                {employeeStatus === 'Clocked Out' && employeeInfo?.timeOut && (
                  <p className="text-[30px]">
                    <strong className="text-gray-700">Time Out:</strong>{' '}
                    <span className="font-bold text-[40px]">
                      {new Date(employeeInfo.timeOut).toLocaleTimeString()}
                    </span>
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic text-lg">Scan your RFID to view logs.</p>
          )}

          {error && <p className="text-red-500 mt-4 text-lg">{error}</p>}
        </div>

        {/* Image & Status */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-120 h-120 rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105">
            <img
              src={employeeInfo ? `/api/employees/photo?ashima_id=${employeeInfo.ashima_id}` : '/placeholder.png'}
              alt={employeeInfo?.name || 'Placeholder'}
              className="w-full h-full object-cover"
            />
          </div>
          {employeeStatus && (
            <div
              className={`text-3xl font-bold ${
                employeeStatus === 'Clocked Out'
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {employeeStatus} {/* Dynamically display the employee status */}
            </div>
          )}
        </div>
      </div>
      {/* HID Listener */}
      <HIDListener onTagRead={handleTagRead} />
    </div>
  );
}