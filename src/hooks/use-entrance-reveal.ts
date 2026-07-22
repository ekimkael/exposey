import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { EASE_OUT, Motion } from '@/constants/motion';

/**
 * Drives a single element's mount reveal: fade in while sliding up by
 * `Motion.travel.header`px, after `delay`ms, on the UI thread.
 *
 * Respects the OS "Reduce Motion" setting — when enabled the element fades
 * only (no travel, no custom easing).
 *
 * @param delay - Milliseconds to wait before the reveal starts (used to stagger a group).
 * @returns An animated style to spread onto an `Animated.View`.
 */
export function useEntranceReveal(delay: number): AnimatedStyle<ViewStyle> {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    const config = reduced
      ? { duration: Motion.duration.enter }
      : { duration: Motion.duration.enter, easing: EASE_OUT };
    progress.value = withDelay(delay, withTiming(1, config));
  }, [progress, delay, reduced]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: reduced ? 0 : (1 - progress.value) * Motion.travel.header }],
  }));
}
