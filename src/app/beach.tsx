/**
 * Beach destination screen.
 * Receives the zoom/morph transition from the "Be here now" pill button.
 * On iOS 18+: Link.AppleZoomTarget anchors the native zoom transition.
 * Fallback: sharedTransitionTag="beach-morph" via react-native-reanimated.
 * @module app/beach
 */
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

export default function BeachScreen() {
  return (
    <Animated.View sharedTransitionTag="beach-morph" style={s.root}>
      <Link.AppleZoomTarget>
        {/* contentFit="cover" crops phone-frame edges naturally */}
        <Image
          source={require('@/assets/images/beach.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </Link.AppleZoomTarget>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D3326' },
});
