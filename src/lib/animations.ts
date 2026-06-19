import type { SFSymbol } from 'sf-symbols-typescript';

/** Entry animation applied to the amount on each keystroke. */
export type AnimationStyle = 'pulse' | 'flip' | 'fade';

/** Menu metadata for each animation style (label + SF Symbol shown in the picker). */
export const ANIMATION_OPTIONS: Record<AnimationStyle, { label: string; icon: SFSymbol }> = {
  pulse: { label: 'Scale Pulse', icon: 'waveform' },
  flip: { label: 'Flip', icon: 'arrow.up.arrow.down' },
  fade: { label: 'Fondu', icon: 'eye' },
};
