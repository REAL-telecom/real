import { Redirect } from 'expo-router';

import { useUser } from '@contexts';

export default function IndexScreen() {
  const { isUserLoaded, user } = useUser();

  if (!isUserLoaded) return null;

  if (user) return <Redirect href="/main" />;

  return <Redirect href="/auth" />;
}
