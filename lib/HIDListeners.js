'use client';

import { useEffect, useState } from 'react';

export default function HIDListener({ onTagRead }) {
  const [tag, setTag] = useState('');
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Start reading when the first key is pressed
      if (!isReading) {
        setIsReading(true);
        setTag(''); // Reset the tag
      }

      // Check for "Enter" key to finalize the tag
      if (event.key === 'Enter') {
        setIsReading(false); // Stop reading
        onTagRead(tag); // Pass the tag to the parent
        setTag(''); // Clear the tag
      } else {
        // Append the key to the tag
        setTag((prevTag) => prevTag + event.key);
      }
    };

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Cleanup the event listener
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReading, tag, onTagRead]);

  return (
    <div className="bg-gray-100 p-4 rounded-md hidden">
      <h2 className="text-lg font-medium text-gray-900">HID RFID Reader</h2>
      <p className="text-sm text-gray-600">
        {isReading ? 'Reading tag...' : 'Waiting for input...'}
      </p>
    </div>
  );
}