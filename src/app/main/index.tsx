import { StyleSheet } from 'react-native';

import { useTheme } from '@hooks/use-theme';
import { ThemedText } from '@ui/themed-text';
import { ThemedView } from '@ui/themed-view';

export default function MainScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.paddings.five,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Главная</ThemedText>
    </ThemedView>
  );
}
