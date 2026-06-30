/**
 * Mindfulness home screen.
 * "Be here now" pill button morphs into the full-screen beach view.
 * iOS 18+: Link.AppleZoom (native zoom). Fallback: sharedTransitionTag.
 * @module app/index
 */
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const BLUE = '#3B82F6';

export default function MindfulnessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <Text style={[s.subtitle, { marginTop: insets.top + 20 }]}>
        Nothing needs your attention
      </Text>

      <View style={s.center}>
        {/* Soft radial glow via SVG RadialGradient — fades to transparent */}
        <Svg style={s.glow} viewBox="0 0 320 220">
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%"   stopColor={BLUE} stopOpacity="0.38" />
              <Stop offset="35%"  stopColor={BLUE} stopOpacity="0.18" />
              <Stop offset="65%"  stopColor={BLUE} stopOpacity="0.06" />
              <Stop offset="100%" stopColor={BLUE} stopOpacity="0"    />
            </RadialGradient>
          </Defs>
          <Ellipse cx="160" cy="110" rx="160" ry="110" fill="url(#g)" />
        </Svg>

        <Link href={'/beach' as any} asChild>
          <Link.AppleZoom>
            <Pressable style={({ pressed }) => pressed && s.pressed}>
              <Animated.View sharedTransitionTag="beach-morph" style={s.button}>
                <Text style={s.label}>Be here now</Text>
              </Animated.View>
            </Pressable>
          </Link.AppleZoom>
        </Link>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  subtitle: {
    fontSize: 13,
    color: '#8A8A8E',
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  glow: {
    position: 'absolute',
    width: 320,
    height: 220,
  },

  button: {
    backgroundColor: BLUE,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  pressed: { opacity: 0.85 },
});
