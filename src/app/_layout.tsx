import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';

import { useDesignSystem } from '@hooks/use-design-system';
import { AppSessionProvider } from '@session';

export default function RootLayout() {
  const designSystem = useDesignSystem();

  return (
    <ThemeProvider value={designSystem}>
      <AppSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AppSessionProvider>
    </ThemeProvider>
  );
}
