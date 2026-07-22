import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { EASE_OUT, EASE_SINE, Motion } from '@/constants/motion';

/**
 * Drives a card's two-phase motion, on the UI thread:
 *  1. Entrance — fade in + slide up by `Motion.travel.card`px, staggered per `index`.
 *  2. Idle bob — a perpetual, de-phased vertical sway (peak-to-peak `amplitude * 2`px).
 *
 * `enter` and `bob` are separate shared values summed in the transform, so the
 * infinite loop never fights the one-shot entrance.
 *
 * Under "Reduce Motion" the card fades in without travel and the bob never
 * starts — important because a paused bob would otherwise freeze at its start
 * value and leave every card offset by `-amplitude`px.
 *
 * @param index - Card position in the shelf; staggers both the entrance and the bob phase.
 * @returns An animated style to spread onto an `Animated.View`.
 */
export function useFloatReveal(index: number): AnimatedStyle<ViewStyle> {
  const reduced = useReducedMotion();
  const enter = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    const enterConfig = reduced
      ? { duration: Motion.duration.enter }
      : { duration: Motion.duration.enter, easing: EASE_OUT };
    enter.value = withDelay(Motion.card.enterDelayBase + index * Motion.card.enterStagger, withTiming(1, enterConfig));

    if (reduced) return;
    bob.value = withDelay(
      index * Motion.bob.delayStep,
      withRepeat(
        withTiming(1, { duration: Motion.bob.durationBase + index * Motion.bob.durationStep, easing: EASE_SINE }),
        -1,
        true,
      ),
    );
  }, [enter, bob, index, reduced]);

  return useAnimatedStyle(() => {
    const entranceOffset = (1 - enter.value) * Motion.travel.card;
    const bobOffset = (bob.value - 0.5) * Motion.bob.amplitude * 2;
    return {
      opacity: enter.value,
      transform: [{ translateY: reduced ? 0 : entranceOffset + bobOffset }],
    };
  });
}
