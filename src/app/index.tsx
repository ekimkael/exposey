/**
 * @file index.tsx
 * @description Mindfulness home screen.
 *
 * Displays a calming dark canvas with a subtitle and an Apple-Intelligence-style
 * animated glow button. Tapping the button triggers a native zoom transition
 * (iOS 18+ via `Link.AppleZoom`) that morphs the pill into the full-screen
 * beach photo. On older OS versions the `sharedTransitionTag` fallback fires.
 */
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

import { GlowButton } from '@/components/glow-button';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <Text style={[s.subtitle, { marginTop: insets.top + 20 }]}>
        Nothing needs your attention
      </Text>

      <View style={s.center}>
        {/* Ambient radial halo behind the button — matches the glow palette */}
        <Svg style={s.aura} viewBox="0 0 320 220">
          <Defs>
            <RadialGradient id="aura" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%"   stopColor="#BF5AF2" stopOpacity="0.22" />
              <Stop offset="30%"  stopColor="#5AC8FA" stopOpacity="0.12" />
              <Stop offset="65%"  stopColor="#FF2D55" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0"    />
            </RadialGradient>
          </Defs>
          <Ellipse cx="160" cy="110" rx="160" ry="110" fill="url(#aura)" />
        </Svg>

        {/*
         * Link.AppleZoom propagates its onPress to the direct child (GlowButton).
         * The sharedTransitionTag must match the one on beach.tsx's Animated.View.
         */}
        <Link href="/beach" asChild>
          <Link.AppleZoom>
            <GlowButton label="Be here now" sharedTransitionTag="beach-morph" />
          </Link.AppleZoom>
        </Link>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: '#0B0B0F',
  },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize:      13,
    color:         'rgba(255,255,255,0.45)',
    letterSpacing: 0.15,
    textAlign:     'center',
  },
  aura: {
    position: 'absolute',
    width:    320,
    height:   220,
  },
});
