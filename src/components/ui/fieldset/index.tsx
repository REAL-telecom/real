import { StyleSheet } from 'react-native';

import { useTheme } from '@hooks';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

type FieldsetProps = {
  children: React.ReactNode;
  legend?: string;
  fieldsetBorderColor?: string;
  fieldsetBorderRadius?: number;
  fieldsetBorderWidth?: number;
  fieldsetPaddingBlock?: number;
  fieldsetPaddingBlockStart?: number;
  fieldsetPaddingBlockEnd?: number;
  fieldsetPaddingInline?: number;
  fieldsetPaddingInlineEnd?: number;
  fieldsetPaddingInlineStart?: number;
  legendInsetBlockStart?: number;
  legendInsetInlineStart?: number;
  legendPaddingInline?: number;
};

export function Fieldset({
  children,
  fieldsetBorderColor,
  fieldsetBorderRadius,
  fieldsetBorderWidth,
  fieldsetPaddingBlock,
  fieldsetPaddingBlockStart,
  fieldsetPaddingBlockEnd,
  fieldsetPaddingInline,
  fieldsetPaddingInlineEnd,
  fieldsetPaddingInlineStart,
  legend,
  legendInsetBlockStart,
  legendInsetInlineStart,
  legendPaddingInline,
}: FieldsetProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    fieldset: {
      width: '100%',
      borderWidth: fieldsetBorderWidth ?? theme.borderWidths.thin,
      borderColor: fieldsetBorderColor ?? theme.colors.fieldsetBorder,
      borderRadius: fieldsetBorderRadius ?? theme.borderRadiuses.three,
      paddingBlockStart:
        fieldsetPaddingBlock ?? fieldsetPaddingBlockStart ?? theme.paddings.six,
      paddingBlockEnd:
        fieldsetPaddingBlock ?? fieldsetPaddingBlockEnd ?? theme.paddings.none,
      paddingInline:
        fieldsetPaddingInline ?? fieldsetPaddingInlineEnd ?? theme.paddings.none,
      paddingInlineStart:
        fieldsetPaddingInline ?? fieldsetPaddingInlineStart ?? theme.paddings.none,
    },
    legendContainer: {
      position: 'absolute',
      insetBlockStart: legendInsetBlockStart ?? -theme.margins.three,
      insetInlineStart: legendInsetInlineStart ?? theme.margins.five,
      paddingInline: legend
        ? (legendPaddingInline ?? theme.paddings.one)
        : theme.paddings.none,
    },
  });

  return (
    <ThemedView style={styles.fieldset}>
      <ThemedView type="light" style={styles.legendContainer}>
        <ThemedText type="default">{legend}</ThemedText>
      </ThemedView>
      {children}
    </ThemedView>
  );
}
