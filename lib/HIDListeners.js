'use client';

import { useEffect, useRef, useState } from 'react';

export default function HIDListener({ onTagRead }) {
  const tagBuffer = useRef('');
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isReading) {
        setIsReading(true);
        tagBuffer.current = '';
      }

      if (event.key === 'Enter') {
        setIsReading(false);
        onTagRead(tagBuffer.current);
        tagBuffer.current = '';
      } else {
        tagBuffer.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReading, onTagRead]);

  return (
    <div className="bg-gray-100 p-4 rounded-md hidden">
      <h2 className="text-lg font-medium text-gray-900">HID RFID Reader</h2>
      <p className="text-sm text-gray-600">
        {isReading ? 'Reading tag...' : 'Waiting for input...'}
      </p>
    </div>
  );
}