import {
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

import {
  DEG_TO_RAD,
  FADE_FROM,
  FLAT_SCALE_FALLOFF,
  MAX_STEPS,
  PERSPECTIVE,
  RADIUS,
  STEP_DEG,
  STRIDE,
} from '@/constants/animation';

/**
 * Places one filmstrip entry on a cylinder, driven by the strip's scroll offset.
 *
 * The whole effect is one transform chain — `perspective` → `translateX` →
 * `rotateY` — evaluated on the UI thread once per frame per entry. Two details
 * carry it:
 *
 * 1. Faces land at `RADIUS * sin(angle)` rather than at their flat scroll
 *    position. That is what packs the outer entries together; rotating them in
 *    place would let the gaps grow as the faces foreshorten.
 * 2. `perspective` sits at the head of the chain, so it distorts each face into
 *    a trapezoid about its own centre while leaving `translateX` — which does
 *    not change z — unaffected.
 *
 * Under Reduce Motion both vestibular triggers (the 3D rotation and the
 * synthetic displacement) are dropped for a flat scale falloff that still
 * communicates which entry is centred. Scrolling itself is untouched: the
 * content tracks the finger, so it is direct manipulation, not synthetic motion.
 *
 * Note that Reanimated reads the Reduce Motion setting at app start and does
 * not re-render on change, so toggling it requires an app relaunch.
 *
 * @param index - Position of this entry in the strip.
 * @param scrollX - Live horizontal scroll offset of the strip, in points.
 * @returns An animated style holding the entry's `opacity` and transform chain.
 */
export function useCoverflowTransform(index: number, scrollX: SharedValue<number>) {
  const reduceMotion = useReducedMotion();

  return useAnimatedStyle(() => {
    const distance = index - scrollX.value / STRIDE;
    const fade =
      1 - Math.min(1, Math.max(0, (Math.abs(distance) - FADE_FROM) / (MAX_STEPS - FADE_FROM)));

    if (reduceMotion) {
      return {
        opacity: fade,
        transform: [{ scale: 1 - Math.min(Math.abs(distance), 1) * FLAT_SCALE_FALLOFF }],
      };
    }

    const steps = Math.min(Math.max(distance, -MAX_STEPS), MAX_STEPS);
    const angle = steps * STEP_DEG;

    return {
      opacity: fade,
      transform: [
        { perspective: PERSPECTIVE },
        { translateX: RADIUS * Math.sin(angle * DEG_TO_RAD) - distance * STRIDE },
        { rotateY: `${angle}deg` },
      ],
    };
  });
}
