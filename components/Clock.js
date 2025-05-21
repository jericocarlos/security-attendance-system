'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export default function Clock() {
  const [dateTime, setDateTime] = useState(null);

  useEffect(() => {
    // Set the initial time and start the interval to update every second
    setDateTime(new Date());
    const timer = setInterval(() => setDateTime(new Date()), 1000);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  if (!dateTime) {
    // Show nothing or a placeholder until the client renders
    return null;
  }

  // Use dayjs for consistent formatting
  const timeString = dayjs(dateTime).format('hh:mm:ss A');
  const dateString = dayjs(dateTime).format('dddd, MMMM D, YYYY');

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="bg-black/30 backdrop-blur-sm rounded-2xl px-10 py-4 shadow-2xl border border-cyan-500/20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.h2 
          className="text-9xl font-bold font-mono tracking-wider text-white"
          animate={{ textShadow: ["0 0 8px rgba(0,185,255,0.1)", "0 0 16px rgba(0,185,255,0.3)", "0 0 8px rgba(0,185,255,0.1)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {timeString}
        </motion.h2>
        <motion.p 
          className="text-4xl text-cyan-300 text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {dateString}
        </motion.p>
      </motion.div>
    </div>
  );
}