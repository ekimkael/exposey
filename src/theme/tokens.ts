/**
 * Design tokens for the Send Money screen.
 *
 * Two palettes share the same keys (light & dark). Components never import a
 * palette directly — they read the active one from `useTheme()` so the whole
 * tree re-themes together. Add a semantic key here (in BOTH palettes) rather
 * than inlining a colour.
 *
 * Reanimated worklets require plain string colours (no `PlatformColor`), so
 * these are intentionally static strings.
 */
export interface ThemeColors {
  /** App background. */
  background: string;
  /** Elevated card surface (recipient inner card). */
  surface: string;
  /** Muted block background (recipient outer block). */
  surfaceMuted: string;
  /** Keypad key background. */
  keypadKey: string;

  /** Primary foreground text. */
  text: string;
  /** Secondary/label text. */
  textMuted: string;
  /** Tertiary text, e.g. the account number. */
  textSubtle: string;
  /** Decimal/cents portion of the amount. */
  amountCents: string;

  /** Brand accent (pink) used by the header pill. */
  accent: string;
  /** Soft accent background behind the pill. */
  accentSoft: string;

  /** Error foreground (amount turns this colour when balance exceeded). */
  danger: string;
  /** Error banner background. */
  dangerSoft: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  keypadKey: '#F4F4F4',

  text: '#111111',
  textMuted: '#9A9A9A',
  textSubtle: '#444444',
  amountCents: '#B8B8B8',

  accent: '#E946A8',
  accentSoft: '#FCEAF5',

  danger: '#E0312A',
  dangerSoft: '#FFF0F0',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#2C2C2E',
  surfaceMuted: '#1C1C1E',
  keypadKey: '#2C2C2E',

  text: '#F5F5F5',
  textMuted: '#8A8A8E',
  textSubtle: '#C7C7CC',
  amountCents: '#5A5A5E',

  accent: '#F472C0',
  accentSoft: '#3A2230',

  danger: '#FF6961',
  dangerSoft: '#3A1E1E',
};
