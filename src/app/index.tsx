import { Stack } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmountDisplay, type AnimationStyle } from '@/components/amount-display';
import { AmountKeypad } from '@/components/amount-keypad';
import { AvailableBalance } from '@/components/available-balance';
import { ContinueButton } from '@/components/continue-button';
import { ErrorBanner } from '@/components/error-banner';
import { RecipientCard, type Recipient } from '@/components/recipient-card';
import { AnimationMenu, HeaderPill } from '@/components/send-money-header';
import { applyKey } from '@/lib/amount';
import { colors } from '@/theme/tokens';

/** Mock transfer recipient — replace with real data when wiring a backend. */
const RECIPIENT: Recipient = {
  name: 'Aliko Mohammed Dangote',
  bank: 'Grey Finance',
  accountNumber: '2893902383',
};

/** Mock available balance (dollars). Transfers above this are blocked. */
const AVAILABLE_BALANCE = 500.65;

const BALANCE_EXCEEDED_MESSAGE = 'Montant supérieur au solde disponible';

/**
 * Send Money screen.
 *
 * Composition only — each section is its own component. Holds the two pieces of
 * screen state: the raw `amount` string and the selected entry `animationStyle`.
 * Entering a value above {@link AVAILABLE_BALANCE} locks the keypad (except
 * backspace) and triggers the error feedback on {@link AmountDisplay}.
 */
export default function SendMoneyScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('100.25');
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('pulse');

  const isBalanceExceeded = parseFloat(amount || '0') > AVAILABLE_BALANCE;

  const handleKeyPress = (key: string) => setAmount((current) => applyKey(current, key));

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle: () => <HeaderPill />, headerBackVisible: false }} />
      <AnimationMenu value={animationStyle} onChange={setAnimationStyle} />

      <RecipientCard recipient={RECIPIENT} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <AmountDisplay amount={amount} exceeded={isBalanceExceeded} animationStyle={animationStyle} />
        <AvailableBalance amount={AVAILABLE_BALANCE} />
      </View>

      {isBalanceExceeded && <ErrorBanner message={BALANCE_EXCEEDED_MESSAGE} />}

      <AmountKeypad onKeyPress={handleKeyPress} locked={isBalanceExceeded} />

      <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <ContinueButton />
      </View>
    </View>
  );
}
