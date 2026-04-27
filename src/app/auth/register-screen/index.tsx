import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { requestAuthCode } from '@api/auth';
import { PhoneInput } from '@components';
import { useAuth } from '@contexts';
import { Button, CountdownText, Fieldset, ThemedText } from '@ui';

export default function RegisterScreen() {
  const {
    storedPhoneNumber,
    setStoredPhoneNumber,
    clientRateLimitExpiresAt,
    setClientRateLimitExpiresAt,
    phones,
    addPhone,
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
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);

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
  const currentPhoneNumber = isPhoneEditing
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
    const oldNumber = storedPhoneNumber ?? '';
    
    setEnteredPhoneNumber(newNumber);
    setIsPhoneInputCompleted(digits.length === 10);
    setIsPhoneEditing(newNumber !== storedPhoneNumber);
  }, [storedPhoneNumber]);

  const handlePhoneInputComplete = useCallback((digits: string) => {
    phoneNumberRef.current = digits;
    setEnteredPhoneNumber(`+7${digits}`);
    setErrorMessage(' ');
  }, []);

  const handleRegister = useCallback(async () => {
    if (!isPhoneInputCompleted) return;
    const fullPhone = enteredPhoneNumber;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await requestAuthCode(fullPhone);
      if (!response.success) {
        if (response.blockExpiresAt) {
          setErrorMessage(' ');
          setClientRateLimitExpiresAt(response.blockExpiresAt);
        } else {
          setErrorMessage(response.message);
        }
        return;
      }

      addPhone(fullPhone);
      setStoredPhoneNumber(fullPhone);
      setIsPhoneEditing(false);

      if (response.nextRequestAvailableAt) {
        setPhoneResendTimeout(fullPhone, response.nextRequestAvailableAt);
      }

      router.replace('/auth/verify-screen');
    } catch {
      setErrorMessage('Не удалось отправить запрос');
    } finally {
      setIsRequestInProgress(false);
    }
  }, [
    isPhoneInputCompleted,
    enteredPhoneNumber,
    router,
    addPhone,
    setStoredPhoneNumber,
    setClientRateLimitExpiresAt,
    setPhoneResendTimeout,
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

    return <ThemedText style={styles.centeredText}> </ThemedText>;
  };

  return (
    <>
      <Fieldset legend="Введите номер телефона">
        <PhoneInput
          onComplete={handlePhoneInputComplete}
          onChange={handlePhoneChange}
          initialValue={initialPhoneDigits}
          disabled={isRateLimited || hasErrorMessage}
        />
      </Fieldset>
      {renderStatusContent()}
      <Button
        disabled={
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
