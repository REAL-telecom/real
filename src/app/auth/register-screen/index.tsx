import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { requestAuthCode } from '@api/auth';
import { PhoneInput } from '@components';
import { useAuth } from '@contexts';
import { Button, CountdownText, Fieldset, ThemedText } from '@ui';

export default function RegisterScreen() {
  const {
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
  } = useAuth();
  const router = useRouter();

  const [enteredPhoneNumber, setEnteredPhoneNumber] = useState<string>(
    storedPhoneNumber ?? ''
  );
  const [errorMessage, setErrorMessage] = useState<string>(' ');
  const [isPhoneInputCompleted, setIsPhoneInputCompleted] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [isPhoneEdited, setIsPhoneEdited] = useState(false);

  const phoneNumberRef = useRef('');

  const hasErrorMessage = errorMessage !== ' ';

  // Предзаполнение поля
  const initialPhoneDigits = useMemo(() => {
    const digits = storedPhoneNumber?.replace(/\D/g, '') ?? '';
    if (digits.length === 11 && digits.startsWith('7')) return digits.slice(1);
    if (digits.length === 10) return digits;
    return '';
  }, [storedPhoneNumber]);

  // Данные о номере: если пользователь редактирует — используем введённый, иначе сохранённый
  const currentPhoneNumber = isPhoneEdited
    ? enteredPhoneNumber
    : storedPhoneNumber || enteredPhoneNumber;
  const currentPhoneData = phones.find((item) => item.number === currentPhoneNumber);
  const isResendBlocked = (currentPhoneData?.resendTimeoutExpiresAt ?? 0) > 0;
  const isRateLimited = (clientRateLimitExpiresAt ?? 0) > 0;

  const styles = StyleSheet.create({
    centeredText: {
      textAlign: 'center',
    },
  });

  useEffect(() => {
    phoneNumberRef.current = initialPhoneDigits;
    setIsPhoneInputCompleted(initialPhoneDigits.length === 10);
    setEnteredPhoneNumber(
      initialPhoneDigits.length === 10 ? `+7${initialPhoneDigits}` : ''
    );
  }, [initialPhoneDigits]);

  // Очистка ошибки через 5 секунд
  useEffect(() => {
    if (errorMessage === ' ') return;
    const id = setTimeout(() => {
      setErrorMessage(' ');
    }, 5000);
    return () => clearTimeout(id);
  }, [errorMessage]);

  const handleCountdownComplete = useCallback(() => {
    if (isRateLimited) {
      setClientRateLimitExpiresAt(null);
      return;
    }
    if (currentPhoneNumber !== '') {
      clearPhoneResendTimeout(currentPhoneNumber);
    }
  }, [
    isRateLimited,
    setClientRateLimitExpiresAt,
    currentPhoneNumber,
    clearPhoneResendTimeout,
  ]);

  const handlePhoneChange = useCallback((digits: string) => {
    const newNumber = digits.length === 10 ? `+7${digits}` : '';
    
    setEnteredPhoneNumber(newNumber);
    setIsPhoneInputCompleted(digits.length === 10);
    setIsPhoneEdited(newNumber !== storedPhoneNumber);
  }, [storedPhoneNumber]);

  const handlePhoneInputComplete = useCallback((digits: string) => {
    phoneNumberRef.current = digits;
    setEnteredPhoneNumber(`+7${digits}`);
    setErrorMessage(' ');
  }, []);

  const handleRegister = useCallback(async () => {
    if (!isPhoneInputCompleted || isIPBlocked) return;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await requestAuthCode(enteredPhoneNumber);
      if (!response.success) {
        if (response.blockExpiresAt) {
          setErrorMessage(' ');
          setClientRateLimitExpiresAt(response.blockExpiresAt);
        } else if (response.message === 'IP заблокирован') {
          setIsIPBlocked(true);
          if (currentPhoneNumber !== '') {
            clearPhoneResendTimeout(currentPhoneNumber);
          }
        } else {
          setErrorMessage(response.message);
        }
        return;
      }

      addPhone(enteredPhoneNumber);
      setStoredPhoneNumber(enteredPhoneNumber);
      setIsPhoneEdited(false);

      if (response.pinExpiresAt) {
        setPhonePinExpiresAt(enteredPhoneNumber, response.pinExpiresAt);
      }

      if (response.nextRequestAvailableAt) {
        setPhoneResendTimeout(enteredPhoneNumber, response.nextRequestAvailableAt);
      }

      router.replace('/auth/verify-screen');
    } catch {
      setErrorMessage('Не удалось отправить запрос');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [
    isIPBlocked,
    setIsIPBlocked,
    isPhoneInputCompleted,
    currentPhoneNumber,
    enteredPhoneNumber,
    router,
    addPhone,
    setClientRateLimitExpiresAt,
    setPhonePinExpiresAt,
    setPhoneResendTimeout,
    setStoredPhoneNumber,
    clearPhoneResendTimeout,
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

    return <ThemedText style={styles.centeredText}> </ThemedText>;
  };

  return (
    <>
      <Fieldset legend="Введите номер телефона">
        <PhoneInput
          onComplete={handlePhoneInputComplete}
          onChange={handlePhoneChange}
          initialValue={initialPhoneDigits}
          disabled={isIPBlocked || isRateLimited || hasErrorMessage}
        />
      </Fieldset>
      {renderStatusContent()}
      <Button
        disabled={
          isIPBlocked ||
          !isPhoneInputCompleted ||
          isRequestInProgress ||
          isRateLimited ||
          isResendBlocked ||
          hasErrorMessage
        }
        loading={isRequestInProgress}
        onPress={handleRegister}
        text={isResendBlocked ? undefined : 'Получить код'}
      >
        {isResendBlocked ? (
          <CountdownText
            color="textInverted"
            expires={currentPhoneData?.resendTimeoutExpiresAt ?? null}
            onCountdownComplete={handleCountdownComplete}
          >
            Повторить запрос можно через
          </CountdownText>
        ) : null}
      </Button>
    </>
  );
}
