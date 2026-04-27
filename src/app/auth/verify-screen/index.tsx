import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { requestAuthCode, verifyAuthCode } from '@api/auth';
import { PinInput } from '@components';
import { setUser, useAuth } from '@contexts';
import { useTheme } from '@hooks';
import { Button, CountdownText, Fieldset, ThemedText } from '@ui';

export default function VerifyCodeScreen() {
  const {
    isSnapshotLoaded,
    clientRateLimitExpiresAt,
    setClientRateLimitExpiresAt,
    storedPhoneNumber,
    setStoredPhoneNumber,
    phones,
    addPhone,
    setPhoneResendTimeout,
    clearPhoneResendTimeout,
  } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // Текущий номер — берем из контекста (явно установлен на экране регистрации)
  const currentPhone = phones.find((item) => item.number === storedPhoneNumber) ?? null;

  const [errorMessage, setErrorMessage] = useState<string>(' ');
  const [isPinInputCompleted, setIsPinInputCompleted] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [pinInputKey, setPinInputKey] = useState(0);

  const pinRef = useRef('');

  const hasErrorMessage = errorMessage !== ' ';
  const hasWrongPinError = errorMessage === 'Неверный пин';
  const isCodeExpiredError = errorMessage === 'Код устарел';
  const isPinInputDisabled = isRequestInProgress || hasWrongPinError || isCodeExpiredError;
  const isRateLimited = (clientRateLimitExpiresAt ?? 0) > 0;
  const isResendBlocked = (currentPhone?.resendTimeoutExpiresAt ?? 0) > 0;

  const styles = StyleSheet.create({
    centeredText: {
      textAlign: 'center',
    },
    backButton: {
      position: 'absolute',
      top: theme.margins.seven,
      left: theme.margins.four,
      zIndex: 10,
      paddingBlock: theme.paddings.one,
      paddingInline: theme.paddings.one,
    },
    backButtonDisabled: {
      opacity: 0.4,
    },
  });

  // Проверка: есть ли номер для верификации
  useEffect(() => {
    if (!isSnapshotLoaded) return;
    if (!storedPhoneNumber) {
      router.replace('/auth/register-screen');
    }
  }, [isSnapshotLoaded, router, storedPhoneNumber]);

  // Очистка ошибки через 5 секунд
  useEffect(() => {
    if (errorMessage === ' ') return;
    const id = setTimeout(() => {
      setErrorMessage(' ');
      pinRef.current = '';
      setIsPinInputCompleted(false);
      setPinInputKey((prev) => prev + 1);

      if (isCodeExpiredError) {
        router.replace('/auth/register-screen');
      }
    }, 5000);
    return () => clearTimeout(id);
  }, [errorMessage, router]);

  const handleBack = useCallback(() => {
    router.replace('/auth/register-screen');
  }, [router, setStoredPhoneNumber]);

  const handleCountdownComplete = useCallback(() => {
    if (isRateLimited) {
      setClientRateLimitExpiresAt(null);
      return;
    }
    if (storedPhoneNumber) {
      clearPhoneResendTimeout(storedPhoneNumber);
    }
  }, [
    clearPhoneResendTimeout,
    storedPhoneNumber,
    isRateLimited,
    setClientRateLimitExpiresAt,
  ]);

  const handlePinInputComplete = useCallback((digits: string) => {
    pinRef.current = digits;
    setIsPinInputCompleted(true);
    setErrorMessage(' ');
  }, []);

  const handleResend = useCallback(async () => {
    if (!storedPhoneNumber) return;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await requestAuthCode(storedPhoneNumber);
      if (!response.success) {
        if (response.blockExpiresAt) {
          setClientRateLimitExpiresAt(response.blockExpiresAt);
          return;
        }
        if (response.message === 'Код устарел') {
          setErrorMessage(response.message);
          return;
        }
        setErrorMessage(response.message);
        return;
      }

      if (response.nextRequestAvailableAt) {
        addPhone(storedPhoneNumber);
        setPhoneResendTimeout(storedPhoneNumber, response.nextRequestAvailableAt);
      }

      setIsPinInputCompleted(false);
      pinRef.current = '';
    } catch {
      setErrorMessage('Не удалось запросить повторный звонок');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [setClientRateLimitExpiresAt, storedPhoneNumber, addPhone, setPhoneResendTimeout]);

  const handleVerify = useCallback(async () => {
    if (!isPinInputCompleted || !storedPhoneNumber) return;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await verifyAuthCode(storedPhoneNumber, pinRef.current);
      if (!response.success) {
        if (response.blockExpiresAt) {
          setClientRateLimitExpiresAt(response.blockExpiresAt);
        } else {
          setErrorMessage(response.message);
        }
        return;
      }

      if (!response.user) {
        setErrorMessage('Профиль пользователя не получен');
        return;
      }

      await setUser(response.user);
      setStoredPhoneNumber(null);
      router.replace('/main');
    } catch {
      setErrorMessage('Не удалось выполнить проверку кода');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [
    isPinInputCompleted,
    router,
    setClientRateLimitExpiresAt,
    storedPhoneNumber,
    setStoredPhoneNumber,
  ]);

  const renderStatusContent = () => {
    if (hasErrorMessage) {
      return (
        <ThemedText color="notification" style={styles.centeredText}>
          {errorMessage}
        </ThemedText>
      );
    }

    if (isRateLimited) {
      return (
        <CountdownText
          color="notification"
          expires={clientRateLimitExpiresAt}
          onCountdownComplete={handleCountdownComplete}
        >
          Превышен лимит запросов
        </CountdownText>
      );
    }

    if (isResendBlocked) {
      return (
        <CountdownText
          expires={currentPhone?.resendTimeoutExpiresAt ?? null}
          onCountdownComplete={handleCountdownComplete}
        >
          Запросить повторно через
        </CountdownText>
      );
    }

    return (
      <Pressable disabled={isRequestInProgress} onPress={handleResend}>
        <ThemedText color="link" style={styles.centeredText}>
          Запросить повторно
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <>
      <Pressable
        disabled={isRateLimited}
        onPress={handleBack}
        style={[styles.backButton, isRateLimited && styles.backButtonDisabled]}
      >
        <ThemedText color="link">{'< Назад'}</ThemedText>
      </Pressable>
      <Fieldset legend="Введите проверочный код">
        <PinInput
          key={pinInputKey}
          onComplete={handlePinInputComplete}
          submitAttempted={hasErrorMessage}
          disabled={isPinInputDisabled}
        />
      </Fieldset>
      {renderStatusContent()}
      <Button
        disabled={
          !isPinInputCompleted || isRequestInProgress || isRateLimited || hasErrorMessage
        }
        loading={isRequestInProgress}
        onPress={handleVerify}
        text="Войти"
      />
    </>
  );
}
