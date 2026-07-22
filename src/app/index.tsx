import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BaobabLogo } from '@/components/baobab-logo';
import { OnboardingCards } from '@/components/onboarding-cards';
import { BackgroundGradient, Colors } from '@/constants/theme';
import { useEntranceReveal } from '@/hooks/use-entrance-reveal';
import { usePressScale } from '@/hooks/use-press-scale';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Entrance stagger (ms) for each header item, top to bottom. */
const RevealDelay = {
  logo: 0,
  welcome: 120,
  brand: 200,
  subtitle: 300,
  button: 700,
} as const;

/**
 * Wraps its children in a mount reveal (fade + slide-up) via {@link useEntranceReveal}.
 *
 * @param delay - Milliseconds before the reveal starts.
 * @param style - Optional style forwarded to the animated wrapper.
 */
function FadeUp({ delay, children, style }: { delay: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const revealStyle = useEntranceReveal(delay);
  return <Animated.View style={[style, revealStyle]}>{children}</Animated.View>;
}

/** The "Sign in with Apple" button — visual mock with an ease-out press-scale (no auth). */
function AppleButton() {
  const { style, handlePressIn, handlePressOut } = usePressScale();
  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.appleBtn, style]}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Apple">
      <SymbolView name="apple.logo" size={22} tintColor={Colors.textPrimary} style={styles.appleLogo} />
      <Text style={styles.appleText}>Sign in with Apple</Text>
    </AnimatedPressable>
  );
}

/** The Baobab onboarding screen: gradient backdrop, brand header, card shelf, Apple button. */
export default function Onboarding() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={BackgroundGradient.colors}
        locations={BackgroundGradient.locations}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <FadeUp delay={RevealDelay.logo} style={styles.logoWrap}>
            <BaobabLogo size={96} />
          </FadeUp>
          <FadeUp delay={RevealDelay.welcome}>
            <Text style={styles.welcome}>Welcome to</Text>
          </FadeUp>
          <FadeUp delay={RevealDelay.brand}>
            <Text style={styles.brand}>Baobab</Text>
          </FadeUp>
          <FadeUp delay={RevealDelay.subtitle}>
            <Text style={styles.subtitle}>Share Memorable Moments{'\n'}with your Friends.</Text>
          </FadeUp>
        </View>

        <View style={styles.middle}>
          <OnboardingCards />
        </View>

        <FadeUp delay={RevealDelay.button} style={styles.bottom}>
          <AppleButton />
        </FadeUp>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1, paddingHorizontal: 28 },
  top: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 10,
  },
  logoWrap: { marginBottom: 8 },
  welcome: {
    color: Colors.textMuted,
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  brand: {
    color: Colors.textPrimary,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    marginTop: -6,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 23,
    lineHeight: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 22,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  bottom: {
    paddingBottom: 12,
  },
  appleBtn: {
    height: 62,
    borderRadius: 31,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  appleLogo: { marginTop: -3 },
  appleText: {
    color: Colors.textPrimary,
    fontSize: 21,
    fontWeight: '600',
  },
});
