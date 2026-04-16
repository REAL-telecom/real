import { useEffect, useState } from 'react';

function getSecondsLeft(expires: number | null): number {
  if (!expires) return 0;
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, Math.ceil(expires - now));
}

export function useCountdown(expires: number | null): number {
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(expires));

  useEffect(() => {
    if (!expires) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expires]);

  return secondsLeft;
}