import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@contexts';
import { useTheme } from '@hooks';
import { Button, ThemedText } from '@ui';

export default function AuthSupportScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { setIsIPBlocked } = useAuth();

  const styles = StyleSheet.create({
    root: {
      gap: theme.gaps.three,
    },
    centered: {
      textAlign: 'center',
      opacity: 0.85,
    },
  });

  const handleRetry = () => {
    setIsIPBlocked(false);
    router.back();
  };

  return (
    <View style={styles.root}>
      <ThemedText style={styles.centered}>
        В целях разработки кнопка ниже сбрасывает только локальное состояние. 
        Блокировку на сервере приложение снять не может.
        При необходимости обратитесь к администратору.
      </ThemedText>
      <Button onPress={handleRetry} text="Попробовать снова" />
    </View>
  );
}
