import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OtpInput } from '@/components/otp-input';
import { PrimaryButton } from '@/components/primary-button';
import { useFlow } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** Number of OTP digits. */
const CODE_LENGTH = 6;
/** Mock "correct" code — entering anything else triggers the error state. */
const CORRECT_CODE = '428913';
/** Resend countdown, in seconds (01:23 in the design). */
const RESEND_SECONDS = 83;

/** Format a second count as `mm:ss`. */
function formatTimer(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Code verification — "Enter the code we sent to you".
 *
 * Shows the target number, a 6-cell OTP input, and a resend countdown. "Next"
 * validates the code against {@link CORRECT_CODE}: a match advances to the
 * success screen, anything else flips the input into its error state (red cells
 * + shake). Editing clears the error. The mock code is `428913`.
 */
export default function VerifyScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { country, phone } = useFlow();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  // Tick the resend countdown down to zero.
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const handleChange = (next: string) => {
    setError(false);
    setCode(next);
  };

  const handleSubmit = () => {
    if (code === CORRECT_CODE) router.push('/profile/identity');
    else setError(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 44}
      style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 8 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 30, color: colors.text, marginBottom: 24 }}>
        Enter the code we sent to you
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.inputBg,
          borderRadius: 14,
          borderCurve: 'continuous',
          paddingHorizontal: 16,
          height: 52,
          marginBottom: 20,
        }}>
        <Text style={{ fontSize: 18 }}>{country.flag}</Text>
        <Text style={{ fontFamily: font.medium, fontSize: 16, color: colors.text }}>
          {country.dialCode} {phone || '9123-4567'}
        </Text>
      </View>

      <OtpInput value={code} onChangeText={handleChange} length={CODE_LENGTH} error={error} />

      {error ? (
        <Text selectable style={{ fontFamily: font.medium, fontSize: 13, color: colors.danger, marginTop: 12 }}>
          Incorrect verification code. Try again
        </Text>
      ) : null}

      <View style={{ marginTop: 16 }}>
        {seconds > 0 ? (
          <Text style={{ fontFamily: font.regular, fontSize: 13, color: colors.textMuted }}>
            I didn&apos;t receive a code{' '}
            <Text style={{ fontFamily: font.medium, fontVariant: ['tabular-nums'], color: colors.text }}>
              {formatTimer(seconds)}
            </Text>
          </Text>
        ) : (
          <Pressable onPress={() => setSeconds(RESEND_SECONDS)}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.accent }}>Resend code</Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingBottom: insets.bottom + 12 }}>
        <PrimaryButton label="Next" disabled={code.length < CODE_LENGTH} onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
