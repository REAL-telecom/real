import { ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '@hooks';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';

type PreloaderProps = {
  text?: string;
};

export function Preloader ({ text }: PreloaderProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.gaps.three,
      paddingInline: theme.paddings.five,
    },
    indicator: {
      color: theme.colors.link,
    },
  });
  
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.link} />
      {text && <ThemedText type="small">{text}</ThemedText>}
    </ThemedView>
  );
}
