import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PRESS_SCALE_DROP, PRESS_TIMING } from '@/constants/animation';

/**
 * Scale-down press feedback, driven on the UI thread.
 *
 * Uses a shared value rather than `Pressable`'s `style={({ pressed }) => …}`
 * callback, which would re-render on the JS thread on every touch.
 *
 * The returned style is meant for a view *nested inside* the pressable, not
 * merged into a caller's own transform — the coverflow rebuilds its transform
 * array every scroll frame, and press state is independent of scroll position.
 * Nesting keeps the two from fighting.
 *
 * `withTiming` defaults to `ReduceMotion.System`, so this already honours the
 * OS Reduce Motion setting without extra branching.
 *
 * @returns The animated scale style, plus `onPressIn`/`onPressOut` handlers to
 *   spread onto a `Pressable`.
 */
export function usePressScale() {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * PRESS_SCALE_DROP }],
  }));

  const handlePressIn = () => {
    pressed.value = withTiming(1, PRESS_TIMING);
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, PRESS_TIMING);
  };

  return { pressStyle, handlePressIn, handlePressOut };
}
