/**
 * Visual constants for the reading-log screen, measured off the reference
 * recording. The screen is dark-only, matching the reference.
 */

export const COLORS = {
  background: '#000',
  foreground: '#fff',
} as const;

/** Layout metrics, in points. */
export const LAYOUT = {
  /** Standard iOS navigation bar height. */
  headerHeight: 44,
  headerPaddingHorizontal: 16,
  /** Side inset on the hero — the reference leaves ~12.4% of the screen each side. */
  heroInset: 50,
  /** Hero aspect ratio, measured 297 x 433pt. */
  heroAspect: 0.688,
  heroRadius: 20,
  thumbnailRadius: 10,
  /** Vertical rhythm between header, hero, date and strip. */
  gap: 20,
  /** Empty space the reference leaves under the strip. */
  stripBottomGap: 73,
} as const;

/** Type scale. Header uses the iOS standard 17pt semibold. */
export const TYPE = {
  title: { fontSize: 17, fontWeight: '600' },
  date: { fontSize: 16 },
} as const;
