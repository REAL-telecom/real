import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { useTheme } from '@hooks';
import { DigitCell } from '../digit-cell';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

type DigitInputLayoutItem =
  | { type: 'cells'; count: number }
  | { type: 'text'; value: string }
  | { type: 'locked'; value: string };

type DigitInputProps = {
  cellWidth: number;
  cellHeight: number;
  cellFontSize: number;
  cellGap?: number;
  cellMarginBlock?: number;
  cellMarginBlockStart?: number;
  cellMarginBlockEnd?: number;
  errorMarginBlock?: number;
  errorMarginBlockStart?: number;
  errorMarginBlockEnd?: number;
  errorMessage?: string;
  maxLength: number;
  submitAttempted?: boolean;
  layout?: DigitInputLayoutItem[];
  sanitize: (value: string) => string;
  onComplete?: (value: string) => void;
};

export function DigitInput({
  cellWidth,
  cellHeight,
  cellFontSize,
  cellGap,
  cellMarginBlock,
  cellMarginBlockStart,
  cellMarginBlockEnd,
  errorMarginBlock,
  errorMarginBlockStart,
  errorMarginBlockEnd,
  errorMessage,
  layout,
  maxLength,
  submitAttempted = false,
  sanitize,
  onComplete,
}: DigitInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(maxLength).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);
  const theme = useTheme();

  const resolvedLayout: DigitInputLayoutItem[] = layout ?? [
    { type: 'cells', count: maxLength },
  ];

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    inputsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      columnGap: cellGap ?? theme.gaps.two,
      marginBlockStart: cellMarginBlock ?? cellMarginBlockStart ?? theme.margins.two,
      marginBlockEnd: cellMarginBlock ?? cellMarginBlockEnd ?? theme.margins.none,
    },
    mask: {
      color: theme.colors.text,
      fontSize: cellFontSize,
      fontWeight: theme.fontWeights.bold,
      marginInlineStart: theme.margins.none,
      marginInlineEnd: theme.margins.none,
    },
    lockedCell: {
      width: cellWidth,
      height: cellHeight,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.thin,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadiuses.three,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },
    lockedEmpty: {
      borderColor: theme.colors.border,
      borderWidth: theme.borderWidths.thin,
    },
    lockedFilled: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.success,
      borderWidth: theme.borderWidths.medium,
    },
    lockedError: {
      borderColor: theme.colors.notification,
      borderWidth: theme.borderWidths.medium,
    },
    lockedText: {
      color: theme.colors.text,
      fontSize: cellFontSize,
      fontWeight: theme.fontWeights.bold,
    },
    error: {
      marginBlockStart: errorMarginBlock ?? errorMarginBlockStart ?? theme.margins.two,
      marginBlockEnd: errorMarginBlock ?? errorMarginBlockEnd ?? theme.margins.two,
    },
  });

  const isComplete = digits.every((digit) => digit !== '');
  const showError = submitAttempted && !isComplete;

  const normalizeDigits = (rawDigits: string[]) => {
    const normalized = sanitize(rawDigits.join(''));
    const next = [
      ...normalized.split(''),
      ...Array(maxLength - normalized.length).fill(''),
    ];
    return next.slice(0, maxLength);
  };

  const applyDigits = (next: string[]) => {
    const wasComplete = digits.every((d) => d !== '');
    const nowComplete = next.every((d) => d !== '');
    setDigits(next);
    if (nowComplete && !wasComplete && onComplete) onComplete(sanitize(next.join('')));
  };

  const focusFirstEmptyCell = (nextDigits: string[], startIndex: number) => {
    for (let i = Math.max(0, startIndex); i < maxLength; i += 1) {
      if (!nextDigits[i]) {
        inputs.current[i]?.focus();
        return;
      }
    }
    inputs.current[maxLength - 1]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const rawNext = [...digits];

    if (numeric.length > 1) {
      const pasted = sanitize(numeric).split('');
      for (let i = 0; i < pasted.length && index + i < maxLength; i += 1)
        rawNext[index + i] = pasted[i];
      const next = normalizeDigits(rawNext);
      applyDigits(rawNext);
      focusFirstEmptyCell(next, index);
      return;
    }

    rawNext[index] = numeric.slice(0, 1);
    const next = normalizeDigits(rawNext);
    applyDigits(next);

    if (numeric && index < maxLength - 1 && next[index]) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0)
      inputs.current[index - 1]?.focus();
  };

  const getState = (index: number): 'empty' | 'filled' | 'error' => {
    if (showError && !digits[index]) return 'error';
    return digits[index] ? 'filled' : 'empty';
  };

  const lockedState: 'empty' | 'filled' | 'error' = showError
    ? 'error'
    : isComplete
      ? 'filled'
      : 'empty';

  let currentIndex = 0;
  const items = resolvedLayout.map((item, itemIndex) => {
    if (item.type === 'text') {
      return (
        <Text key={`text-${itemIndex}-${item.value}`} style={styles.mask}>
          {item.value}
        </Text>
      );
    }

    if (item.type === 'locked') {
      return (
        <ThemedView
          key={`locked-${itemIndex}-${item.value}`}
          style={[
            styles.lockedCell,
            lockedState === 'filled' && styles.lockedFilled,
            lockedState === 'error' && styles.lockedError,
          ]}
        >
          <Text style={styles.lockedText}>{item.value}</Text>
        </ThemedView>
      );
    }

    const start = currentIndex;
    const count = Math.max(0, Math.min(item.count, maxLength - currentIndex));
    currentIndex += count;

    return Array.from({ length: count }).map((_, localIndex) => {
      const index = start + localIndex;
      return (
        <DigitCell
          key={`cell-${index}`}
          value={digits[index]}
          state={getState(index)}
          width={cellWidth}
          height={cellHeight}
          fontSize={cellFontSize}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(key) => handleKeyPress(key, index)}
          inputRef={(ref) => {
            inputs.current[index] = ref;
          }}
        />
      );
    });
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.inputsContainer}>{items}</ThemedView>
      <ThemedText type="errorSmall" style={styles.error}>
        {showError ? errorMessage : ' '}
      </ThemedText>
    </ThemedView>
  );
}
