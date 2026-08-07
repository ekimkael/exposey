/**
 * @file use-shiny-button-animation.ts
 * @description Drives every moving part of {@link ShinyButton}. The component
 * itself only renders — all shared values, the frame loop and the press
 * transitions live here.
 *
 * Everything runs on the UI thread: one `useFrameCallback` worklet advances the
 * angles, and each visual property is a `useDerivedValue` off those. Nothing
 * calls `setState` per frame.
 */
import { useCallback, useMemo } from 'react';
import {
  interpolateColors,
  type SkPath,
  Skia,
  type Transforms3d,
} from '@shopify/react-native-skia';
import {
  type DerivedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  ANGLE_OFFSET_ACTIVE,
  BASE_DURATION,
  BOOST_DURATION,
  BREATHE_AMPLITUDE,
  BREATHE_DURATION,
  DOT_MASK_LEAD_DEG,
  DOT_RADIUS,
  DOT_SPACING,
  EASING,
  GLOW_MAX_OPACITY,
  HEIGHT,
  HIGHLIGHT,
  PERCENT_ACTIVE,
  PERCENT_REST,
  SHINE_ACTIVE,
  SHINE_REST,
  TRANSITION_MS,
  WIDTH,
} from '@/constants/shiny-button';

const DEGREES_PER_TURN = 360;
/** Fallback frame delta (~60fps) for the very first frame. */
const FRAME_FALLBACK_MS = 16;

/**
 * Degrees → radians. Must carry the `worklet` directive: it is called from
 * inside `useDerivedValue` bodies, which run on the UI thread and cannot
 * synchronously call a plain JS function.
 */
const toRadians = (degrees: number) => {
  'worklet';
  return (degrees * Math.PI) / 180;
};

/**
 * What `interpolateColors` actually produces: a CSS string on some platforms,
 * an RGBA tuple on others. `DerivedValue` is invariant, so the shared value has
 * to be declared with exactly this union rather than a wider `Color`.
 */
type SweepColors = (string | number[])[];

export interface ShinyButtonAnimation {
  /** Colour stops of the border sweep; the shine shifts hue while pressed. */
  borderColors: DerivedValue<SweepColors>;
  /** Stop offsets of the border sweep; the lit band widens while pressed. */
  borderPositions: DerivedValue<number[]>;
  /** Rotation of the border sweep, including the pressed angle offset. */
  borderTransform: DerivedValue<Transforms3d>;
  /** Rotation of the inner shimmer (gradient and mask together). */
  shimmerTransform: DerivedValue<Transforms3d>;
  /** Rotation of the wedge that reveals the dot grid. */
  dotMaskTransform: DerivedValue<Transforms3d>;
  /** Opacity of the text glow, 0 at rest. */
  glowOpacity: DerivedValue<number>;
  /** Continuous "breathing" pulse applied to the text glow. */
  glowTransform: DerivedValue<Transforms3d>;
  /** The dot grid, prebuilt as a single path. */
  dotPath: SkPath;
  handlePressIn: () => void;
  handlePressOut: () => void;
}

/**
 * Builds the animated values behind the shiny button.
 *
 * Two angles are accumulated rather than composed as CSS animations: a base
 * spin that always runs, plus a slower reverse spin that only advances while
 * pressed. Summing them reproduces the pen's `animation-composition: add`
 * without needing two paused/running animations.
 *
 * @returns Derived values wired straight into the Skia tree, plus the press
 * handlers that drive the rest/active transition.
 */
export function useShinyButtonAnimation(): ShinyButtonAnimation {
  /** Whether the finger is currently down; read inside the frame worklet. */
  const isPressed = useSharedValue(false);
  /** Rest → active progress, 0..1, eased over {@link TRANSITION_MS}. */
  const activation = useSharedValue(0);
  /** Ever-advancing base rotation, in degrees. */
  const baseAngle = useSharedValue(0);
  /** Reverse rotation that only accumulates while pressed, in degrees. */
  const boostAngle = useSharedValue(0);
  /** Elapsed time within the breathe cycle, in ms. */
  const breathe = useSharedValue(0);

  useFrameCallback((frame) => {
    'worklet';
    const delta = frame.timeSincePreviousFrame ?? FRAME_FALLBACK_MS;
    baseAngle.value = (baseAngle.value + (delta / BASE_DURATION) * DEGREES_PER_TURN) % 360;
    breathe.value = (breathe.value + delta) % BREATHE_DURATION;
    if (isPressed.value) {
      boostAngle.value -= (delta / BOOST_DURATION) * DEGREES_PER_TURN;
    }
  }, true);

  /** Rotation shared by the shimmer and the dot wedge. */
  const spinAngle = useDerivedValue(() => baseAngle.value + boostAngle.value);

  /** The border additionally picks up `--gradient-angle-offset` when pressed. */
  const borderAngle = useDerivedValue(
    () => spinAngle.value - activation.value * ANGLE_OFFSET_ACTIVE,
  );

  const borderPositions = useDerivedValue(() => {
    const percent =
      (PERCENT_REST + activation.value * (PERCENT_ACTIVE - PERCENT_REST)) / 100;
    return [0, percent, percent * 2, percent * 3, Math.min(percent * 4, 1)];
  });

  const borderColors = useDerivedValue(() => {
    const shine = interpolateColors(activation.value, [0, 1], [SHINE_REST, SHINE_ACTIVE]);
    return ['transparent', HIGHLIGHT, shine, HIGHLIGHT, 'transparent'];
  });

  const borderTransform = useDerivedValue<Transforms3d>(() => [
    { rotate: toRadians(borderAngle.value) },
  ]);

  const shimmerTransform = useDerivedValue<Transforms3d>(() => [
    { rotate: toRadians(spinAngle.value) },
  ]);

  const dotMaskTransform = useDerivedValue<Transforms3d>(() => [
    { rotate: toRadians(spinAngle.value + DOT_MASK_LEAD_DEG) },
  ]);

  const glowOpacity = useDerivedValue(() => activation.value * GLOW_MAX_OPACITY);

  const glowTransform = useDerivedValue<Transforms3d>(() => {
    const phase = breathe.value / BREATHE_DURATION;
    const scale = 1 + BREATHE_AMPLITUDE * (1 - Math.cos(2 * Math.PI * phase));
    return [{ scale }];
  });

  /*
   * The React Compiler's immutability rule does not model Reanimated shared
   * values, which are mutable refs by design — assigning `.value` from an event
   * handler is their documented usage, not a render-time mutation. The rule is
   * disabled for these two handlers only.
   */
  /* eslint-disable react-hooks/immutability */
  const handlePressIn = useCallback(() => {
    isPressed.value = true;
    activation.value = withTiming(1, { duration: TRANSITION_MS, easing: EASING });
  }, [isPressed, activation]);

  const handlePressOut = useCallback(() => {
    isPressed.value = false;
    activation.value = withTiming(0, { duration: TRANSITION_MS, easing: EASING });
  }, [isPressed, activation]);
  /* eslint-enable react-hooks/immutability */

  /** Built once: ~1300 dots as a single path, so they cost one draw call. */
  const dotPath = useMemo(() => {
    const path = Skia.Path.Make();
    for (let y = DOT_SPACING / 2; y < HEIGHT; y += DOT_SPACING) {
      for (let x = DOT_SPACING / 2; x < WIDTH; x += DOT_SPACING) {
        path.addCircle(x, y, DOT_RADIUS);
      }
    }
    return path;
  }, []);

  return {
    borderColors,
    borderPositions,
    borderTransform,
    shimmerTransform,
    dotMaskTransform,
    glowOpacity,
    glowTransform,
    dotPath,
    handlePressIn,
    handlePressOut,
  };
}
