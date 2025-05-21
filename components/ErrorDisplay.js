'use client';

import { motion } from 'framer-motion';

export default function ErrorDisplay({ error }) {
  if (!error) return null;
  
  return (
    <motion.div 
      className="mt-8 bg-red-800 p-8 rounded-xl max-w-3xl mx-auto"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="flex items-center">
        <motion.div 
          className="mr-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: 2, duration: 0.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.div>
        <p className="text-4xl font-bold text-white">{error}</p>
      </div>
    </motion.div>
  );
}