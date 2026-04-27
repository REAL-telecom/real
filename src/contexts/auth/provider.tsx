import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getServerTimeOffset, setServerTimeOffset } from '@utils';
import { getAuthFlowSnapshot, setAuthFlowSnapshot } from './storage';
import { type Phone, type StoredAuthFlowSnapshot } from './types';

type AuthContextProps = {
  isSnapshotLoaded: boolean;
  storedPhoneNumber: string | null;
  setStoredPhoneNumber: (phone: string | null) => void;
  clientRateLimitExpiresAt: number | null;
  setClientRateLimitExpiresAt: (expiresAt: number | null) => void;
  phones: Phone[];
  addPhone: (phone: string) => void;
  setPhoneResendTimeout: (phone: string, expiresAt: number) => void;
  clearPhoneResendTimeout: (phone: string) => void;
};

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSnapshotLoaded, setIsSnapshotLoaded] = useState(false);
  const [storedPhoneNumber, setStoredPhoneNumber] = useState<string | null>(null);
  const [clientRateLimitExpiresAt, setClientRateLimitExpiresAt] = useState<
    number | null
  >(null);
  const [phones, setPhones] = useState<Phone[]>([]);

  // Загрузка snapshot при монтировании компонента
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      let snapshot: StoredAuthFlowSnapshot = null;
      try {
        snapshot = await getAuthFlowSnapshot();
      } catch {
        snapshot = null;
      }

      if (cancelled) return;

      if (snapshot) {
        setPhones(snapshot.phones ?? []);
        setStoredPhoneNumber(snapshot.storedPhoneNumber ?? null);
        setClientRateLimitExpiresAt(snapshot.clientRateLimitExpiresAt ?? null);
        setServerTimeOffset(snapshot.serverTimeOffset ?? 0);
      }

      setIsSnapshotLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Обновление хранилища при изменении состояния
  useEffect(() => {
    if (!isSnapshotLoaded) return;

    void setAuthFlowSnapshot({
      storedPhoneNumber, 
      clientRateLimitExpiresAt,
      phones,
      serverTimeOffset: getServerTimeOffset(),
    });
  }, [isSnapshotLoaded, storedPhoneNumber, clientRateLimitExpiresAt, phones]);

  // Если активен глобальный rate limit — очищаем все таймауты у номеров.
  // Иначе при перезагрузке приложения могут одновременно отображаться
  // и глобальная блокировка, и таймаут на повторную отправку.
  useEffect(() => {
    if (!isSnapshotLoaded) return;
    if (!clientRateLimitExpiresAt) return;
  
    setPhones(prev => prev.map(phone => ({ ...phone, resendTimeoutExpiresAt: null })));
  }, [isSnapshotLoaded, clientRateLimitExpiresAt]);

  const addPhone = (phone: string) => {
    if (phone.trim() === '') return;
    setPhones((prev) => {
      const existing = prev.find((item) => item.number === phone);
      if (existing) return prev;
      return [...prev, { number: phone, resendTimeoutExpiresAt: null }];
    });
  };

  const setPhoneResendTimeout = (targetPhone: string, expiresAt: number) => {
    if (targetPhone === '') return;
    setPhones((prev) => {
      const hasEntry = prev.some((item) => item.number === targetPhone);
      if (!hasEntry) {
        return [
          ...prev,
          {
            number: targetPhone,
            resendTimeoutExpiresAt: expiresAt,
          },
        ];
      }
      return prev.map((item) =>
        item.number === targetPhone
          ? { ...item, resendTimeoutExpiresAt: expiresAt }
          : item
      );
    });
  };

  const clearPhoneResendTimeout = (targetPhone: string) => {
    setPhones((prev) =>
      prev.map((item) =>
        item.number === targetPhone ? { ...item, resendTimeoutExpiresAt: null } : item
      )
    );
  };

  const value = useMemo(
    () => ({
      isSnapshotLoaded,
      storedPhoneNumber,
      setStoredPhoneNumber,
      clientRateLimitExpiresAt,
      setClientRateLimitExpiresAt,
      phones,
      addPhone,
      setPhoneResendTimeout,
      clearPhoneResendTimeout,
    }),
    [isSnapshotLoaded, storedPhoneNumber, clientRateLimitExpiresAt, phones]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
