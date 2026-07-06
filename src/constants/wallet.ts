import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Colors, copy, and content types for the wallet case. Animation and sheet
 * dimensions live in `constants/animation.ts`.
 *
 * Colors are sampled directly from the reference video (the Family wallet)
 * and kept separate from the app-wide `Colors` in `theme.ts` because these
 * are literal values pulled from the design being reproduced, not theme
 * tokens.
 */
export const WALLET_COLORS = {
  screenBackground: '#F4F3F6',
  cardOrange: '#E68A00',
  sheetSurface: '#FFFFFF',
  optionRow: '#F7F5F9',
  removeRow: '#FBE9E6',
  destructive: '#E5484D',
  revealBlue: '#00B3FB',
  cancelButton: '#F2F2F3',
  primaryText: '#161616',
  mutedText: '#9F9FA5',
  mutedIcon: '#B0B0B6',
  optionRowIcon: '#7A7A80',
  /** Same gray as the native header X so the in-sheet X reads identically. */
  closeGlyph: '#8E8E93',
} as const;

/**
 * Stand-in for SwiftUI's `.infinity` maxWidth. The `@expo/ui` `frame`
 * modifier takes a number, so a very large value is used to mean "fill the
 * available width".
 */
export const FILL_AVAILABLE_WIDTH = 100000;

/** Which pane the morphing sheet is currently showing. */
export type SheetView = 'options' | 'privateKey' | 'recoveryPhrase';

/** The detail panes — every sheet view except the Options list. */
export type DetailKind = Exclude<SheetView, 'options'>;

/** Text content for each detail pane, keyed by {@link DetailKind}. */
export const DETAIL_COPY: Record<
  DetailKind,
  { title: string; description: string; leadBullet: string }
> = {
  privateKey: {
    title: 'Private Key',
    description:
      'Your Private Key is the key used to back up your wallet. Keep it secret and secure at all times.',
    leadBullet: 'Keep your Private Key safe',
  },
  recoveryPhrase: {
    title: 'Secret Recovery Phrase',
    description:
      'Your Secret Recovery Phrase is the key used to back up your wallet. Keep it secret and secure at all times.',
    leadBullet: 'Keep your Secret Phrase safe',
  },
};

/** Bullets shown after each pane's lead bullet; identical for both panes. */
export const SHARED_BULLETS = [
  "Don't share it with anyone else",
  "If you lose it, we can't recover it",
] as const;

/** SF Symbols for the three detail bullets, in display order. */
export const BULLET_ICONS: readonly SFSymbol[] = ['checkmark.shield', 'square.and.pencil', 'nosign'];

/** Hero SF Symbol shown at the top of each detail pane. */
export const DETAIL_HERO_ICON: Record<DetailKind, SFSymbol> = {
  privateKey: 'creditcard.viewfinder',
  recoveryPhrase: 'circle.grid.3x3',
};
