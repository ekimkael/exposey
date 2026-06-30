/**
 * Beach destination screen.
 * Receives the zoom/morph transition from the "Be here now" pill button.
 * On iOS 18+: Link.AppleZoomTarget anchors the native zoom transition.
 * Fallback: sharedTransitionTag="beach-morph" via react-native-reanimated.
 * @module app/beach
 */
import { StyleSheet, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

export default function BeachScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View sharedTransitionTag="beach-morph" style={s.root}>
      <Link.AppleZoomTarget>
        <Image
          source={require('@/assets/images/beach.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </Link.AppleZoomTarget>

      <Pressable
        style={[s.back, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <SymbolView name="chevron.left" size={18} tintColor="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D3326' },
  back: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
