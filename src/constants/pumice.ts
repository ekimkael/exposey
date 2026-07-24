/**
 * Metrics measured off the reference capture (720x720 @ 60fps, iPhone frame).
 * Screen spans x 111..613 in the source video => 502px for 402pt, ~1.2512 px/pt.
 * Every value below is the source measurement divided by that scale.
 */
export const Metrics = {
  page: { inset: 24, bottomRadius: 24 },
  tile: { width: 170, height: 190, radius: 16, gap: 12 },
  card: { height: 298, radius: 18, pad: 16, art: 46, artRadius: 12, action: 30 },
  dock: {
    height: 124,
    inset: 22,
    art: 52,
    artRadius: 12,
    artTop: 20,
    grabberTop: 11,
    textLeft: 87,
    progressTop: 69,
    airplay: 30,
    play: 31,
    buttonGap: 10,
    buttonRight: 26,
  },
  pill: {
    margin: 9,
    bottom: 45,
    height: 54,
    radius: 20,
    art: 34,
    artRadius: 8,
    artLeft: 10,
    textLeft: 56,
    textCenter: 22,
    progressTop: 40,
    progressRight: 92,
    airplay: 30,
    play: 31,
    buttonGap: 10,
    buttonRight: 12,
  },
} as const;

export const Palette = {
  page: '#FFFFFF',
  player: '#1A1A1A',
  control: '#323232',
  text: '#000000',
  textSecondary: '#6E6E73',
  onPlayerSecondary: '#8E8E93',
  track: 'rgba(255, 255, 255, 0.28)',
  scrim: 'rgba(255, 255, 255, 0.35)',
} as const;

/**
 * Timings read frame-by-frame off the reference (see README).
 * The swap is never a morph: nothing is shared between the two players.
 *
 * Collapse keeps the reference's pacing — the dock clears, the screen sits
 * empty, then the pill springs back. Expand is deliberately tighter: it
 * answers a finger, and half a second of no player reads as a bug.
 */
export const Motion = {
  outMs: 320,
  /** Expand: the dock starts rising this long after the pill starts leaving. */
  overlapMs: 120,
  /**
   * Collapse: dead air before the pill springs in. Tuned so the pill becomes
   * *visible* ~800ms after the dock starts leaving, matching the reference —
   * the gap on screen is shorter, since the spring covers its first few points
   * below the bottom edge.
   */
  gapMs: 500,
  /** Content bobs down this far mid-swap and returns. */
  bob: 46,
  spring: { damping: 22, stiffness: 220, mass: 1 },
  /** Fraction of the dock's height that must be dragged to commit to collapsing. */
  dismissRatio: 0.4,
  /** Downward flick that commits regardless of distance, in pt/s. */
  dismissVelocity: 600,
  /** Resistance applied when dragging the dock upward, where it cannot go. */
  rubberBand: 0.3,
} as const;

export const NowPlaying = {
  title: 'Rock that',
  artist: 'Flawor',
  /** Playhead position, static — this reproduction has no audio. */
  progress: 0.48,
} as const;
