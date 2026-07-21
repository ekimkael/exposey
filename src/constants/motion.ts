import { Easing } from 'react-native-reanimated';

/**
 * Shared motion tokens so easings/durations don't drift between components.
 * EASE_OUT is the strong ease-out (cubic-bezier(0.23, 1, 0.32, 1)) — built-in
 * eases are too soft for deliberate entrances.
 */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export const Duration = {
  enter: 560,
  pressIn: 120,
  pressOut: 160,
} as const;
