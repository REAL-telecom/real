import { Slot, useGlobalSearchParams, usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useTheme } from '@hooks/use-theme';
import { ThemedText } from '@ui/themed-text';
import { ThemedView } from '@ui/themed-view';

type AuthCopy = {
  title: string;
  subtitle: string;
  policy?: string;
};

function getAuthCopy(pathname: string, phone?: string): AuthCopy {
  if (pathname.endsWith('/verify-screen')) {
    return {
      title: 'Авторизация',
      subtitle: `Мы позвоним на номер ${phone ?? '+7'} и продиктуем 5-значный код.`,
    };
  }

  return {
    title: 'Добро пожаловать!',
    subtitle: 'Для продолжения необходимо зарегистрироваться',
    policy: 'Нажимая на кнопку вы соглашаетесь политикой конфиденциальности',
  };
}

export default function AuthLayout() {
  const theme = useTheme();
  const pathname = usePathname();
  const { phone } = useGlobalSearchParams<{ phone?: string }>();
  const copy = getAuthCopy(pathname, phone);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: theme.gaps.three,
      justifyContent: 'center',
      paddingHorizontal: theme.paddings.five,
    },
    header: {
      alignItems: 'center',
      gap: theme.gaps.three,
      marginBottom: theme.margins.five,
    },
    subtitle: {
      textAlign: 'center',
      opacity: 0.8,
    },
    policy: {
      textAlign: 'center',
    }
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{copy.title}</ThemedText>
        <ThemedText style={styles.subtitle}>{copy.subtitle}</ThemedText>
      </ThemedView>
      <Slot />
      {copy.policy ? (
        <ThemedText type="smallBold" style={styles.policy}>
          {copy.policy}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}
