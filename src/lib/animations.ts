import type { SFSymbol } from 'sf-symbols-typescript';

/** Entry animation applied to the amount on each keystroke. */
export type AnimationStyle = 'pulse' | 'flip' | 'fade';

/**
 * Display metadata for each animation style.
 *
 * Consumed by {@link HeaderMenu} to render the animation picker automatically —
 * adding a new style here is sufficient; no other file change is needed.
 */
export const ANIMATION_OPTIONS: Record<AnimationStyle, { label: string; icon: SFSymbol }> = {
  pulse: { label: 'Scale Pulse', icon: 'waveform' },
  flip:  { label: 'Flip',        icon: 'arrow.up.arrow.down' },
  fade:  { label: 'Fade',        icon: 'eye' },
};
