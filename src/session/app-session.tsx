import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearPhone, loadPhone, savePhone } from './persisted-phone';

type AppSessionContextProps = {
  phone: string | null;
  sessionStatus: SessionStatus;
  clearSession: () => Promise<void>;
};

type SessionStatus = 'loading' | 'ready';

const AppSessionContext = createContext<AppSessionContextProps | null>(null);

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadPhone();
      if (!cancelled) {
        setPhone(stored);
        setSessionStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearSession = useCallback(async () => {
    await clearPhone();
    setPhone(null);
  }, []);

  const value = useMemo(
    () => ({
      phone,
      sessionStatus,
      clearSession,
    }),
    [phone, sessionStatus, clearSession],
  );

  return (
    <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>
  );
}

export function useAppSession(): AppSessionContextProps {
  const ctx = useContext(AppSessionContext);
  if (!ctx) throw new Error('useAppSession must be used within AppSessionProvider');
  return ctx;
}
