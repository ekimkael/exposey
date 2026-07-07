/** Duration of the floating-label float/settle animation, in ms. */
export const FIELD_LABEL_ANIM_MS = 150;

/** Label translateY when floated to the top of the field, in points. */
export const LABEL_FLOAT_TRANSLATE_Y = -11;

/** Label scale when floated (shrinks to this fraction of its resting size). */
export const LABEL_FLOAT_SCALE = 0.78;

/** Fallback duration for the keyboard show/hide animation, in ms — used
 * only if the native event doesn't report its own `duration` (rare, but
 * technically allowed by the Keyboard event contract). */
export const DEFAULT_KEYBOARD_ANIM_MS = 250;

/** Hero container height when the keyboard is fully shown, as a fraction
 * of its resting height. */
export const HERO_SHRINK_HEIGHT_RATIO = 0.42;

/** Card-stack visual scale when the keyboard is fully shown. */
export const HERO_SHRINK_SCALE = 0.45;

/** Rotation every fanned card converges to when the keyboard is fully
 * shown — they close from their fanned angles (see `CARD_FAN` in
 * constants/cards.ts) into this single shared angle, like a wallet's card
 * fan folding back into a neat, parallel stack. */
export const CARD_FOCUS_ROTATE = '90deg';
