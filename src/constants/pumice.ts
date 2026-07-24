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

/**
 * Layered rather than single shadows: a tight contact layer, a mid, and a wide
 * ambient one. A single flat shadow reads as a sticker; three transparent
 * layers read as a surface with air underneath it.
 */
export const Elevation = {
  /** Anchored to the bottom edge, so it casts upward onto the page. */
  dock: '0px -1px 3px rgba(0, 0, 0, 0.06), 0px -8px 20px rgba(0, 0, 0, 0.10), 0px -20px 48px rgba(0, 0, 0, 0.10)',
  /** Floating clear of the edge, so it casts down and out. */
  pill: '0px 1px 2px rgba(0, 0, 0, 0.08), 0px 6px 16px rgba(0, 0, 0, 0.14), 0px 16px 32px rgba(0, 0, 0, 0.10)',
} as const;

export const Palette = {
  /**
   * iOS systemGroupedBackground. The native `List` paints its own grouped
   * background and offers no modifier to hide it, so the page adopts that colour
   * instead of fighting it.
   */
  page: '#F2F2F7',
  player: '#1A1A1A',
  control: '#323232',
  text: '#000000',
  textSecondary: '#6E6E73',
  onPlayerSecondary: '#8E8E93',
  track: 'rgba(255, 255, 255, 0.28)',
  scrim: 'rgba(255, 255, 255, 0.35)',
  /** Row icons pick up the app's tint, the way a native Library screen does. */
  accent: '#FF2D55',
  chevron: '#C4C4C6',
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
  /**
   * Downward release velocity that commits regardless of distance, in pt/s.
   *
   * The audit playbook prescribes an average rate of 0.11 pt/ms across the whole
   * gesture, which needs a clock inside the gesture worklet. This uses the
   * recogniser's own `velocityY` instead: same intent, one fewer assumption, and
   * no dependence on how the touch stream is delivered. 350 sits between the
   * playbook's equivalent (110 pt/s) and the 600 that was previously so strict
   * it never fired.
   *
   * Not verified on a real flick: synthetic slow drags fragment in the simulator,
   * so neither this nor the rate metric could be exercised. Needs a real finger.
   */
  throwVelocity: 350,
  /**
   * Upward flick on the pill that expands regardless of distance, in pt/s.
   * Instantaneous rather than whole-gesture: expanding is non-destructive, so
   * it can afford to be the more forgiving of the two tests.
   */
  expandVelocity: 300,
  /**
   * Rubber-band coefficient for upward drags, where the dock cannot go. Travel
   * follows (d·c·L)/(d·c + L) and converges on L = the dock's height, so the
   * sheet resists harder the further it is pulled and never leaves its slot.
   * 0.55 is the coefficient UIScrollView uses.
   */
  rubberBand: 0.55,
} as const;

export const NowPlaying = {
  title: 'Rock that',
  artist: 'Flawor',
  /** Playhead position, static — this reproduction has no audio. */
  progress: 0.48,
} as const;
