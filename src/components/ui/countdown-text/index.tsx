import { type ReactNode } from 'react';

import { useCountdown } from '@hooks';
import { ThemedText, type ThemedTextProps } from '../themed-text';

type CountdownTextProps = {
  expires: number | null;
  children: ReactNode;
} & ThemedTextProps;

export function CountdownText({ expires, children, ...textProps }: CountdownTextProps) {
  const secondsLeft = useCountdown(expires);

  const formatTime = (totalSec: number): string => {
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <ThemedText {...textProps}>
      {children} {formatTime(secondsLeft)}
    </ThemedText>
  );
}
