import { useTheme } from '@hooks';
import { DigitInput } from '@ui';
import { sanitizePhone } from '@utils';

type PhoneInputProps = {
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  submitAttempted?: boolean;
  initialValue?: string;
  disabled?: boolean;
};

export function PhoneInput({
  onChange,
  onComplete,
  submitAttempted,
  initialValue,
  disabled,
}: PhoneInputProps) {
  const theme = useTheme();

  return (
    <DigitInput
      cellWidth={20}
      cellHeight={60}
      cellFontSize={theme.fontSizes.four}
      cellGap={theme.gaps.half}
      errorMessage="Номер задан неверно"
      maxLength={10}
      submitAttempted={submitAttempted}
      initialValue={initialValue}
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
      onChange={onChange}
      onComplete={onComplete}
      disabled={disabled}
    />
  );
}
