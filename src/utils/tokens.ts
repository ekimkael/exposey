/** Shared design tokens for the onboarding carousel. */

export const COLORS = {
  background: '#000',
  text: '#fff',
  textMuted: 'rgba(255,255,255,0.72)',
  dotTrack: 'rgba(255,255,255,0.28)',
  dotFill: '#fff',
  buttonBackground: '#fff',
  buttonText: '#000',
} as const;

export const FONT_SIZE = {
  heading: 28,
  subtitle: 18,
  button: 20,
  link: 18,
} as const;

/** SVG mockup bleeds past the viewport edges for a subtle depth effect. */
export const IMAGE_WIDTH_FACTOR = 1.08;
