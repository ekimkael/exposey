import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
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

/**
 * Accelerating exit, measured off the reference: the departing player starts
 * slow and picks up speed. Deliberately not the ease-out that UI exits usually
 * want — see README.
 */
const EXIT_EASING = Easing.in(Easing.cubic);

const OUT = { duration: Motion.outMs, easing: EXIT_EASING } as const;
const BOB_OUT = { duration: Motion.overlapMs, easing: EXIT_EASING } as const;

/**
 * Reduced motion turns the swap into a crossfade in place. `reduceMotion:
 * Never` is load-bearing: without it this timing would itself be disabled by
 * the system setting and the fade would jump, leaving a hard cut between two
 * very differently shaped players.
 */
const FADE = { duration: 150, reduceMotion: ReduceMotion.Never } as const;

const PRESS = { duration: 160, easing: Easing.out(Easing.cubic) } as const;

/**
 * Drives the pill <-> dock swap. The pill is the resting state: tapping or
 * swiping it up expands to the dock, dragging the dock down collapses back.
 * Both players stay mounted and only ever translate, so nothing here lays out.
 */
export function usePlayerSwap() {
  const reduced = useReducedMotion();

  const dockY = useSharedValue(DOCK_OUT);
  const pillY = useSharedValue(0);
  const bob = useSharedValue(0);
  const dockOpacity = useSharedValue(1);
  const pillOpacity = useSharedValue(1);
  const pillPress = useSharedValue(1);
  const dragFrom = useSharedValue(0);
  /** Gates both transitions so a repeat trigger cannot restart a `withDelay`. */
  const expanded = useSharedValue(false);

  /** Tap on the pill: the dock starts rising before the pill has finished leaving. */
  function expand() {
    'worklet';
    if (expanded.value) return;
    expanded.value = true;
    if (reduced) {
      pillY.value = PILL_OUT;
      dockY.value = 0;
      bob.value = 0;
      dockOpacity.value = 0;
      dockOpacity.value = withTiming(1, FADE);
      return;
    }
    pillY.value = withTiming(PILL_OUT, OUT);
    dockY.value = withDelay(Motion.overlapMs, withSpring(0, Motion.spring));
    bob.value = withSequence(withTiming(Motion.bob, BOB_OUT), withSpring(0, Motion.spring));
  }

  /**
   * Commit to the pill. `velocity` carries the finger's momentum through the
   * release so the dock does not stall the moment the gesture ends. Content
   * stays where the drag left it until the pill comes back for it.
   */
  function collapse(velocity: number) {
    'worklet';
    if (!expanded.value) return;
    expanded.value = false;
    if (reduced) {
      dockY.value = DOCK_OUT;
      pillY.value = 0;
      bob.value = 0;
      pillOpacity.value = 0;
      pillOpacity.value = withTiming(1, FADE);
      return;
    }
    dockY.value = withSpring(DOCK_OUT, { ...Motion.spring, velocity });
    pillY.value = withDelay(Motion.gapMs, withSpring(0, Motion.spring));
    bob.value = withDelay(Motion.gapMs, withSpring(0, Motion.spring));
  }

  /** Not far enough, not fast enough: put the dock back. Leaves `expanded` alone. */
  function settleBack(velocity: number) {
    'worklet';
    if (reduced) {
      dockY.value = 0;
      bob.value = 0;
      return;
    }
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
      if (raw < 0) {
        // Asymptotic resistance: the harder it is pulled up, the less it gives,
        // converging on `limit` so the sheet never leaves its own slot.
        const pull = -raw;
        const limit = Metrics.dock.height;
        dockY.value = -(pull * Motion.rubberBand * limit) / (pull * Motion.rubberBand + limit);
      } else {
        dockY.value = raw;
      }
      bob.value = Math.min(Math.max(dockY.value, 0) / Metrics.dock.height, 1) * Motion.bob;
    })
    .onEnd((event) => {
      const pulledFar = dockY.value > Metrics.dock.height * Motion.dismissRatio;
      const thrown = event.velocityY > Motion.throwVelocity;
      if (pulledFar || thrown) {
        collapse(event.velocityY);
      } else {
        settleBack(event.velocityY);
      }
    });

  // ponytail: fires expand() on release rather than tracking the finger through
  // the whole swap. Upgrade path if it feels disconnected: drive dockY/pillY
  // from translationY the way dragDock does, and commit on the same thresholds.
  const swipePillUp = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onEnd((event) => {
      const swipedUp = -event.translationY > Metrics.pill.height * Motion.dismissRatio;
      const flickedUp = -event.velocityY > Motion.expandVelocity;
      if (swipedUp || flickedUp) expand();
    });

  /**
   * Exclusive, not Race: the pan gets priority and the tap only fires once the
   * pan has failed to activate. Under Race the tap wins the arbitration and the
   * upward swipe is never recognised.
   */
  const tapPill = Gesture.Exclusive(
    swipePillUp,
    Gesture.Tap()
      .onBegin(() => {
        pillPress.value = withTiming(0.98, PRESS);
      })
      .onFinalize(() => {
        pillPress.value = withTiming(1, PRESS);
      })
      .onEnd((_event, success) => {
        if (success) expand();
      })
  );

  /** Drag-free way out, for anyone who cannot perform a pan. */
  const tapGrabber = Gesture.Tap().onEnd((_event, success) => {
    if (success) collapse(0);
  });

  const dockStyle = useAnimatedStyle(() => ({
    opacity: dockOpacity.value,
    transform: [{ translateY: dockY.value }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateY: pillY.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const pillPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pillPress.value }] }));

  return { dockStyle, pillStyle, contentStyle, pillPressStyle, dragDock, tapPill, tapGrabber };
}
