import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getUser } from './storage';

import type { StoredUser, User } from './types';

type UserContextProps = {
  user: User | null;
  isUserLoaded: boolean;
};

const UserContext = createContext<UserContextProps | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let stored: StoredUser = null;
      try {
        stored = await getUser();
      } catch {
        stored = null;
      }

      if (!cancelled) {
        setUser(stored ?? null);
        setIsUserLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isUserLoaded,
    }),
    [user, isUserLoaded]
  );

  return <UserContext value={value}>{children}</UserContext>;
}

export function useUser(): UserContextProps {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
