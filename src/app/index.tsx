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

const BLUE = '#3B82F6';

// ponytail: fixed pill size avoids onLayout — change if label text changes
const PILL_W = 164;
const PILL_H = 50;

export default function MindfulnessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      <Text style={[s.subtitle, { marginTop: insets.top + 20 }]}>
        Nothing needs your attention
      </Text>

      <View style={s.center}>
        {/* Glow layers — same pill shape, bleed outward via shadowRadius */}
        <View pointerEvents="none" style={s.glowFar} />
        <View pointerEvents="none" style={s.glowNear} />

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

  // Wide soft halo
  glowFar: {
    position: 'absolute',
    width: PILL_W + 60,
    height: PILL_H + 60,
    borderRadius: 999,
    backgroundColor: BLUE,
    opacity: 0.18,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 55,
  },
  // Tighter bright core glow
  glowNear: {
    position: 'absolute',
    width: PILL_W,
    height: PILL_H,
    borderRadius: 999,
    backgroundColor: BLUE,
    opacity: 0.35,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 28,
  },

  button: {
    width: PILL_W,
    height: PILL_H,
    borderRadius: 999,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  pressed: { opacity: 0.85 },
});
