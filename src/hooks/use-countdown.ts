import { useEffect, useState } from 'react';

import { getServerTimeOffset } from '@utils';

export function useCountdown(expires: number | null): number {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expires) {
      setSecondsLeft(0);
      return;
    }

    const offset = getServerTimeOffset();
    const now = Math.floor((Date.now() + offset) / 1000);
    const left = Math.max(0, Math.ceil(expires - now));
    setSecondsLeft(left);

    if (left <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
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
