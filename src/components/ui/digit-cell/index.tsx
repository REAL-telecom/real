import { StyleSheet, TextInput } from 'react-native';

import { useTheme } from '@hooks/use-theme';

type DigitCellState = 'empty' | 'filled' | 'error';

type DigitCellProps = {
  value: string;
  state: DigitCellState;
  width: number;
  height: number;
  fontSize: number;
  onChangeText: (text: string) => void;
  onKeyPress: (key: string) => void;
  inputRef: (ref: TextInput | null) => void;
};

export function DigitCell({
  value,
  state,
  width,
  height,
  fontSize,
  onChangeText,
  onKeyPress,
  inputRef,
}: DigitCellProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    input: {
      width,
      height,
      color: theme.colors.text,
      fontSize,
      fontWeight: theme.fontWeights.bold,
      textAlign: 'center',
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.fieldsetBorder,
      borderRadius: theme.borderRadiuses.three,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
      padding: 0,

    },
    empty: {
      borderColor: theme.colors.border,
      borderWidth: theme.borderWidths.thin,
    },
    filled: {
      borderColor: theme.colors.success,
      borderWidth: theme.borderWidths.medium,
    },
    error: {
      borderColor: theme.colors.notification,
      borderWidth: theme.borderWidths.medium,
    },
  });

  return (
    <TextInput
      ref={inputRef}
      style={[
        styles.input,
        state === 'empty' && styles.empty,
        state === 'filled' && styles.filled,
        state === 'error' && styles.error,
      ]}
      value={value}
      onChangeText={onChangeText}
      onKeyPress={(e) => onKeyPress(e.nativeEvent.key)}
      keyboardType="number-pad"
      maxLength={1}
      selectTextOnFocus
    />
  );
}
