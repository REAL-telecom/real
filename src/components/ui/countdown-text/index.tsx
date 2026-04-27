import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { useCountdown } from '@hooks';
import { getServerTimeOffset } from '@utils';
import { ThemedText, type ThemedTextProps } from '../themed-text';

type CountdownTextProps = {
  expires: number | null;
  children: ReactNode;
  onCountdownComplete?: () => void;
} & ThemedTextProps;

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});

export function CountdownText({
  expires,
  children,
  onCountdownComplete,
  ...textProps
}: CountdownTextProps) {
  const secondsLeft = useCountdown(expires);
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const prevExpiresRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevExpiresRef.current !== expires) {
      prevExpiresRef.current = expires;
      hasCompletedRef.current = false;
      hasStartedRef.current = false;
    }

    if (!onCountdownComplete || typeof expires !== 'number' || hasCompletedRef.current) return;

    const offset = getServerTimeOffset();
    const now = Math.floor((Date.now() + offset) / 1000);

    if (expires <= now) {
      hasCompletedRef.current = true;
      onCountdownComplete();
      return;
    }

    if (secondsLeft > 0) {
      hasStartedRef.current = true;
      return;
    }

    if (secondsLeft === 0 && hasStartedRef.current) {
      hasCompletedRef.current = true;
      onCountdownComplete();
    }
  }, [expires, secondsLeft, onCountdownComplete]);

  const formatTime = (totalSec: number): string => {
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <ThemedText {...textProps} style={styles.text}>
      {children} {formatTime(secondsLeft)}
    </ThemedText>
  );
}
