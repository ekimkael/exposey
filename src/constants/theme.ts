/**
 * Screen-level palette and the onboarding background gradient. Card-internal
 * decorative colours live with their StyleSheet in onboarding-cards.tsx, since
 * they are one-off mockup details rather than shared brand tokens.
 */
export const Colors = {
  /** Headings, brand wordmark, button label. */
  textPrimary: '#FFFFFF',
  /** "Welcome to" and the subtitle. */
  textMuted: '#8C938C',
  /** Root background behind the gradient. */
  background: '#0A120E',
} as const;

/** Vertical dark-green gradient of the onboarding backdrop (colours + stop positions). */
export const BackgroundGradient = {
  colors: ['#091311', '#0C1A15', '#1B3020', '#294A2E', '#132019', '#0A120E'] as const,
  locations: [0, 0.28, 0.5, 0.68, 0.86, 1] as const,
};
