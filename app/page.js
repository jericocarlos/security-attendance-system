'use client';

import { motion, AnimatePresence } from 'framer-motion';
import HIDListener from '@/lib/HIDListeners';
import Clock from '@/components/Clock';
import EmployeeCard from '@/components/layout/home/EmployeeCard';
import EmployeePhoto from '@/components/layout/home/EmployeePhoto';
import ErrorDisplay from '@/components/ErrorDisplay';
import useAttendance from '@/hooks/useAttendance';
import { ANIMATIONS } from '@/constants';
import Image from 'next/image';

export default function Home() {
  const {
    employeeInfo,
    attendanceLog,
    employeeStatus,
    error,
    showInstructions,
    handleTagRead
  } = useAttendance();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Clock component at the top */}
      <motion.div 
        className="pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Clock />
      </motion.div>

      {/* Conditional main content */}
      <div className="container my-5 mx-auto px-8 pb-20">
        {/* Instructions or welcome message */}
        <AnimatePresence>
          {showInstructions && !error && (
            <motion.div 
              className="text-center my-10"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={ANIMATIONS.fadeIn}
            >
              <motion.h2 
                className="text-5xl font-bold text-cyan-300"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Please Tap Your ID Card
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Employee data display */}
        <AnimatePresence>
          {employeeInfo && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              variants={ANIMATIONS.fadeIn}
            >
              {/* Left side - Employee Info */}
              <EmployeeCard 
                employeeInfo={employeeInfo} 
                attendanceLog={attendanceLog}
                employeeStatus={employeeStatus} 
              />
              
              {/* Right side - Photo and status */}
              <EmployeePhoto 
                employeeInfo={employeeInfo}
                employeeStatus={employeeStatus} 
              />
              
            </motion.div>
            
          )}
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {error && <ErrorDisplay error={error} />}
        </AnimatePresence>
      </div>

      {/* Company branding footer */}
      <div className="fixed bottom-0 left-0 w-full bg-black/30 backdrop-blur">
        <div className="container mx-auto flex justify-between items-center px-8">
          <div className="text-2xl font-bold">Security Attendance System</div>
          
          {/* Status badge */}
          {employeeStatus && (
            <motion.div 
              className={`py-4 px-12 rounded-full ${
                employeeStatus === 'Clocked In' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-4xl font-bold">{employeeStatus}</span>
            </motion.div>
          )}
          
          <div>
            <Image
              src="/ewbpo.png" 
              alt="EWBPO Logo" 
              width={300}
              height={53}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* HID Listener */}
      <HIDListener onTagRead={handleTagRead} />
    </div>
  );
}