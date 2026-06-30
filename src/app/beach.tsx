/**
 * Beach destination screen.
 * Receives the zoom/morph transition from the "Be here now" pill button.
 * On iOS 18+: Link.AppleZoomTarget anchors the native zoom transition.
 * Fallback: sharedTransitionTag="beach-morph" for react-native-reanimated.
 * @module app/beach
 */
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { Link } from 'expo-router';

import { BeachScene } from '@/components/beach-scene';

export default function BeachScreen() {
  return (
    <Animated.View sharedTransitionTag="beach-morph" style={s.root}>
      <Link.AppleZoomTarget>
        <BeachScene />
      </Link.AppleZoomTarget>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D3326' },
});
