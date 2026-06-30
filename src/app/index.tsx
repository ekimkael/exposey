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

export default function MindfulnessScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <Text style={[s.subtitle, { marginTop: insets.top + 20 }]}>
        Nothing needs your attention
      </Text>

      <View style={s.center}>

        {/* Radial aura — 5 concentric ellipses, opacity fades outward */}
        <View style={[s.aura, { width: 380, height: 300, opacity: 0.06 }]} />
        <View style={[s.aura, { width: 310, height: 240, opacity: 0.09 }]} />
        <View style={[s.aura, { width: 248, height: 192, opacity: 0.13 }]} />
        <View style={[s.aura, { width: 192, height: 148, opacity: 0.17 }]} />
        <View style={[s.aura, { width: 144, height: 112, opacity: 0.22 }]} />

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

const BLUE = '#3B82F6';

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  aura: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: BLUE,
  },

  subtitle: {
    fontSize: 13,
    color: '#8A8A8E',
    letterSpacing: 0.1,
    textAlign: 'center',
  },

  button: {
    backgroundColor: BLUE,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    // blue glow shadow
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  pressed: { opacity: 0.85 },
});
