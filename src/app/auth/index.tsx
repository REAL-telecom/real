import { Redirect } from 'expo-router';

import { useAuth } from '@contexts';
import { getServerTimeOffset } from '@utils';
import { Preloader } from '@ui';

export default function AuthIndexScreen() {
  const { isSnapshotLoaded, storedPhoneNumber, phones } = useAuth();

  if (!isSnapshotLoaded) {
    return <Preloader text="Загрузка..." />;
  }

  const currentPhone = storedPhoneNumber
    ? phones.find((item) => item.number === storedPhoneNumber)
    : undefined;
  const pinExpiresAt = currentPhone?.pinExpiresAt ?? null;
  const nowSec = Math.floor((Date.now() + getServerTimeOffset()) / 1000);
  const hasActivePin = pinExpiresAt != null && pinExpiresAt > nowSec;

  if (storedPhoneNumber && hasActivePin) {
    return <Redirect href="/auth/verify-screen" />;
  }

  return <Redirect href="/auth/register-screen" />;
}
