'use client';

import { useState, useEffect } from 'react';

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

  return (
    <div className="text-center mb-6">
      <h2 className="text-9xl font-bold">{dateTime.toLocaleTimeString()}</h2>
      <p className="text-4xl text-gray-600">{dateTime.toDateString()}</p>
    </div>
  );
}