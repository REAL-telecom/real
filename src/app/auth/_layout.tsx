import { Slot, usePathname } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@contexts';
import { useTheme } from '@hooks';
import { Preloader, ThemedText, ThemedView } from '@ui';

type ScreenContent = {
  title: string;
  subtitle: string;
  policy?: string;
};

type ScreenType = 'register' | 'verify';

function getScreenContent(screen: ScreenType, phone: string): ScreenContent {
  if (screen === 'register') {
    return {
      title: 'Добро пожаловать!',
      subtitle: 'Для продолжения необходимо зарегистрироваться',
      policy: 'Нажимая на кнопку вы соглашаетесь политикой конфиденциальности',
    };
  }

  return {
    title: 'Авторизация',
    subtitle: `Мы позвоним на номер ${phone} и продиктуем 5-значный код.`,
  };
}

export default function AuthLayout() {
  const pathname = usePathname();
  const screenType = pathname.includes('verify-screen') ? 'verify' : 'register';

  return (
    <AuthProvider>
      <AuthLayoutBody type={screenType} />
    </AuthProvider>
  );
}

function AuthLayoutBody({ type }: { type: ScreenType }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { phone, isSnapshotLoaded } = useAuth();
  const content = getScreenContent(type, phone);

  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      gap: theme.gaps.three,
      paddingInline: theme.paddings.five,
      paddingBlockStart: insets.top,
      paddingBlockEnd: Math.max(insets.bottom, theme.paddings.five),
    },
    header: {
      alignItems: 'center',
      gap: theme.gaps.three,
      marginBlockEnd: theme.margins.five,
    },
    subtitle: {
      textAlign: 'center',
      opacity: 0.8,
    },
    policy: {
      textAlign: 'center',
    },
  });

  if (!isSnapshotLoaded) {
    return (
      <ThemedView style={styles.root}>
        <Preloader text="Загрузка..." />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.header}>
            <ThemedText type="title">{content.title}</ThemedText>
            <ThemedText style={styles.subtitle}>{content.subtitle}</ThemedText>
          </ThemedView>
          <Slot />
          {content.policy && (
            <ThemedText type="smallBold" style={styles.policy}>
              {content.policy}
            </ThemedText>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
