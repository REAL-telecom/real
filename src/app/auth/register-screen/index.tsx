import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';

import { requestAuthCode } from '@api/auth';
import { PhoneInput } from '@components';
import { useAuth } from '@contexts';
import { Button, CountdownText, Fieldset, ThemedText } from '@ui';

export default function RegisterScreen() {
  const [isPhoneInputCompleted, setIsPhoneInputCompleted] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(' ');

  const { phone, setPhone, isLocked, lockExpires, setIsLocked, setLockExpires } =
    useAuth();
  const phoneRef = useRef('');
  const router = useRouter();

  const handlePhoneInputComplete = useCallback((digits: string) => {
    phoneRef.current = digits;
    setIsPhoneInputCompleted(true);
    setErrorMessage(' ');
  }, []);

  const handleRegister = async () => {
    if (!isPhoneInputCompleted) return;
    const fullPhone = `+7${phoneRef.current}`;

    setIsRequestInProgress(true);
    setErrorMessage(' ');

    try {
      const response = await requestAuthCode(fullPhone);
      if (!response.success) {
        setErrorMessage(response.message);
        if (response.blockExpiresAt) {
          setIsLocked('paused');
          setLockExpires(response.blockExpiresAt);
        }
        return;
      }

      setPhone(fullPhone);
      if (response.nextRequestAvailableAt) {
        setIsLocked('timeout');
        setLockExpires(response.nextRequestAvailableAt);
      }

      router.replace('/auth/verify-screen' as never);
    } catch {
      setErrorMessage('Не удалось отправить запрос');
    } finally {
      setIsRequestInProgress(false);
    }
  };

  const fullPhone = `+7${phoneRef.current}`;
  const isBlocked = isLocked === 'timeout' && fullPhone === phone;

  return (
    <>
      <Fieldset legend="Введите номер телефона">
        <PhoneInput onComplete={handlePhoneInputComplete} />
      </Fieldset>
      {errorMessage !== ' ' && (
        <ThemedText type="errorSmall">{errorMessage}</ThemedText>
      )}
      {isBlocked && lockExpires && (
        <CountdownText type="small" expires={lockExpires}>
          Повторить через
        </CountdownText>
      )}
      <Button
        disabled={!isPhoneInputCompleted || isRequestInProgress || isBlocked}
        onPress={handleRegister}
        text="Получить код" />
    </>
  );
}
