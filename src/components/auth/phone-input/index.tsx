import { useTheme } from '@hooks';
import { DigitInput } from '@ui';
import { sanitizePhone } from '@utils';

type PhoneInputProps = {
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
