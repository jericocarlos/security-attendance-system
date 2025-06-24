import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function useCurrentUtcTime() {
  const [currentTime, setCurrentTime] = useState(dayjs().utc());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().utc());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}