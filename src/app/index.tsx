/**
 * Mindfulness home screen.
 * Features a "Be here now" pill button that morphs into a full-screen beach view.
 *
 * Transition stack:
 *  1. iOS 18+ — Link.AppleZoom: native zoom from button to BeachScreen
 *  2. Fallback  — sharedTransitionTag="beach-morph" via react-native-reanimated
 *
 * @module app/index
 */
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

// Decorative tab-bar icons (iOS SF Symbols only)
const TAB_ICONS: { ios: string }[] = [
  { ios: 'square.grid.2x2.fill' },
  { ios: 'circle' },
  { ios: 'arrow.triangle.2.circlepath' },
  { ios: 'magnifyingglass' },
  { ios: 'person.crop.circle' },
];

export default function MindfulnessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* Centre: aura + label + button */}
      <View style={s.center}>
        {/* Layered radial glow — stacked Views, no blur lib needed */}
        <View style={[s.aura, s.auraOuter]} />
        <View style={[s.aura, s.auraMid]} />
        <View style={[s.aura, s.auraInner]} />

        <Text style={s.subtitle}>Nothing needs your attention</Text>

        {/*
         * Link.AppleZoom tells iOS 18+ to zoom from this element into the
         * destination screen. sharedTransitionTag is the reanimated fallback.
         */}
        <Link href={'/beach' as any} asChild>
          <Link.AppleZoom>
            <Pressable style={({ pressed }) => [pressed && s.pressed]}>
              <Animated.View sharedTransitionTag="beach-morph" style={s.button}>
                <Text style={s.buttonText}>Be here now</Text>
              </Animated.View>
            </Pressable>
          </Link.AppleZoom>
        </Link>
      </View>

      {/* Bottom: undo + decorative tab bar */}
      <View style={[s.bottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable style={s.undoBtn} hitSlop={12}>
          <Text style={s.undoText}>↩  Undo</Text>
        </Pressable>

        {Platform.OS === 'ios' && (
          <View style={s.tabBar}>
            {TAB_ICONS.map(({ ios }, i) => (
              <View key={i} style={s.tabItem}>
                <SymbolView
                  name={ios as any}
                  size={22}
                  tintColor={i === 0 ? '#111' : '#AFAFAF'}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const BLUE = '#3B82F6';
const BG   = '#F4F4F4';

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  aura:      { position: 'absolute', borderRadius: 999 },
  auraOuter: { width: 280, height: 220, backgroundColor: `${BLUE}12` },
  auraMid:   { width: 220, height: 170, backgroundColor: `${BLUE}1E` },
  auraInner: { width: 165, height: 128, backgroundColor: `${BLUE}2A` },

  subtitle:   { fontSize: 13, color: '#888', marginBottom: 14, letterSpacing: 0.15 },

  button: {
    backgroundColor: BLUE,
    paddingHorizontal: 26,
    paddingVertical:   13,
    borderRadius:      999,
    shadowColor:       BLUE,
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.35,
    shadowRadius:      12,
    elevation:         6,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '500', letterSpacing: 0.1 },

  pressed: { opacity: 0.88 },

  bottom:   { alignItems: 'center', gap: 16 },
  undoBtn:  { flexDirection: 'row', alignItems: 'center' },
  undoText: { fontSize: 14, color: '#666' },

  tabBar:   { flexDirection: 'row', paddingHorizontal: 20, width: '100%' },
  tabItem:  { flex: 1, alignItems: 'center', paddingVertical: 6 },
});
