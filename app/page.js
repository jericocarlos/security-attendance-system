'use client';

import { useEffect, useState, useCallback } from 'react';
import HIDListener from '@/lib/HIDListeners';
import Clock from '@/components/Clock';
import Image from 'next/image';

export default function Home() {
  const [employeeInfo, setEmployeeInfo] = useState(null); // Employee information
  const [attendanceLog, setAttendanceLog] = useState(null); // Latest attendance log
  const [employeeStatus, setEmployeeStatus] = useState(null); // Employee status
  const [error, setError] = useState(null); // Error message

  // Handle RFID tag scan
  const handleTagRead = async (tag) => {
    try {
      const response = await fetch('/api/attendance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfid_tag: tag }),
      });

      const result = await response.json();

      if (response.ok) {
        updateEmployeeInfo(result);
      } else if (response.status === 404) {
        handleTagNotFound(result.error);
      } else {
        handleTagError(result.error);
      }
    } catch (err) {
      console.error('Error sending tag to server:', err);
      setError('An unexpected error occurred while processing the RFID tag.');
      clearEmployeeInfo();
    }
  };

  // Update employee info and logs with new API response format
  const updateEmployeeInfo = (result) => {
    const { employee, attendanceLog, logType } = result;
    
    setEmployeeInfo(employee);
    setAttendanceLog(attendanceLog);
    setError(null);

    // Determine employee status based on logType from API
    const status = logType === 'IN' ? 'Clocked In' : 'Clocked Out';
    setEmployeeStatus(status);
  };

  // Handle RFID tag not found
  const handleTagNotFound = (error) => {
    console.error('RFID tag not found:', error);
    setError('RFID tag not found. Please try again with a valid tag.');
    clearEmployeeInfo();
  };

  // Handle other tag errors
  const handleTagError = (error) => {
    console.error('Error processing tag:', error);
    setError(error || 'An unexpected error occurred.');
    clearEmployeeInfo();
  };

  // Clear employee info and status
  const clearEmployeeInfo = () => {
    setEmployeeInfo(null);
    setAttendanceLog(null);
    setEmployeeStatus(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-10 py-12">
      {/* Clock */}
      <div className="mb-10 text-center">
        <Clock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Employee Info Card */}
        <EmployeeInfoCard
          employeeInfo={employeeInfo}
          attendanceLog={attendanceLog}
          employeeStatus={employeeStatus}
          error={error}
        />

        {/* Image & Status */}
        <EmployeeImageAndStatus
          employeeInfo={employeeInfo}
          employeeStatus={employeeStatus}
        />
      </div>

      {/* HID Listener */}
      <HIDListener onTagRead={handleTagRead} />
    </div>
  );
}

// Employee Info Card Component
function EmployeeInfoCard({ employeeInfo, attendanceLog, employeeStatus, error }) {
  return (
    <div className="bg-white shadow-2xl rounded-3xl p-10 space-y-6 transform transition-all duration-300 hover:scale-105">
      {employeeInfo ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800">Employee Information</h2>
          <p className="text-lg">
            <strong className="text-gray-700">Ashima ID:</strong> {employeeInfo.ashima_id}
          </p>
          <p className="text-lg">
            <strong className="text-gray-700">Name:</strong> {employeeInfo.name}
          </p>
          <p className="text-lg">
            <strong className="text-gray-700">Department:</strong> {employeeInfo.department || 'N/A'}
          </p>
          <p className="text-lg">
            <strong className="text-gray-700">Position:</strong> {employeeInfo.position || 'N/A'}
          </p>

          <div className="mt-6 border-t border-gray-300 pt-6">
            <h3 className="text-xl font-semibold text-gray-800">Time Logs</h3>
            {attendanceLog && (
              <>
                <p className="text-[30px]">
                  <strong className="text-gray-700">Time In:</strong>{' '}
                  <span className="font-bold text-[40px]">
                    {attendanceLog.in_time ? new Date(attendanceLog.in_time).toLocaleTimeString() : 'N/A'}
                  </span>
                </p>
                {attendanceLog.out_time && (
                  <p className="text-[30px]">
                    <strong className="text-gray-700">Time Out:</strong>{' '}
                    <span className="font-bold text-[40px]">
                      {new Date(attendanceLog.out_time).toLocaleTimeString()}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-500 italic text-lg">Scan your RFID to view logs.</p>
      )}

      {error && <p className="text-red-500 mt-4 text-lg">{error}</p>}
    </div>
  );
}

// Employee Image and Status Component
function EmployeeImageAndStatus({ employeeInfo, employeeStatus }) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-120 h-120 rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105">
        {employeeInfo?.photo ? (
          <img
            src={employeeInfo.photo}
            alt={employeeInfo.name}
            className="w-full h-full object-cover"
            width={250}
            height={250}
          />
        ) : (
          <Image
            src="/placeholder.png"
            alt="Placeholder"
            className="w-full h-full object-cover"
            width={250}
            height={250}
          />
        )}
      </div>
      {employeeStatus && (
        <div
          className={`text-3xl font-bold ${
            employeeStatus === 'Clocked Out' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {employeeStatus}
        </div>
      )}
    </div>
  );
}