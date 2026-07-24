import { Gesture } from 'react-native-gesture-handler';
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

/**
 * Drives the pill <-> dock swap. The pill is the resting state: tapping it
 * expands to the dock, dragging the dock down collapses back to the pill.
 * Both players stay mounted and only ever translate, so nothing here lays out.
 */
export function usePlayerSwap() {
  const dockY = useSharedValue(DOCK_OUT);
  const pillY = useSharedValue(0);
  const bob = useSharedValue(0);
  const dragFrom = useSharedValue(0);

  /** Tap on the pill: the dock starts rising before the pill has finished leaving. */
  function expand() {
    'worklet';
    pillY.value = withTiming(PILL_OUT, OUT);
    dockY.value = withDelay(Motion.overlapMs, withSpring(0, Motion.spring));
    bob.value = withSequence(
      withTiming(Motion.bob, { duration: Motion.overlapMs, easing: Easing.in(Easing.cubic) }),
      withSpring(0, Motion.spring)
    );
  }

  /**
   * Commit to the pill. `velocity` carries the finger's momentum through the
   * release so the dock does not stall the moment the gesture ends. Content
   * stays where the drag left it until the pill comes back for it.
   */
  function collapse(velocity: number) {
    'worklet';
    dockY.value = withSpring(DOCK_OUT, { ...Motion.spring, velocity });
    pillY.value = withDelay(Motion.gapMs, withSpring(0, Motion.spring));
    bob.value = withDelay(Motion.gapMs, withSpring(0, Motion.spring));
  }

  /** Not far enough, not fast enough: put the dock back. */
  function settleBack(velocity: number) {
    'worklet';
    dockY.value = withSpring(0, { ...Motion.spring, velocity });
    bob.value = withSpring(0, Motion.spring);
  }

  const dragDock = Gesture.Pan()
    // Lets taps on the play button through — the pan only takes over on a real drag.
    .activeOffsetY([-10, 10])
    // Grabbing mid-animation picks up where the dock actually is, not from 0.
    .onBegin(() => {
      dragFrom.value = dockY.value;
    })
    .onUpdate((event) => {
      const raw = dragFrom.value + event.translationY;
      dockY.value = raw < 0 ? raw * Motion.rubberBand : raw;
      bob.value = Math.min(Math.max(dockY.value, 0) / Metrics.dock.height, 1) * Motion.bob;
    })
    .onEnd((event) => {
      const pulledFar = dockY.value > Metrics.dock.height * Motion.dismissRatio;
      const flicked = event.velocityY > Motion.dismissVelocity;
      if (pulledFar || flicked) {
        collapse(event.velocityY);
      } else {
        settleBack(event.velocityY);
      }
    });

  const tapPill = Gesture.Tap().onEnd((_event, success) => {
    if (success) expand();
  });
  /** Drag-free way out, for anyone who cannot perform a pan. */
  const tapGrabber = Gesture.Tap().onEnd((_event, success) => {
    if (success) collapse(0);
  });

  const dockStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dockY.value }] }));
  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pillY.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return { dockStyle, pillStyle, contentStyle, dragDock, tapPill, tapGrabber };
}
