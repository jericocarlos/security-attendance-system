'use client';

import { useEffect, useRef } from 'react';

export default function HIDListener({ onTagRead }) {
  const tagBuffer = useRef('');
  const readingTimeout = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore modifier keys and non-character keys except Enter
      if (event.key.length > 1 && event.key !== 'Enter') return;

      // Start or continue reading
      if (readingTimeout.current) clearTimeout(readingTimeout.current);

      if (event.key === 'Enter') {
        if (tagBuffer.current.length > 0) {
          onTagRead(tagBuffer.current);
        }
        tagBuffer.current = '';
      } else {
        tagBuffer.current += event.key;
        // Short debounce: if Enter is not pressed within 50ms, auto-submit
        readingTimeout.current = setTimeout(() => {
          if (tagBuffer.current.length > 0) {
            onTagRead(tagBuffer.current);
            tagBuffer.current = '';
          }
        }, 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (readingTimeout.current) clearTimeout(readingTimeout.current);
    };
  }, [onTagRead]);

  return null; // No visible UI needed for fast processing
}