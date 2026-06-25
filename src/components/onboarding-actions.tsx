import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';

import { COLORS, FONT_SIZE } from '@/utils/tokens';

export interface OnboardingActionsProps {
  /** Safe area bottom inset — keeps buttons above the home indicator. */
  bottomInset: number;
}

/**
 * Bottom CTA section: "Continue with Apple" (primary) + "Sign up" (secondary).
 *
 * ⚠️ Both calls `router.replace('/')` as a placeholder.
 * Replace with your actual auth flow when integrating backend auth.
 */
export function OnboardingActions({ bottomInset }: OnboardingActionsProps) {
  function handleAppleSignIn() {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: trigger Sign in with Apple, then navigate to the main app
    router.replace('/');
  }

  function handleEmailSignUp() {
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    // TODO: navigate to the email/password sign-up screen
    router.replace('/');
  }

  return (
    <View style={[styles.actions, { paddingBottom: bottomInset + 20 }]}>
      <Pressable
        onPress={handleAppleSignIn}
        style={({ pressed }) => [styles.appleButton, pressed && styles.appleButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
      >
        <SymbolView name={'apple.logo' as any} size={24} tintColor={COLORS.buttonText} />
        <Text style={styles.appleButtonText}>Continue with Apple</Text>
      </Pressable>

      <Pressable
        onPress={handleEmailSignUp}
        style={styles.signUpButton}
        accessibilityRole="button"
        accessibilityLabel="Sign up with email"
      >
        <Text style={styles.signUpText}>Sign up</Text>
        <SymbolView name={'chevron.right' as any} size={14} tintColor={COLORS.textMuted} weight="semibold" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { paddingHorizontal: 24, paddingTop: 24, gap: 18 },
  appleButton: {
    backgroundColor: COLORS.buttonBackground,
    borderRadius: 100,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleButtonPressed: { opacity: 0.85 },
  appleButtonText: {
    color: COLORS.buttonText,
    fontSize: FONT_SIZE.button,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  signUpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  signUpText: { color: COLORS.textMuted, fontSize: FONT_SIZE.link },
});
