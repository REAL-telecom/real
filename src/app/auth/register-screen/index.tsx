import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { PhoneInput } from '@components/auth/phone-input';
import { Button } from '@components/ui/button';
import { Fieldset } from '@components/ui/fieldset';

export default function RegisterScreen() {
  const router = useRouter();
  const phoneRef = useRef('');
  const [isPhoneInputCompleted, setIsPhoneInputCompleted] = useState(false);

  const handlePhoneInputComplete = useCallback((digits: string) => {
    phoneRef.current = digits;
    setIsPhoneInputCompleted(true);
  }, []);

  const handleRegister = () => {
    if (!isPhoneInputCompleted) return;
    router.push({
      pathname: '/auth/verify-screen',
      params: { phone: `+7${phoneRef.current}` },
    } as never);
  };

  return (
    <>
      <Fieldset legend="Введите номер телефона">
        <PhoneInput onComplete={handlePhoneInputComplete} />
      </Fieldset>
      <Button
        disabled={!isPhoneInputCompleted}
        onPress={handleRegister}
        text="Получить код"
      />
    </>
  );
}
