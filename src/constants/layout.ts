/**
 * Shared layout + motion constants for the music UI.
 *
 * Structural values (ratios, gaps, radii, control sizes, animation timings) are
 * named here so the screens read declaratively and a single tweak propagates.
 * Purely typographic values (font sizes, letter spacing) stay inline at their
 * call sites, as is idiomatic for React Native styles.
 */

/** Layout dimensions, in points unless noted as a ratio. */
export const layout = {
  /** The Featured feed. */
  feed: {
    /** Horizontal padding around the card column. */
    horizontalPadding: 10,
    /** Vertical gap between successive cards. */
    cardGap: 16,
    /** Card height as a fraction of the area below the header (leaves a peek). */
    cardHeightRatio: 0.84,
  },
  /** A playlist card. */
  card: {
    /** Corner radius of the card surface. */
    radius: 28,
    /** Inset of the overlaid author row / controls from the card edge. */
    inset: 18,
  },
  /** The detail screen. */
  detail: {
    /** Hero height as a fraction of the screen height. */
    heroHeightRatio: 0.9,
    /** Scroll fraction of the hero at which the solid sticky header takes over. */
    stickyTriggerRatio: 0.64,
  },
  /** Shared control sizes. */
  control: {
    /** Diameter of the small round transport buttons. */
    roundSize: 44,
    /** Diameter of the central play button. */
    playSize: 62,
  },
} as const;

/** Entering-animation timings, in milliseconds. */
export const motion = {
  /** Hero header text reveal (fade + slide). */
  reveal: 260,
  /** Avatar / "+" badge pop (zoom). */
  pop: 220,
  /** Card title + stats reveal when the card becomes active. */
  cardReveal: 420,
  /** Per-row delay for the staggered tracklist reveal. */
  trackStagger: 28,
  /** Cap on the number of tracklist rows that stagger before they appear together. */
  trackStaggerCap: 8,
} as const;
