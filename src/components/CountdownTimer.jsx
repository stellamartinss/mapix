import { useEffect, useState, useRef } from 'react';

export default function CountdownTimer({ duration, onTimeout, isActive }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeoutRef = useRef(onTimeout);
  const isActiveRef = useRef(isActive);

  // Keep refs updated
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeoutRef.current) {
            onTimeoutRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, isActive]);

  if (!isActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 30;
  const isDanger = timeLeft <= 10;

  return (
    <div
      className={`px-4 py-2 rounded-lg font-mono text-lg font-bold transition-colors ${
        isDanger
          ? 'bg-red-500 text-white animate-pulse'
          : isWarning
          ? 'bg-yellow-500 text-white'
          : 'bg-blue-500 text-white'
      }`}
    >
      ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
