import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Recipient } from '@/components/recipient-card';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

type Phase = 'confirm' | 'authenticating' | 'success';

interface PaymentConfirmSheetProps {
  visible: boolean;
  amount: string;
  recipient: Recipient;
  onClose: () => void;
}

const MORPH = LinearTransition.springify().damping(20).stiffness(180);

/**
 * Biometric confirm sheet that morphs into a success screen.
 *
 * Opens as a ~30% sheet (confirm), runs Face ID / Touch ID, and on success
 * the card springs taller and the content cross-fades into a checkmark +
 * receipt — à la beui morphing-modal. Remounting on each open (the `&&`
 * gate) keeps the phase state fresh without a reset effect.
 */
export function PaymentConfirmSheet({ visible, amount, recipient, onClose }: PaymentConfirmSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && <ConfirmCard amount={amount} recipient={recipient} onClose={onClose} />}
    </Modal>
  );
}

function ConfirmCard({ amount, recipient, onClose }: Omit<PaymentConfirmSheetProps, 'visible'>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const [phase, setPhase] = useState<Phase>('confirm');

  const formatted = `$${(parseFloat(amount) || 0).toFixed(2)}`;
  const minHeight = Math.round(screenH * (phase === 'success' ? 0.44 : 0.3));

  const succeed = () => {
    setPhase('success');
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const authenticate = async () => {
    if (phase !== 'confirm') return;
    setPhase('authenticating');

    // No biometric hardware (web / simulator without enrolment): proceed anyway.
    if (process.env.EXPO_OS === 'web') return succeed();
    const ready = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
    if (!ready) return succeed();

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Send ${formatted} to ${recipient.name}`,
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      succeed();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPhase('confirm');
    }
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={phase === 'confirm' ? onClose : undefined} />

      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        layout={MORPH}
        style={[styles.card, { minHeight, backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.grabber, { backgroundColor: colors.surfaceMuted }]} />

        {phase !== 'success' ? (
          <Animated.View key="confirm" entering={FadeIn.duration(160)} exiting={FadeOut.duration(160)} style={styles.body}>
            <View style={styles.center}>
              <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.avatarLetter, { color: colors.accent }]}>{recipient.name[0]}</Text>
              </View>
              <Text style={[styles.label, { color: colors.textMuted }]}>Sending to {recipient.name}</Text>
              <Text style={[styles.amount, { color: colors.text }]}>{formatted}</Text>
            </View>

            <Pressable
              disabled={phase === 'authenticating'}
              onPress={authenticate}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.text, opacity: phase === 'authenticating' ? 0.5 : pressed ? 0.85 : 1 },
              ]}>
              <Image source="sf:faceid" tintColor={colors.background} style={styles.icon} />
              <Text style={[styles.ctaText, { color: colors.background }]}>
                {phase === 'authenticating' ? 'Authenticating…' : 'Confirm with Face ID'}
              </Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View key="success" entering={FadeIn.delay(120).duration(220)} style={styles.body}>
            <View style={styles.center}>
              <Animated.View entering={ZoomIn.springify().damping(11).stiffness(220).delay(120)}>
                <Image source="sf:checkmark.circle.fill" tintColor={colors.success} style={styles.check} />
              </Animated.View>
              <Text style={[styles.successTitle, { color: colors.text }]}>{formatted} sent</Text>
              <Text style={[styles.label, { color: colors.textMuted }]}>to {recipient.name}</Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cta, { backgroundColor: colors.text, opacity: pressed ? 0.85 : 1 }]}>
              <Text style={[styles.ctaText, { color: colors.background }]}>Done</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderCurve: 'continuous',
    paddingHorizontal: 24,
    paddingTop: 10,
    overflow: 'hidden',
  },
  grabber: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 4 },
  body: { flex: 1, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 22, fontFamily: font.semibold },
  label: { fontSize: 15, fontFamily: font.regular },
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
  icon: { width: 20, height: 20 },
  check: { width: 72, height: 72 },
});
