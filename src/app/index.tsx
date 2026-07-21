import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CanopiLogo } from '@/components/canopi-logo';
import { OnboardingCards } from '@/components/onboarding-cards';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Fade + slide-up on mount, driven by a single shared value. */
function FadeUp({ delay, children, style }: { delay: number; children: React.ReactNode; style?: any }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, [p, delay]);
  const anim = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 18 }],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

function AppleButton() {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withTiming(0.96, { duration: 120 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 160 }))}
      style={[styles.appleBtn, style]}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Apple">
      <SymbolView name="apple.logo" size={22} tintColor="#FFFFFF" style={styles.appleLogo} />
      <Text style={styles.appleText}>Sign in with Apple</Text>
    </AnimatedPressable>
  );
}

export default function Onboarding() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#091311', '#0C1A15', '#1B3020', '#294A2E', '#132019', '#0A120E']}
        locations={[0, 0.28, 0.5, 0.68, 0.86, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.top}>
          <FadeUp delay={0} style={styles.logoWrap}>
            <CanopiLogo size={92} />
          </FadeUp>
          <FadeUp delay={120}>
            <Text style={styles.welcome}>Welcome to</Text>
          </FadeUp>
          <FadeUp delay={200}>
            <Text style={styles.brand}>Canopi</Text>
          </FadeUp>
          <FadeUp delay={300}>
            <Text style={styles.subtitle}>Share Memorable Moments{'\n'}with your Friends.</Text>
          </FadeUp>
        </View>

        <View style={styles.middle}>
          <OnboardingCards />
        </View>

        <FadeUp delay={700} style={styles.bottom}>
          <AppleButton />
        </FadeUp>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A120E' },
  safe: { flex: 1, paddingHorizontal: 28 },
  top: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 10,
  },
  logoWrap: { marginBottom: 8 },
  welcome: {
    color: '#8C938C',
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  brand: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    marginTop: -6,
  },
  subtitle: {
    color: '#8C938C',
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
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '600',
  },
});
