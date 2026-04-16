import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { requestAuthCode, verifyAuthCode } from '@api/auth';
import { PinInput } from '@components';
import { useAuth, setUser } from '@contexts';
import { Button, CountdownText, Fieldset, ThemedText } from '@ui';

export default function VerifyCodeScreen() {
  const { isSnapshotLoaded, phone, isLocked, lockExpires, setIsLocked, setLockExpires } =
    useAuth();
  const router = useRouter();
  const [isPinInputCompleted, setIsPinInputCompleted] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(' ');

  const pinRef = useRef('');

  useEffect(() => {
    if (!isSnapshotLoaded) return;
    if (phone === '') {
      router.replace('/auth/register-screen');
    }
  }, [isSnapshotLoaded, phone, router]);

  const handlePinInputComplete = useCallback((digits: string) => {
    pinRef.current = digits;
    setIsPinInputCompleted(true);
    setErrorMessage(' ');
  }, []);

  const handleResend = useCallback(async () => {
    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await requestAuthCode(phone);
      if (!response.success) {
        setErrorMessage(response.message);
        if (response.blockExpiresAt) {
          setIsLocked('paused');
          setLockExpires(response.blockExpiresAt);
        }
        return;
      }

      if (response.nextRequestAvailableAt) {
        setIsLocked('timeout');
        setLockExpires(response.nextRequestAvailableAt);
      }
      setErrorMessage(' ');
      setIsPinInputCompleted(false);
      pinRef.current = '';
    } catch {
      setErrorMessage('Не удалось запросить повторный звонок');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [phone, setIsLocked, setLockExpires]);

  const handleVerify = useCallback(async () => {
    if (!isPinInputCompleted) return;
    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await verifyAuthCode(phone, pinRef.current);
      if (!response.success) {
        setErrorMessage(response.message);
        if (response.blockExpiresAt) {
          setIsLocked('paused');
          setLockExpires(response.blockExpiresAt);
        }
        return;
      }
      if (!response.user) {
        setErrorMessage('Профиль пользователя не получен');
        return;
      }

      await setUser(response.user);
      router.replace('/main');
    } catch {
      setErrorMessage('Не удалось выполнить проверку кода');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [isPinInputCompleted, phone, router, setIsLocked, setLockExpires]);

  const isVerifyBlocked = isLocked === 'paused';
  const isResendBlocked = isLocked === 'timeout';

  return (
    <>
      <Fieldset legend="Введите проверочный код">
        <PinInput onComplete={handlePinInputComplete} submitAttempted={errorMessage !== ' '} />
      </Fieldset>
      {errorMessage !== ' ' && (
        <ThemedText type="errorSmall">{errorMessage}</ThemedText>
      )}
      {isVerifyBlocked && lockExpires && (
        <CountdownText type="errorSmall" expires={lockExpires}>
          Превышен лимит попыток. Повторите через
        </CountdownText>
      )}
      {isResendBlocked && lockExpires && (
        <CountdownText type="small" expires={lockExpires}>
          Отправить повторно через
        </CountdownText>
      )}
      {!isResendBlocked && (
        <Pressable disabled={isRequestInProgress} onPress={handleResend}>
          <ThemedText type="link" style={{ textAlign: 'center' }}>
            Отправить повторно
          </ThemedText>
        </Pressable>
      )}
      <Button
        disabled={!isPinInputCompleted || isRequestInProgress || isVerifyBlocked}
        onPress={handleVerify}
        text="Войти"
      />
    </>
  );
}
