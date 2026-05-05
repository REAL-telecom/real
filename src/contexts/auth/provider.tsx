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
  isIPBlocked: boolean;
  setIsIPBlocked: (blocked: boolean) => void;
  clientRateLimitExpiresAt: number | null;
  setClientRateLimitExpiresAt: (expiresAt: number | null) => void;
  storedPhoneNumber: string | null;
  setStoredPhoneNumber: (phone: string | null) => void;
  phones: Phone[];
  addPhone: (phone: string) => void;
  setPhonePinExpiresAt: (phone: string, expiresAt: number | null) => void;
  setPhoneResendTimeout: (phone: string, expiresAt: number | null) => void;
  clearPhoneResendTimeout: (phone: string) => void;
};

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isIPBlocked, setIsIPBlocked] = useState(false);
  const [isSnapshotLoaded, setIsSnapshotLoaded] = useState(false);
  const [clientRateLimitExpiresAt, setClientRateLimitExpiresAt] = useState<number | null>(null);
  const [storedPhoneNumber, setStoredPhoneNumber] = useState<string | null>(null);
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
        setIsIPBlocked(snapshot.isIPBlocked ?? false);
        setClientRateLimitExpiresAt(snapshot.clientRateLimitExpiresAt ?? null);
        setStoredPhoneNumber(snapshot.storedPhoneNumber ?? null);
        setPhones(snapshot.phones ?? []);
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
      isIPBlocked,
      clientRateLimitExpiresAt,
      storedPhoneNumber,
      phones,
      serverTimeOffset: getServerTimeOffset(),
    });
  }, [
    isSnapshotLoaded,
    isIPBlocked,
    clientRateLimitExpiresAt,
    storedPhoneNumber,
    phones,
  ]);

  // Если активен глобальный rate limit — очищаем все таймауты у номеров.
  // Иначе при перезагрузке приложения могут одновременно отображаться
  // и глобальная блокировка, и таймаут на повторную отправку.
  useEffect(() => {
    if (!isSnapshotLoaded) return;
    if (!clientRateLimitExpiresAt) return;

    setPhones((prev) =>
      prev.map((phone) => ({ ...phone, resendTimeoutExpiresAt: null }))
    );
  }, [isSnapshotLoaded, clientRateLimitExpiresAt]);

  const addPhone = (phone: string) => {
    setPhones((prev) => {
      const isPhoneExist = prev.some((item) => item.number === phone);
      if (isPhoneExist) return prev;
      return [
        ...prev,
        { number: phone, resendTimeoutExpiresAt: null, pinExpiresAt: null },
      ];
    });
  };

  const setPhonePinExpiresAt = (targetPhone: string, expiresAt: number | null) => {
    setPhones((prev) =>
      prev.map((item) =>
        item.number === targetPhone ? { ...item, pinExpiresAt: expiresAt } : item
      )
    );
  };

  const setPhoneResendTimeout = (targetPhone: string, expiresAt: number | null) => {
    setPhones((prev) => {
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
      isIPBlocked,
      setIsIPBlocked,
      storedPhoneNumber,
      setStoredPhoneNumber,
      clientRateLimitExpiresAt,
      setClientRateLimitExpiresAt,
      phones,
      addPhone,
      setPhonePinExpiresAt,
      setPhoneResendTimeout,
      clearPhoneResendTimeout,
    }),
    [isSnapshotLoaded, isIPBlocked, storedPhoneNumber, clientRateLimitExpiresAt, phones]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
