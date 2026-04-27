import { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@hooks';
import { ThemedText } from '../themed-text';

type ButtonProps = {
  backgroundColor?: string;
  borderRadius?: number;
  marginBlock?: number;
  marginBlockStart?: number;
  marginBlockEnd?: number;
  marginInline?: number;
  marginInlineStart?: number;
  marginInlineEnd?: number;
  paddingBlock?: number;
  paddingBlockStart?: number;
  paddingBlockEnd?: number;
  paddingInline?: number;
  paddingInlineStart?: number;
  paddingInlineEnd?: number;
  disabled?: boolean;
  loading?: boolean;
  text?: string;
  children?: ReactNode;
  width?: number;
  onPress?: () => void;
};

export function Button({
  disabled = false,
  loading = false,
  backgroundColor,
  borderRadius,
  marginBlock,
  marginBlockStart,
  marginBlockEnd,
  marginInline,
  marginInlineStart,
  marginInlineEnd,
  paddingBlock,
  paddingBlockStart,
  paddingBlockEnd,
  paddingInline,
  paddingInlineStart,
  paddingInlineEnd,
  text,
  children,
  width,
  onPress,
}: ButtonProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    button: {
      width: width ?? '100%',
      alignItems: 'center',
      backgroundColor: backgroundColor ?? theme.colors.primary,
      borderRadius: borderRadius ?? theme.borderRadiuses.three,
      marginBlockStart: marginBlock ?? marginBlockStart ?? theme.margins.none,
      marginBlockEnd: marginBlock ?? marginBlockEnd ?? theme.margins.none,
      marginInlineStart: marginInline ?? marginInlineStart ?? theme.margins.none,
      marginInlineEnd: marginInline ?? marginInlineEnd ?? theme.margins.none,
      paddingBlockStart: paddingBlock ?? paddingBlockStart ?? theme.paddings.three,
      paddingBlockEnd: paddingBlock ?? paddingBlockEnd ?? theme.paddings.three,
      paddingInlineStart: paddingInline ?? paddingInlineStart ?? theme.paddings.none,
      paddingInlineEnd: paddingInline ?? paddingInlineEnd ?? theme.paddings.none,
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    loader: {
      marginBlockStart: theme.margins.none,
      marginBlockEnd: theme.margins.none,
    },
  });

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.textInverted} style={styles.loader} />
      ) : children ? (
        children
      ) : (
        <ThemedText type="defaultBold" style={{ color: theme.colors.textInverted }}>
          {text}
        </ThemedText>
      )}
    </Pressable>
  );
}
