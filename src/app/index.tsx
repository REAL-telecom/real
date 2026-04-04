import { Redirect } from 'expo-router';

import { useAppSession } from '@session';

export default function IndexScreen() {
  const { sessionStatus, phone } = useAppSession();

  if (sessionStatus === 'loading') return null;

  if (phone) return <Redirect href="/main" />;

  return <Redirect href="/auth/register-screen" />;
}
