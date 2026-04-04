import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

import { useDesignSystem } from '@hooks/use-design-system';

export default function TabLayout() {
  const designSystem = useDesignSystem();

  return (
    <ThemeProvider value={designSystem}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
