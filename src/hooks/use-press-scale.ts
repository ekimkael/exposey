import { ViewStyle } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { EASE_OUT, Motion } from '@/constants/motion';

interface PressScale {
  /** Animated style to spread onto the pressable. */
  style: AnimatedStyle<ViewStyle>;
  handlePressIn: () => void;
  handlePressOut: () => void;
}

/**
 * Tactile press feedback: scales the target down to `Motion.pressScale` on
 * press-in and springs it back on release, both with an ease-out curve, on the
 * UI thread.
 *
 * @returns The animated style plus `handlePressIn` / `handlePressOut` for the pressable.
 */
export function usePressScale(): PressScale {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withTiming(Motion.pressScale, { duration: Motion.duration.pressIn, easing: EASE_OUT });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: Motion.duration.pressOut, easing: EASE_OUT });
  };

  return { style, handlePressIn, handlePressOut };
}
