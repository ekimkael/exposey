import { useEffect, useState } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Metrics, Motion } from '@/constants/pumice';

/** Travel needed to clear the screen, including the dock's corner cut-outs. */
const DOCK_OUT = Metrics.dock.height + Metrics.page.bottomRadius + 8;
const PILL_OUT = Metrics.pill.height + Metrics.pill.bottom + 8;

const OUT = { duration: Motion.outMs, easing: Easing.in(Easing.cubic) } as const;
/** The incoming player only starts once the outgoing one has fully left. */
const IN_DELAY = Motion.outMs + Motion.gapMs;

/**
 * Drives the dock <-> floating-pill swap. Both players are always mounted and
 * only ever translated, so nothing here touches layout.
 */
export function usePlayerSwap() {
  const [pill, setPill] = useState(false);
  const dockY = useSharedValue(0);
  const pillY = useSharedValue(PILL_OUT);
  const bob = useSharedValue(0);

  useEffect(() => {
    const id = setInterval(() => setPill((value) => !value), Motion.cycleMs);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const [leaving, entering] = pill ? [dockY, pillY] : [pillY, dockY];
    const distance = pill ? DOCK_OUT : PILL_OUT;

    leaving.value = withTiming(distance, OUT);
    entering.value = withDelay(IN_DELAY, withSpring(0, Motion.spring));
    bob.value = withSequence(
      withTiming(Motion.bob, OUT),
      withDelay(Motion.gapMs, withSpring(0, Motion.spring))
    );
  }, [pill, dockY, pillY, bob]);

  const dockStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dockY.value }] }));
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pillY.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return { dockStyle, pillStyle, contentStyle };
}
