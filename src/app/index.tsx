import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmountDisplay } from '@/components/amount-display';
import { AmountKeypad } from '@/components/amount-keypad';
import { AvailableBalance } from '@/components/available-balance';
import { ContactPicker } from '@/components/contact-picker';
import { ContinueButton } from '@/components/continue-button';
import { ErrorBanner } from '@/components/error-banner';
import { RecipientCard, type Recipient } from '@/components/recipient-card';
import { HeaderMenu } from '@/components/send-money-header';
import { type AnimationStyle } from '@/lib/animations';
import { applyKey } from '@/lib/amount';
import { useTheme } from '@/theme/theme-context';

/** Mock contact list — replace with a real contacts API when needed. */
const CONTACTS: Recipient[] = [
  { name: 'Michel Mbili',     phone: '+243 81 234 5678' },
  { name: 'Petar Moktar',     phone: '+243 99 876 5432' },
  { name: 'Aliko Dangote',    phone: '+234 80 123 4567' },
  { name: 'Amara Diallo',     phone: '+221 77 456 7890' },
  { name: 'Fatou Ndiaye',     phone: '+221 76 234 5678' },
  { name: 'Kofi Mensah',      phone: '+233 24 567 8901' },
  { name: 'Ngozi Okonkwo',    phone: '+234 81 345 6789' },
  { name: 'Sekou Touré',      phone: '+224 62 456 7890' },
  { name: 'Aminata Camara',   phone: '+224 65 678 9012' },
  { name: 'David Osei',       phone: '+233 20 789 0123' },
  { name: 'Grace Mutua',      phone: '+254 71 890 1234' },
  { name: 'Ibrahim Diop',     phone: '+221 78 901 2345' },
  { name: 'Josephine Abiola', phone: '+234 70 012 3456' },
  { name: 'Kwame Asante',     phone: '+233 27 123 4567' },
  { name: 'Layla Hassan',     phone: '+251 91 234 5678' },
  { name: 'Moussa Traoré',    phone: '+223 76 345 6789' },
  { name: 'Nadia Benzara',    phone: '+213 55 456 7890' },
  { name: 'Olu Adeyemi',      phone: '+234 90 567 8901' },
  { name: 'Priya Sharma',     phone: '+27 82 678 9012' },
  { name: 'Rania El-Amin',    phone: '+20 10 789 0123' },
];

/** Maximum transferable amount for this demo session. */
const AVAILABLE_BALANCE = 500.65;

/**
 * How long the Continue button spins before opening the confirm sheet (ms).
 * Must feel deliberate without being frustrating — 3 s matches the animation.
 */
const CONFIRM_DELAY_MS = 3_000;

const BALANCE_EXCEEDED_MESSAGE = 'Insufficient balance';

/**
 * Main "Send Money" screen.
 *
 * **Composition:** every UI section is an isolated presentational component;
 * this screen only holds state and wires props down.
 *
 * **State:**
 * | Name           | Purpose                                                     |
 * |----------------|-------------------------------------------------------------|
 * | `amount`       | Raw typed string, managed by `applyKey` / `AmountKeypad`    |
 * | `animationStyle` | Selectable entry animation (picked from the header menu)  |
 * | `recipient`    | Currently selected contact                                  |
 * | `pickerVisible`| Whether the contact picker sheet is open                    |
 * | `buttonKey`    | Bumped on confirm-sheet close to remount `ContinueButton`   |
 *
 * **Confirm flow:**
 * 1. `handleContinue` fires on button tap — waits `CONFIRM_DELAY_MS` then
 *    pushes the `/confirm` route as a native form sheet.
 * 2. When the user dismisses the sheet, `useFocusEffect` fires on this screen's
 *    re-focus and `pendingReset.current` tells it to bump `buttonKey`.
 */
export default function SendMoneyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [amount, setAmount] = useState('0');
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('pulse');
  const [recipient, setRecipient] = useState<Recipient>(CONTACTS[0]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [buttonKey, setButtonKey] = useState(0);

  /**
   * Set to `true` by `handleContinue` right before the navigation push so that
   * `useFocusEffect` knows to reset the button when this screen regains focus.
   */
  const pendingReset = useRef(false);
  /** Holds the pending confirm timer so it can be cancelled on unmount. */
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Cancel the confirm timer when the screen unmounts (e.g. hard back-navigation). */
  useEffect(() => {
    return () => {
      if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
    };
  }, []);

  /** Reset the Continue button to idle when this screen regains focus after confirm. */
  useFocusEffect(
    useCallback(() => {
      if (pendingReset.current) {
        setButtonKey((k) => k + 1);
        pendingReset.current = false;
      }
    }, []),
  );

  const isBalanceExceeded = parseFloat(amount || '0') > AVAILABLE_BALANCE;
  const canContinue = !isBalanceExceeded && parseFloat(amount || '0') > 0;

  /**
   * Tap handler for the Continue button.
   *
   * Captures the recipient and amount at press time (intentional snapshot —
   * the user committed to these values when they tapped), then opens the
   * confirm sheet after the button's loading animation has run.
   */
  const handleContinue = () => {
    const snapshotAmount = amount;
    const snapshotRecipient = recipient;
    confirmTimer.current = setTimeout(() => {
      pendingReset.current = true;
      router.push({
        pathname: '/confirm',
        params: {
          amount: snapshotAmount,
          recipientName: snapshotRecipient.name,
          recipientPhone: snapshotRecipient.phone,
        },
      });
    }, CONFIRM_DELAY_MS);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle: '', headerBackVisible: false }} />
      <HeaderMenu animationStyle={animationStyle} onAnimationChange={setAnimationStyle} />

      <RecipientCard recipient={recipient} onChangePress={() => setPickerVisible(true)} />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {/*
         * Animated.View wrapper — required so the sharedTransitionTag is on a
         * View node, matching the Animated.View in confirm.tsx. Reanimated shared
         * transitions require the same host component type on both ends.
         */}
        <Animated.View sharedTransitionTag="payment-amount">
          <AmountDisplay amount={amount} exceeded={isBalanceExceeded} animationStyle={animationStyle} />
        </Animated.View>
        <AvailableBalance amount={AVAILABLE_BALANCE} />
      </View>

      {isBalanceExceeded && <ErrorBanner message={BALANCE_EXCEEDED_MESSAGE} />}

      <AmountKeypad onKeyPress={(key) => setAmount((cur) => applyKey(cur, key))} locked={isBalanceExceeded} />

      <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <ContinueButton key={buttonKey} onPress={handleContinue} disabled={!canContinue} />
      </View>

      <ContactPicker
        visible={pickerVisible}
        contacts={CONTACTS}
        onSelect={setRecipient}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}
