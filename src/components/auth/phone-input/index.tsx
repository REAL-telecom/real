import { useTheme } from '@hooks/use-theme';
import { DigitInput } from '@ui/digit-input';
import { sanitizePhone } from '@utils/sanitizers';

interface PhoneInputProps {
  onComplete?: (value: string) => void;
  submitAttempted?: boolean;
}

export function PhoneInput({ onComplete, submitAttempted }: PhoneInputProps) {
  const theme = useTheme();
  
  return (
    <DigitInput
      cellWidth={20}
      cellHeight={40}
      cellFontSize={theme.fontSizes.four}
      cellGap={theme.gaps.half}
      errorMessage="Номер задан неверно"
      errorLineHeight={theme.lineHeights.five}
      maxLength={10}
      submitAttempted={submitAttempted}
      layout={[
        { type: 'locked', value: '8' },
        { type: 'text', value: '(' },
        { type: 'cells', count: 3 },
        { type: 'text', value: ')' },
        { type: 'cells', count: 3 },
        { type: 'text', value: '-' },
        { type: 'cells', count: 2 },
        { type: 'text', value: '-' },
        { type: 'cells', count: 2 },
      ]}
      sanitize={sanitizePhone}
      onComplete={onComplete}
    />
  );
}
