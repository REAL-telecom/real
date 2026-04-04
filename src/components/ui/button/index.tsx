import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@hooks/use-theme';
import { ThemedText } from '@ui/themed-text';

type ButtonProps = {
  disabled?: boolean;
  text: string;
  width?: number;
  onPress?: () => void;
};

export function Button({ text, disabled = false, width, onPress }: ButtonProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    button: {
      width: width ?? '100%',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadiuses.three,
      marginTop: theme.margins.two,
      paddingVertical: theme.paddings.three,
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <ThemedText type="defaultBold" style={{ color: theme.colors.textInverted }}>
        {text}
      </ThemedText>
    </Pressable>
  );
}
