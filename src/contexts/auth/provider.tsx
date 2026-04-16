import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { getAuthFlowSnapshot, setAuthFlowSnapshot } from './storage';
import { type LockReason, type StoredAuthFlowSnapshot } from './types';

type AuthContextProps = {
  isSnapshotLoaded: boolean;
  isLocked: LockReason;
  setIsLocked: (isLocked: LockReason) => void;
  lockExpires: number | null;
  setLockExpires: (expires: number) => void;
  phone: string;
  setPhone: (phone: string) => void;
};

const AuthContext = createContext<AuthContextProps | null>(null);

function getSecondsToUnlock(expires: number | null): number {
  if (!expires) return 0;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expires - now);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSnapshotLoaded, setIsSnapshotLoaded] = useState(false);
  const [isLocked, setIsLocked] = useState<LockReason>(null);
  const [lockExpires, setLockExpires] = useState<number | null>(null);
  const [phone, setPhone] = useState<string>('');

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
        setPhone(snapshot.phone ?? '');
        const now = Math.floor(Date.now() / 1000);
        if (lockExpires && lockExpires < now) {
          setIsLocked(snapshot.isLocked);
          setLockExpires(snapshot.lockExpires);
        }
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
    void setAuthFlowSnapshot({ phone, isLocked, lockExpires });
  }, [phone, isLocked, lockExpires]);

  // Сброс просроченной блокировки
  useEffect(() => {
    if (!lockExpires) return;
    const now = Math.floor(Date.now() / 1000);
    if (lockExpires <= now) {
      setIsLocked(null);
      setLockExpires(null);
    }
  }, [lockExpires]);

  const value = useMemo(
    () => ({
      phone,
      setPhone,
      isLocked,
      lockExpires,
      setIsLocked,
      setLockExpires,
      isSnapshotLoaded,
    }),
    [phone, isLocked, lockExpires, isSnapshotLoaded]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
