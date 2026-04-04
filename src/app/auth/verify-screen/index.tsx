import { useCallback, useRef, useState } from 'react';

import { PinInput } from '@components/auth/pin-input';
import { Button } from '@components/ui/button';
import { Fieldset } from '@components/ui/fieldset';

export default function VerifyCodeScreen() {
  const pinRef = useRef('');
  const [isPinInputCompleted, setIsPinInputCompleted] = useState(false);

  const handlePinInputComplete = useCallback((digits: string) => {
    pinRef.current = digits;
    setIsPinInputCompleted(true);
  }, []);

  const handleVerify = () => {
    if (!isPinInputCompleted) return;
    // router.push({
    //   pathname: '/auth/login',
    //   params: { phone: `+7${phoneRef.current}` },
    // } as never);
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
