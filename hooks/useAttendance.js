'use client';

import { useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';
import { API, STATUS, SETTINGS } from '@/constants';

export default function useAttendance() {
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState(null);
  const [employeeStatus, setEmployeeStatus] = useState(null);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(false); // <-- Add loading state

  const [playSuccess] = useSound('/sounds/success.mp3');
  const [playError] = useSound('/sounds/error.mp3');

  useEffect(() => {
    if (!employeeInfo) return;
    setShowInstructions(false);
    const timer = setTimeout(() => {
      clearEmployeeInfo();
      setShowInstructions(true);
    }, SETTINGS.AUTO_CLEAR_TIMEOUT);
    return () => clearTimeout(timer);
  }, [employeeInfo]);

  const clearEmployeeInfo = useCallback(() => {
    setEmployeeInfo(null);
    setAttendanceLog(null);
    setEmployeeStatus(null);
    setLoading(false); // <-- Reset loading on clear
  }, []);

  const handleTagRead = useCallback(async (tag) => {
    setLoading(true); // <-- Set loading true at start
    setEmployeeInfo({ name: 'Processing...', photo: null });
    setAttendanceLog(null);
    setEmployeeStatus('Processing...');
    setError(null);

    try {
      const response = await fetch(API.ADD_ATTENDANCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfid_tag: tag }),
      });
      const result = await response.json();

      if (response.ok) {
        setEmployeeInfo(result.employee);
        setAttendanceLog(result.attendanceLog);
        setEmployeeStatus(result.logType === 'IN' ? STATUS.CLOCKED_IN : STATUS.CLOCKED_OUT);
        setError(null);
        playSuccess();
      } else {
        setError(result.error || 'An unexpected error occurred.');
        clearEmployeeInfo();
        playError();
      }
    } catch (err) {
      setError('An unexpected error occurred while processing the RFID tag.');
      clearEmployeeInfo();
      playError();
    } finally {
      setLoading(false); // <-- Always reset loading
    }
  }, [clearEmployeeInfo, playSuccess, playError]);

  return {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    showInstructions,
    handleTagRead,
    clearEmployeeInfo,
    loading // <-- Return loading
  };
}