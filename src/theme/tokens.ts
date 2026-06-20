/**
 * Design tokens for the Invest onboarding / auth flow.
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
  /** Elevated card surface. */
  surface: string;
  /** Muted block background (grouped rows, sheets). */
  surfaceMuted: string;
  /** Text field / OTP cell background. */
  inputBg: string;

  /** Primary foreground text. */
  text: string;
  /** Secondary/label text (subtitles). */
  textMuted: string;
  /** Tertiary text (placeholders, hints). */
  textSubtle: string;

  /** Brand accent (lime green) used by primary buttons and selection. */
  accent: string;
  /** Soft accent background (selected row tint). */
  accentSoft: string;
  /** Readable label colour on top of {@link accent} (dark in both themes). */
  accentText: string;

  /** Hairline divider / input border. */
  divider: string;
  /** Disabled button fill. */
  disabledBg: string;
  /** Disabled button label. */
  disabledText: string;

  /** Error foreground (OTP turns this colour on a wrong code). */
  danger: string;
  /** Error banner / cell background. */
  dangerSoft: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F6F3',
  inputBg: '#F4F5F2',

  text: '#0F1714',
  textMuted: '#9A9A9A',
  textSubtle: '#A8A8A8',

  accent: '#A4E057',
  accentSoft: '#EDF8DC',
  accentText: '#10210A',

  divider: '#ECECEC',
  disabledBg: '#EDEDED',
  disabledText: '#B8B8B8',

  danger: '#E0312A',
  dangerSoft: '#FDECEC',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceMuted: '#1C1C1E',
  inputBg: '#1C1C1E',

  text: '#F5F5F5',
  textMuted: '#8A8A8E',
  textSubtle: '#6E6E73',

  accent: '#A4E057',
  accentSoft: '#26331A',
  accentText: '#10210A',

  divider: '#2C2C2E',
  disabledBg: '#2C2C2E',
  disabledText: '#5A5A5E',

  danger: '#FF6961',
  dangerSoft: '#3A1E1E',
};
