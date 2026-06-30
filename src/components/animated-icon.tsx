import { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const SCREEN_HEIGHT = Dimensions.get('screen').height;
const SPLASH_DURATION = 600;

const splashKeyframe = new Keyframe({
  0:   { transform: [{ scale: SCREEN_HEIGHT / 90 }], opacity: 1 },
  20:  { opacity: 1 },
  70:  { opacity: 0, easing: Easing.elastic(0.7) },
  100: { opacity: 0, transform: [{ scale: 1 }], easing: Easing.elastic(0.7) },
});

/**
 * Full-screen blue overlay that plays a shrink-and-fade animation on mount,
 * then removes itself from the tree. Renders above all content (zIndex 1000).
 */
export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <Animated.View
      entering={splashKeyframe.duration(SPLASH_DURATION).withCallback((finished) => {
        'worklet';
        if (finished) scheduleOnRN(setVisible, false);
      })}
      style={styles.overlay}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#208AEF',
    zIndex: 1000,
  },
});
