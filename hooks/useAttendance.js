'use client';

import { useState, useEffect } from 'react';
import useSound from 'use-sound';

export default function useAttendance() {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState(null);
  const [employeeStatus, setEmployeeStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Sound effects using use-sound
  const [playSuccess] = useSound('/sounds/success.mp3');
  const [playError] = useSound('/sounds/error.mp3');
  
  // Auto-clear after 20 seconds
  useEffect(() => {
    let timer;
    if (employeeInfo) {
      setShowInstructions(false);
      timer = setTimeout(() => {
        clearEmployeeInfo();
        setShowInstructions(true);
      }, 20000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [employeeInfo]);

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
        playSuccess();
      } else if (response.status === 404) {
        handleTagNotFound(result.error);
        playError();
      } else {
        handleTagError(result.error);
        playError();
      }
    } catch (err) {
      console.error('Error sending tag to server:', err);
      setError('An unexpected error occurred while processing the RFID tag.');
      clearEmployeeInfo();
      playError();
    }
  };

  const updateEmployeeInfo = (result) => {
    const { employee, attendanceLog, logType } = result;
    
    setEmployeeInfo(employee);
    setAttendanceLog(attendanceLog);
    setError(null);

    const status = logType === 'IN' ? 'Clocked In' : 'Clocked Out';
    setEmployeeStatus(status);
  };

  const handleTagNotFound = (error) => {
    console.error('RFID tag not found:', error);
    setError('RFID tag not found. Please try again with a valid tag.');
    clearEmployeeInfo();
  };

  const handleTagError = (error) => {
    console.error('Error processing tag:', error);
    setError(error || 'An unexpected error occurred.');
    clearEmployeeInfo();
  };

  const clearEmployeeInfo = () => {
    setEmployeeInfo(null);
    setAttendanceLog(null);
    setEmployeeStatus(null);
  };

  return {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    showInstructions,
    handleTagRead,
    clearEmployeeInfo
  };
}