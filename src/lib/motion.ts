import { Easing } from 'react-native-reanimated';

/**
 * Shared motion tokens.
 *
 * Every animation in the app pulls its curve, duration and spring from here
 * rather than hand-typing values, so the whole product moves with one
 * personality. Add a semantic key here instead of inlining a number at a call
 * site.
 *
 * @example
 * withTiming(1, { duration: duration.short, easing: easing.out });
 */

/** Durations in milliseconds. UI animations stay under 300ms. */
export const duration = {
  /** Press feedback — top of the 100–160ms budget. */
  press: 160,
  /** Small entrances: fades, glyphs, inline state changes. */
  short: 200,
  /** Colour fills and on-screen morphs. */
  medium: 260,
  /** Rare, first-run celebration moments. */
  celebration: 420,
} as const;

/** Easing curves. Default to {@link easing.out} for anything entering or exiting. */
export const easing = {
  /** Strong ease-out — starts fast, feels responsive. The default for UI. */
  out: Easing.bezier(0.23, 1, 0.32, 1),
  /** Strong ease-in-out — for elements moving/morphing while already on screen. */
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
} as const;

/**
 * Spring configs. Reanimated expresses bounce as `dampingRatio = 1 - bounce`,
 * so a bounce of 0.2 is `dampingRatio: 0.8`.
 */
export const spring = {
  /** Press and settle — high damping, no visible second bounce. */
  press: { duration: 260, dampingRatio: 0.9 },
  /** Apple-style default (bounce 0.2) for standard interactive motion. */
  standard: { duration: 500, dampingRatio: 0.8 },
  /** Visible bounce (0.35) reserved for rare, high-emotion moments. */
  celebration: { duration: 520, dampingRatio: 0.65 },
} as const;

/** Scale applied while a surface is held. Subtle end of the 0.95–0.98 range. */
export const pressScale = 0.97;
