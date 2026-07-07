export const ONYX_COLORS = {
  backgroundTop: '#332920',
  backgroundBottom: '#0a0908',
  cardGold: ['#f6e6b4', '#c9a153'] as const,
  cardSilver: ['#f5f6f8', '#a3a9b1'] as const,
  cardBlack: ['#3c3c40', '#0e0e10'] as const,
  wordmarkGold: 'rgba(122, 90, 34, 0.85)',
  wordmarkSilver: 'rgba(90, 96, 104, 0.85)',
  wordmarkBlack: 'rgba(255, 255, 255, 0.08)',
  visaText: 'rgba(198, 202, 208, 0.85)',
  title: '#ffffff',
  subtitle: 'rgba(255, 255, 255, 0.55)',
  fieldBackground: 'rgba(255, 255, 255, 0.06)',
  fieldBorder: 'rgba(255, 255, 255, 0.12)',
  fieldBorderFocused: 'rgba(255, 255, 255, 0.45)',
  fieldLabel: 'rgba(255, 255, 255, 0.45)',
  fieldText: '#ffffff',
  buttonDisabled: 'rgba(210, 212, 216, 0.55)',
  buttonEnabled: '#e7e9ec',
  buttonTextDisabled: 'rgba(20, 20, 22, 0.5)',
  buttonTextEnabled: '#141416',
} as const;

export const ONYX_COPY = {
  title: 'Welcome back',
  subtitle: 'Log into your Slash account',
  emailPlaceholder: 'Email address',
  passwordPlaceholder: 'Password',
  signIn: 'Sign in',
} as const;

export const CARD_SIZE = { width: 220, height: 138 } as const;

export const CARD_FAN = [
  { colors: ONYX_COLORS.cardGold, wordmark: ONYX_COLORS.wordmarkGold, rotate: '-8deg', translateX: 0, translateY: 0 },
  { colors: ONYX_COLORS.cardSilver, wordmark: ONYX_COLORS.wordmarkSilver, rotate: '4deg', translateX: 20, translateY: 44 },
  { colors: ONYX_COLORS.cardBlack, wordmark: ONYX_COLORS.wordmarkBlack, rotate: '18deg', translateX: 40, translateY: 86 },
] as const;

export const FIELD_LABEL_ANIM_MS = 150;
