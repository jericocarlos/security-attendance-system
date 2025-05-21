'use client';

import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export default function EmployeeCard({ employeeInfo, attendanceLog, employeeStatus }) {
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return dayjs(timeString).format('h:mm A');
  };

  const getWelcomeMessage = () => {
    if (employeeStatus === 'Clocked In') {
      return `Welcome, ${employeeInfo.name.split(' ')[0]}!`;
    } else {
      return `Goodbye, ${employeeInfo.name.split(' ')[0]}!`;
    }
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur rounded-3xl p-10 shadow-2xl border border-cyan-500/20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1 
        className="text-5xl font-bold mb-8 text-cyan-300"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {getWelcomeMessage()}
      </motion.h1>
      
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-xl text-cyan-200">ID Number</p>
          <p className="text-4xl font-bold">{employeeInfo.ashima_id}</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p className="text-xl text-cyan-200">Full Name</p>
          <p className="text-5xl font-bold">{employeeInfo.name}</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 gap-6 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div>
            <p className="text-xl text-cyan-200">Department</p>
            <p className="text-3xl font-semibold">{employeeInfo.department || 'N/A'}</p>
          </div>
          
          <div>
            <p className="text-xl text-cyan-200">Position</p>
            <p className="text-3xl font-semibold">{employeeInfo.position || 'N/A'}</p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="mt-12 border-t border-cyan-500/20 pt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-3xl font-bold mb-6">Attendance Record</h3>
        
        {attendanceLog && (
          <div className="grid grid-cols-2 gap-8">
            <motion.div 
              className={`p-6 rounded-xl bg-green-500/20 border border-green-500/30`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-2xl text-green-300">TIME IN</p>
              <p className="text-5xl font-bold">
                {formatTime(attendanceLog.in_time)}
              </p>
            </motion.div>
            
            <motion.div 
              className={`p-6 rounded-xl ${attendanceLog.out_time 
                ? 'bg-red-500/20 border border-red-500/30' 
                : 'bg-gray-500/20 border border-gray-500/30'}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-2xl text-red-300">TIME OUT</p>
              <p className="text-5xl font-bold">
                {formatTime(attendanceLog.out_time)}
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}