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
    isIPBlocked,
    setIsIPBlocked,
    clientRateLimitExpiresAt,
    setClientRateLimitExpiresAt,
    storedPhoneNumber,
    setStoredPhoneNumber,
    phones,
    setPhonePinExpiresAt,
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
  const isRateLimited = (clientRateLimitExpiresAt ?? 0) > 0;
  const isResendBlocked = (currentPhone?.resendTimeoutExpiresAt ?? 0) > 0;
  const isPinInputDisabled =
    isRequestInProgress ||
    hasWrongPinError ||
    isCodeExpiredError ||
    isRateLimited ||
    isIPBlocked;

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

  const resetPinInputs = useCallback(() => {
    pinRef.current = '';
    setIsPinInputCompleted(false);
    setPinInputKey((prev) => prev + 1);
  }, []);

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

      if (!isRateLimited && !isIPBlocked) {
        resetPinInputs();
      }

      if (isCodeExpiredError) {
        router.replace('/auth/register-screen');
      }
    }, 5000);
    return () => clearTimeout(id);
  }, [
    errorMessage,
    isCodeExpiredError,
    isIPBlocked,
    isRateLimited,
    resetPinInputs,
    router,
  ]);

  const handleBack = useCallback(() => {
    router.replace('/auth/register-screen');
  }, [router, setStoredPhoneNumber]);

  const handleCountdownComplete = useCallback(() => {
    if (isRateLimited) {
      setClientRateLimitExpiresAt(null);
      resetPinInputs();
      return;
    }

    if (storedPhoneNumber) {
      clearPhoneResendTimeout(storedPhoneNumber);
    }
  }, [
    isRateLimited,
    storedPhoneNumber,
    resetPinInputs,
    setClientRateLimitExpiresAt,
    clearPhoneResendTimeout,
  ]);

  const handlePinInputComplete = useCallback((digits: string) => {
    pinRef.current = digits;
    setIsPinInputCompleted(true);
    setErrorMessage(' ');
  }, []);

  const handlePinChange = useCallback((value: string) => {
    pinRef.current = value;
    setIsPinInputCompleted(value.length === 5);
  }, []);

  const handleResend = useCallback(async () => {
    if (!storedPhoneNumber || isIPBlocked) return;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await requestAuthCode(storedPhoneNumber);
      if (!response.success) {
        if (response.blockExpiresAt) {
          setClientRateLimitExpiresAt(response.blockExpiresAt);
          return;
        }
        if (response.message === 'IP заблокирован') {
          setIsIPBlocked(true);
          clearPhoneResendTimeout(storedPhoneNumber);
          return;
        }
        setErrorMessage(response.message);
        return;
      }

      if (response.pinExpiresAt) {
        setPhonePinExpiresAt(storedPhoneNumber, response.pinExpiresAt);
      }

      if (response.nextRequestAvailableAt) {
        setPhoneResendTimeout(storedPhoneNumber, response.nextRequestAvailableAt);
      }

      setIsPinInputCompleted(false);
      pinRef.current = '';
    } catch {
      setErrorMessage('Не удалось отправить запрос');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [
    isIPBlocked,
    setIsIPBlocked,
    storedPhoneNumber,
    clearPhoneResendTimeout,
    setClientRateLimitExpiresAt,
    setPhonePinExpiresAt,
    setPhoneResendTimeout,
  ]);

  const handleVerify = useCallback(async () => {
    if (
      !isPinInputCompleted ||
      pinRef.current.length !== 5 ||
      !storedPhoneNumber ||
      isIPBlocked
    )
      return;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await verifyAuthCode(storedPhoneNumber, pinRef.current);
      if (!response.success) {
        if (response.blockExpiresAt) {
          setClientRateLimitExpiresAt(response.blockExpiresAt);
        } else if (response.message === 'IP заблокирован') {
          setIsIPBlocked(true);
          clearPhoneResendTimeout(storedPhoneNumber);
        } else {
          if (response.message === 'Код устарел') {
            setPhonePinExpiresAt(storedPhoneNumber, null);
          }
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
      setErrorMessage('Не удалось проверить код');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [
    isIPBlocked,
    setIsIPBlocked,
    isPinInputCompleted,
    router,
    storedPhoneNumber,
    clearPhoneResendTimeout,
    setClientRateLimitExpiresAt,
    setStoredPhoneNumber,
    setPhonePinExpiresAt,
  ]);

  const renderStatusContent = () => {
    if (isIPBlocked) {
      return (
        <Pressable onPress={() => router.push('/auth/support-screen')}>
          <ThemedText color="link" style={styles.centeredText}>
            Не могу войти
          </ThemedText>
        </Pressable>
      );
    }

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
        disabled={isIPBlocked || isRateLimited}
        onPress={handleBack}
        style={[
          styles.backButton,
          (isIPBlocked || isRateLimited) && styles.backButtonDisabled,
        ]}
      >
        <ThemedText color="link">{'< Назад'}</ThemedText>
      </Pressable>
      <Fieldset legend="Введите проверочный код">
        <PinInput
          key={pinInputKey}
          onChange={handlePinChange}
          onComplete={handlePinInputComplete}
          submitAttempted={hasErrorMessage}
          disabled={isPinInputDisabled}
        />
      </Fieldset>
      {renderStatusContent()}
      <Button
        disabled={
          isIPBlocked ||
          !isPinInputCompleted ||
          isRequestInProgress ||
          isRateLimited ||
          hasErrorMessage
        }
        loading={isRequestInProgress}
        onPress={handleVerify}
        text="Войти"
      />
    </>
  );
}
