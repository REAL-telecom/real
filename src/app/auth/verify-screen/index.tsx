import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { PinInput } from '@components/auth/pin-input';
import { Button } from '@components/ui/button';
import { Fieldset } from '@components/ui/fieldset';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const pinRef = useRef('');
  const [isPinInputCompleted, setIsPinInputCompleted] = useState(false);

  const handlePinInputComplete = useCallback((digits: string) => {
    pinRef.current = digits;
    setIsPinInputCompleted(true);
  }, []);

  const handleVerify = () => {
    if (!isPinInputCompleted) return;
    router.push({
      pathname: '/main',
    } as never);
  };

  return (
    <>
      <Fieldset legend='Введите проверочный код'>
        <PinInput onComplete={handlePinInputComplete} />
      </Fieldset>
      <Button disabled={!isPinInputCompleted} onPress={handleVerify} text='Войти' />
    </>
  );
}
