import { Easing } from 'react-native-reanimated';

/**
 * Shared motion tokens. Centralising them keeps easings, durations and travel
 * distances from drifting between the entrance, the card float and the button
 * press. All values are the ones tuned against the reference screen — changing
 * one changes the feel everywhere it is used.
 */

/** Strong ease-out (cubic-bezier(0.23, 1, 0.32, 1)) — built-in eases are too soft for deliberate entrances. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** Symmetric in-out sine — the pendulum curve for the perpetual idle bob. */
export const EASE_SINE = Easing.inOut(Easing.sin);

export const Motion = {
  /** Timing durations in milliseconds. */
  duration: {
    /** Entrance fade + slide-up (header items and cards). */
    enter: 560,
    /** Button scale-down on press-in. */
    pressIn: 120,
    /** Button scale-back on press-out. */
    pressOut: 160,
  },
  /** Slide-up distance (px) an element travels during its entrance. */
  travel: {
    header: 18,
    card: 26,
  },
  /** Scale the Apple button shrinks to while pressed. */
  pressScale: 0.96,
  /** Card entrance stagger: card N starts at enterDelayBase + N * enterStagger (ms). */
  card: {
    enterDelayBase: 300,
    enterStagger: 110,
  },
  /** Perpetual idle bob: peak-to-peak = amplitude * 2 (px); each card is slightly de-phased. */
  bob: {
    amplitude: 4,
    durationBase: 2600,
    durationStep: 180,
    delayStep: 260,
  },
} as const;
