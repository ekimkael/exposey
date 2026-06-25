/**
 * Remindo onboarding / landing screen.
 *
 * Layout (top → bottom):
 *   - Fullscreen white→brand-blue SVG gradient background
 *   - Cycling value-prop slot machine (white area, top half)
 *   - Logo mark + headline + subtitle + CTA buttons (gradient/blue area, bottom half)
 *
 * @module app/index
 */
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { CyclingWords } from '@/components/cycling-words';
import OnboardingActions from '@/components/onboarding-actions';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Radial gradient: white at top-centre → grey mid → black bottom */}
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          {/* cx/cy = focal point at top-centre; rx wide, ry tall so it fans top→bottom */}
          <RadialGradient id="grad" cx="50%" cy="0%" rx="120%" ry="100%" fx="50%" fy="0%">
            <Stop offset="0"    stopColor="#ffffff" />
            <Stop offset="0.45" stopColor="#888888" />
            <Stop offset="1"    stopColor="#000000" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }]}>
        {/* Top: cycling words fill the white area */}
        <View style={styles.topSection}>
          <CyclingWords />
        </View>

        {/* Bottom: identity + copy + actions */}
        <View style={styles.bottomSection}>
          {/* Logo mark: frosted rounded square */}
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>R</Text>
          </View>

          <Text style={styles.headline}>Your day, organised</Text>
          <Text style={styles.subtitle}>
            Plan, remind and share —{'\n'}synced across all your devices.
          </Text>

          <OnboardingActions />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 4,
  },
});
