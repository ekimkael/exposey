import { ONYX_COLORS } from '@/constants/theme';

/** Single credit-card face dimensions, in points. */
export const CARD_SIZE = { width: 220, height: 138 } as const;

/** Canvas the fanned cards render into — generous on purpose so the rotated
 * cards' bounding boxes never clip (see CARD_FAN rotations below). */
export const HERO_STAGE = { width: 320, height: 270 } as const;

/** A card face's position: `rotate` in degrees-as-a-string (RN transform
 * format), `translateX`/`translateY` in points. */
export interface CardTransform {
  rotate: string;
  translateX: number;
  translateY: number;
}

/** The three card faces, back to front. Each card is absolutely positioned
 * at the stage's origin, then offset/rotated — animating between two named
 * states (see `useKeyboardShrink`):
 * - `resting`: fanned out, each card rotated further and offset further
 *   down-right than the last.
 * - `focused`: horizontal (rotate 0) and stacked tightly, so only each
 *   back card's top edge ("head") peeks above the one in front of it —
 *   like a wallet's card stack closing. `focused.translateY` steps by 20pt
 *   per card — enough for the peek to read clearly at HERO_SHRINK_SCALE. */
export const CARD_FAN = [
  {
    colors: ONYX_COLORS.cardGold,
    wordmark: ONYX_COLORS.wordmarkGold,
    resting: { rotate: '-8deg', translateX: 16, translateY: 16 },
    focused: { rotate: '0deg', translateX: 20, translateY: 0 },
  },
  {
    colors: ONYX_COLORS.cardSilver,
    wordmark: ONYX_COLORS.wordmarkSilver,
    resting: { rotate: '4deg', translateX: 36, translateY: 62 },
    focused: { rotate: '0deg', translateX: 20, translateY: 20 },
  },
  {
    colors: ONYX_COLORS.cardBlack,
    wordmark: ONYX_COLORS.wordmarkBlack,
    resting: { rotate: '18deg', translateX: 56, translateY: 106 },
    focused: { rotate: '0deg', translateX: 20, translateY: 40 },
  },
] as const;
