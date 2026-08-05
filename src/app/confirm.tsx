import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** The three phases of the confirmation flow. */
type Phase = 'confirm' | 'authenticating' | 'success';

// --- Animation tuning -------------------------------------------------------
/** Cross-fade duration for the confirm↔success phase swap. */
const PHASE_FADE_MS = 160;
/** Delay before the success phase fades in, letting the confirm phase clear first. */
const SUCCESS_FADE_DELAY_MS = 120;
/** Duration of the success phase's own fade-in. */
const SUCCESS_FADE_MS = 220;
/** Delay before the checkmark starts its scale-in, after the success phase is visible. */
const CHECKMARK_DELAY_MS = 120;

/**
 * Biometric payment confirmation screen, presented as a native form sheet.
 *
 * **Flow:**
 * 1. Opens at the "confirm" phase showing recipient + amount.
 * 2. User taps the CTA → `expo-local-authentication` prompts Face ID / Touch ID.
 * 3. On success the content cross-fades to a checkmark receipt and a success
 *    haptic fires.  On failure an error haptic fires and the CTA resets.
 *
 * **Biometric label:** detected asynchronously on mount via
 * `supportedAuthenticationTypesAsync()`.  Defaults to "Face ID" until resolved
 * so there is no layout shift — on FINGERPRINT devices the label updates before
 * the user can read it in practice.
 *
 * **Navigation params** (all strings, from `router.push`):
 * - `amount`        — raw amount string (e.g. `"85.00"`)
 * - `recipientName` — display name of the payee
 * - `recipientPhone`— phone number of the payee (displayed as secondary label)
 *
 * **Web / un-enrolled simulator:** biometric prompt is skipped and the flow
 * proceeds straight to success so the UI remains fully demoable without a device.
 */
export default function ConfirmScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { amount, recipientName, recipientPhone } = useLocalSearchParams<{
    amount: string;
    recipientName: string;
    recipientPhone: string;
  }>();

  const [phase, setPhase] = useState<Phase>('confirm');
  const [biometricLabel, setBiometricLabel] = useState<'Face ID' | 'Touch ID'>('Face ID');

  const reducedMotion = useReducedMotion();
  /** 0 = pre-entrance, 1 = settled. Drives the checkmark's scale + opacity. */
  const checkmarkProgress = useSharedValue(0);

  /** Animate the success checkmark in — scale 0.9→1, never from 0 (nothing appears from nothing). */
  useEffect(() => {
    if (phase !== 'success') return;
    checkmarkProgress.value = reducedMotion
      ? withTiming(1, { duration: CHECKMARK_DELAY_MS })
      : withDelay(CHECKMARK_DELAY_MS, withSpring(1, { damping: 11, stiffness: 220 }));
  }, [phase, reducedMotion, checkmarkProgress]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkProgress.value,
    transform: [{ scale: 0.9 + checkmarkProgress.value * 0.1 }],
  }));

  /** Detect the enrolled scanner type once on mount. */
  useEffect(() => {
    if (process.env.EXPO_OS === 'web') return;
    LocalAuthentication.supportedAuthenticationTypesAsync().then((types) => {
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricLabel('Touch ID');
      }
    });
  }, []);

  /** Amount formatted for display, e.g. `"$85.00"`. */
  const formatted = `$${(parseFloat(amount ?? '0') || 0).toFixed(2)}`;

  /** SF Symbol icon name matching the enrolled scanner. */
  const biometricIcon = biometricLabel === 'Touch ID' ? 'sf:touchid' : 'sf:faceid';

  /** Transition to the success phase with a haptic notification. */
  const succeed = () => {
    setPhase('success');
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  /**
   * Trigger biometric authentication.
   *
   * - On web or un-enrolled devices: proceeds straight to success.
   * - On cancel / failure: fires an error haptic and resets to the confirm phase.
   */
  const authenticate = async () => {
    if (phase !== 'confirm') return;
    setPhase('authenticating');

    if (process.env.EXPO_OS === 'web') return succeed();

    const ready =
      (await LocalAuthentication.hasHardwareAsync()) &&
      (await LocalAuthentication.isEnrolledAsync());
    if (!ready) return succeed();

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Send ${formatted} to ${recipientName}`,
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      succeed();
    } else {
      if (process.env.EXPO_OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setPhase('confirm');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      {phase !== 'success' ? (
        <Animated.View
          key="confirm"
          entering={FadeIn.duration(PHASE_FADE_MS)}
          exiting={FadeOut.duration(PHASE_FADE_MS)}
          style={styles.body}>
          <View style={styles.center}>
            {/* Recipient avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.avatarLetter, { color: colors.accent }]}>{recipientName?.[0]}</Text>
            </View>

            <Text style={[styles.recipientName, { color: colors.textMuted }]}>To {recipientName}</Text>
            <Text style={[styles.recipientPhone, { color: colors.textMuted }]}>{recipientPhone}</Text>

            {/*
             * sharedTransitionTag must be on an Animated.View (not Animated.Text)
             * to match the Animated.View wrapper in index.tsx — Reanimated shared
             * transitions require the same host component type on both ends.
             */}
            <Animated.View sharedTransitionTag="payment-amount">
              <Text style={[styles.amount, { color: colors.text }]}>{formatted}</Text>
            </Animated.View>
          </View>

          <Pressable
            disabled={phase === 'authenticating'}
            onPress={authenticate}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: colors.text,
                opacity: phase === 'authenticating' ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}>
            <Image source={biometricIcon} tintColor={colors.background} style={styles.biometricIcon} />
            <Text style={[styles.ctaText, { color: colors.background }]}>
              {phase === 'authenticating' ? 'Verifying…' : `Confirm with ${biometricLabel}`}
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          key="success"
          entering={FadeIn.delay(SUCCESS_FADE_DELAY_MS).duration(SUCCESS_FADE_MS)}
          style={styles.body}>
          <View style={styles.center}>
            <Animated.View style={checkmarkStyle}>
              <Image source="sf:checkmark.circle.fill" tintColor={colors.success} style={styles.checkmark} />
            </Animated.View>
            <Text style={[styles.successTitle, { color: colors.text }]}>{formatted} sent</Text>
            <Text style={[styles.recipientName, { color: colors.textMuted }]}>to {recipientName}</Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: colors.text, opacity: pressed ? 0.85 : 1 },
            ]}>
            <Text style={[styles.ctaText, { color: colors.background }]}>Close</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  body: { flex: 1, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 22, fontFamily: font.semibold },
  recipientName: { fontSize: 15, fontFamily: font.regular },
  recipientPhone: { fontSize: 13, fontFamily: font.regular },
  amount: { fontSize: 40, fontFamily: font.bold, fontVariant: ['tabular-nums'] },
  successTitle: { fontSize: 26, fontFamily: font.bold, fontVariant: ['tabular-nums'] },
  cta: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 999,
  },
  ctaText: { fontSize: 16, fontFamily: font.semibold },
  biometricIcon: { width: 20, height: 20 },
  checkmark: { width: 72, height: 72 },
});
