import { StyleSheet } from 'react-native';

import { useTheme } from '@hooks';
import { ThemedText, ThemedView } from '@ui';

export default function MainScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingInlineStart: theme.paddings.five,
      paddingInlineEnd: theme.paddings.five,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Главная</ThemedText>
    </ThemedView>
  );
}
