import { useTheme } from '@hooks';
import { DigitInput } from '@ui';
import { sanitizePin } from '@utils';

interface PinInputProps {
  onComplete?: (value: string) => void;
  submitAttempted?: boolean;
  disabled?: boolean;
}

export function PinInput({ onComplete, submitAttempted, disabled }: PinInputProps) {
  const theme = useTheme();

  return (
    <DigitInput
      cellWidth={50}
      cellHeight={60}
      cellFontSize={theme.fontSizes.six}
      cellGap={5}
      maxLength={5}
      errorMessage="Код задан неверно"
      submitAttempted={submitAttempted}
      disabled={disabled}
      sanitize={sanitizePin}
      onComplete={onComplete}
    />
  );
}
