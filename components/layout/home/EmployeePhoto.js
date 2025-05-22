'use client';

import { motion } from 'framer-motion';
import Image from 'next/image'; // Add this import

export default function EmployeePhoto({ employeeInfo, employeeStatus }) {
  return (
    <div className="flex flex-col items-center">
      {/* Large employee photo - adjusted size */}
      <motion.div 
        className="mb-6" // Reduced margin to accommodate badge below
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="w-[600px] h-[600px] rounded-3xl overflow-hidden border-8 border-white/20 shadow-2xl" // Increased size
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {employeeInfo?.photo ? (
            <div className="relative w-full h-full">
              <Image
                src={employeeInfo.photo}
                alt={employeeInfo.name}
                fill
                sizes="600px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-800 to-purple-800">
              <span className="text-9xl font-bold text-white/60">
                {employeeInfo.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Status badge moved below photo
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
      </motion.div> */}
    </div>
  );
}