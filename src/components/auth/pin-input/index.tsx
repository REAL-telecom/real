import { useTheme } from '@hooks/use-theme';
import { DigitInput } from '@ui/digit-input';
import { sanitizePin } from '@utils/sanitizers';

interface PinInputProps {
  onComplete?: (value: string) => void;
  submitAttempted?: boolean;
}

export function PinInput({ onComplete, submitAttempted }: PinInputProps) {
  const theme = useTheme();

  return (
    <DigitInput
      cellWidth={50}
      cellHeight={60}
      cellFontSize={theme.fontSizes.six}
      cellGap={5}
      maxLength={5}
      errorMessage="Код задан неверно"
      errorLineHeight={theme.lineHeights.five}
      errorMarginBottom={theme.margins.one}
      submitAttempted={submitAttempted}
      sanitize={sanitizePin}
      onComplete={onComplete}
    />
  );
}
