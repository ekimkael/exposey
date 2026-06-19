/**
 * Design tokens for the Send Money screen.
 *
 * Centralises every literal colour so screens/components never hard-code hex
 * values. Add a semantic entry here rather than inlining a new colour.
 *
 * Reanimated worklets require plain string colours (no `PlatformColor`), so
 * these are intentionally static.
 */
export const colors = {
  /** Primary foreground text (near-black). */
  text: '#111111',
  /** Secondary/label text (grey). */
  textMuted: '#9A9A9A',
  /** Tertiary text, e.g. the account number. */
  textSubtle: '#444444',
  /** Decimal/cents portion of the amount (light grey). */
  amountCents: '#B8B8B8',

  /** App background and inner card surface. */
  surface: '#FFFFFF',
  /** Recipient block background (very light grey). */
  surfaceMuted: '#F5F5F5',
  /** Keypad key background. */
  keypadKey: '#F4F4F4',

  /** Brand accent (pink) used by the header pill. */
  accent: '#E946A8',
  /** Soft accent background behind the pill. */
  accentSoft: '#FCEAF5',

  /** Error foreground (amount turns this colour when balance exceeded). */
  danger: '#E0312A',
  /** Error banner background. */
  dangerSoft: '#FFF0F0',
} as const;
