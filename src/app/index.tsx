/**
 * Mindfulness home screen.
 * "Be here now" button uses the Apple-Intelligence-style animated glow border,
 * then morphs into the full-screen beach via Link.AppleZoom (iOS 18+) /
 * sharedTransitionTag fallback.
 * @module app/index
 */
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

import { GlowButton } from '@/components/glow-button';

export default function MindfulnessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <Text style={[s.subtitle, { marginTop: insets.top + 20 }]}>
        Nothing needs your attention
      </Text>

      <View style={s.center}>
        {/* Ambient radial glow behind button (AI colors) */}
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

        <GlowButton
          label="Be here now"
          sharedTransitionTag="beach-morph"
          onPress={() => router.push('/beach' as any)}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#0B0B0F' },
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  aura: {
    position: 'absolute',
    width: 320,
    height: 220,
  },
});
