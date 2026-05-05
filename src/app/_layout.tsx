import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { UserProvider, useUser } from '@contexts';
import { useDesignSystem } from '@hooks';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { isUserLoaded } = useUser();
  
  useEffect(() => {
    if (isUserLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isUserLoaded]);
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const designSystem = useDesignSystem();

  return (
    <ThemeProvider value={designSystem}>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </ThemeProvider>
  );
}
