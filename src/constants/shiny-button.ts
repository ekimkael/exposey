/**
 * @file shiny-button.ts
 * @description Geometry, palette and timings for {@link ShinyButton}, ported
 * from Ryan Mulligan's "Shiny call-to-action button"
 * (https://codepen.io/hexagoncircle/pen/MWMqXbK).
 *
 * Every value here traces back to a declaration in the original CSS; the
 * comments record which one, so the port can be re-checked against the pen
 * without re-deriving the maths.
 */
import { rect, rrect, vec } from '@shopify/react-native-skia';
import { Easing } from 'react-native-reanimated';

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */

/** Pill width in points (CSS `padding: 1.25rem 2.5rem` around the label). */
export const WIDTH = 300;
/** Pill height in points. */
export const HEIGHT = 68;
/** Border thickness (CSS `border: 1px` scaled for retina legibility). */
export const BORDER = 2;
/** Fully rounded ends (CSS `border-radius: 360px`). */
export const RADIUS = HEIGHT / 2;
/** Rotation origin for every sweep in the button. */
export const CENTER = vec(WIDTH / 2, HEIGHT / 2);

/* -------------------------------------------------------------------------- */
/* Palette                                                                     */
/* -------------------------------------------------------------------------- */

/** `--shiny-cta-bg` */
export const BG = '#000000';
/** `--shiny-cta-highlight` */
export const HIGHLIGHT = '#3d3dff';
/** `--gradient-shine` at rest (initial value: white). */
export const SHINE_REST = '#ffffff';
/** `--shiny-cta-highlight-subtle`, the shine colour while pressed. */
export const SHINE_ACTIVE = '#8484ff';

/* -------------------------------------------------------------------------- */
/* Timings                                                                     */
/* -------------------------------------------------------------------------- */

/** `--duration: 3s` — one revolution of the border sweep, always running. */
export const BASE_DURATION = 3000;
/**
 * The CSS composes a second, *reversed* animation at `--duration / 0.4` that is
 * `paused` until `:hover`. Adding a slower reverse spin to the base one nets a
 * slower rotation while pressed, which is what the pen actually does.
 */
export const BOOST_DURATION = BASE_DURATION / 0.4;
/** `--transition: 800ms cubic-bezier(0.25, 1, 0.5, 1)` */
export const TRANSITION_MS = 800;
export const EASING = Easing.bezier(0.25, 1, 0.5, 1);

/** `--gradient-percent`: 5% at rest, 20% while pressed. */
export const PERCENT_REST = 5;
export const PERCENT_ACTIVE = 20;
/** `--gradient-angle-offset`: 0deg at rest, 95deg while pressed. */
export const ANGLE_OFFSET_ACTIVE = 95;

/* -------------------------------------------------------------------------- */
/* Inner shimmer (`.shiny-cta::after`)                                         */
/* -------------------------------------------------------------------------- */

/**
 * The CSS `::after` is a square as wide as the button (`width: 100%;
 * aspect-ratio: 1`) centred on it, holding a `-50deg` linear gradient and
 * masked by `radial-gradient(circle at bottom, transparent 40%, black)`.
 *
 * `rotate: 360deg` spins the *element* — gradient and mask together — so the
 * lit crescent orbits the centre. Rotating only the gradient inside a static
 * mask makes it pulse in place instead, which is the bug this geometry fixes.
 */
export const SHIMMER_SIZE = WIDTH;
export const SHIMMER_X = CENTER.x - SHIMMER_SIZE / 2;
export const SHIMMER_Y = CENTER.y - SHIMMER_SIZE / 2;

/** Gradient opacity (`opacity: 0.6`). */
export const SHIMMER_OPACITY = 0.6;

const SHIMMER_ANGLE_RAD = -(50 * Math.PI) / 180;
/** `-50deg`: CSS 0deg points up and turns clockwise → dir = (sinθ, -cosθ). */
const SHIMMER_DIR = vec(Math.sin(SHIMMER_ANGLE_RAD), -Math.cos(SHIMMER_ANGLE_RAD));
/** Half the gradient line across a square at that angle: S·(|sinθ|+|cosθ|)/2. */
const SHIMMER_REACH = (SHIMMER_SIZE * (Math.abs(SHIMMER_DIR.x) + Math.abs(SHIMMER_DIR.y))) / 2;

export const SHIMMER_START = vec(
  CENTER.x - SHIMMER_DIR.x * SHIMMER_REACH,
  CENTER.y - SHIMMER_DIR.y * SHIMMER_REACH,
);
export const SHIMMER_END = vec(
  CENTER.x + SHIMMER_DIR.x * SHIMMER_REACH,
  CENTER.y + SHIMMER_DIR.y * SHIMMER_REACH,
);

/** Mask circle sits at the square's bottom edge, `farthest-corner` radius. */
export const SHIMMER_MASK_CENTER = vec(CENTER.x, SHIMMER_Y + SHIMMER_SIZE);
export const SHIMMER_MASK_RADIUS = Math.hypot(SHIMMER_SIZE / 2, SHIMMER_SIZE);
/** `transparent 40%, black` → hidden until 40% of the radius, then revealed. */
export const SHIMMER_MASK_STOPS = [0.4, 1];

/* -------------------------------------------------------------------------- */
/* Dot grid (`.shiny-cta::before`)                                             */
/* -------------------------------------------------------------------------- */

/**
 * `background-size: 4px` with a dot of radius `2px / 4`. At 8pt spacing the
 * field inked under 2% of the pill and read as pure black once the wedge mask
 * thinned it further — the grid has to match the CSS density to be visible.
 */
export const DOT_SPACING = 4;
export const DOT_RADIUS = 0.5;
/** `opacity: 0.4` */
export const DOT_OPACITY = 0.4;

/**
 * `mask-image: conic-gradient(from calc(var(--gradient-angle) + 45deg), black,
 * transparent 10% 90%, black)`. Only a ~72deg wedge is opaque, and it rotates
 * with the border sweep, so the dots are lit by the halo passing over them.
 * Expressed for a luminance mask: white reveals, black hides.
 */
export const DOT_MASK_COLORS = ['white', 'black', 'black', 'white'];
export const DOT_MASK_STOPS = [0, 0.1, 0.9, 1];
/** The wedge leads the border sweep by 45deg. */
export const DOT_MASK_LEAD_DEG = 45;

/* -------------------------------------------------------------------------- */
/* Text glow (`.shiny-cta span::before`)                                       */
/* -------------------------------------------------------------------------- */

/**
 * The CSS is an *inset* `box-shadow` on a box only slightly larger than the
 * label — a soft lift hugging the bottom of the text, not a wash over the
 * pill. Kept well under full opacity so the interior stays black and the
 * border ring keeps reading.
 */
export const GLOW_MAX_OPACITY = 0.26;
export const GLOW_RADIUS = WIDTH * 0.15;
export const GLOW_BLUR = 18;
/** Anchor point of the glow, at the bottom edge of the pill. */
export const GLOW_ORIGIN = vec(WIDTH / 2, HEIGHT);

/** `breathe` keyframes: `scale: 1` → `1.2` → `1` over `--duration * 1.5`. */
export const BREATHE_DURATION = BASE_DURATION * 1.5;
export const BREATHE_AMPLITUDE = 0.1;

/* -------------------------------------------------------------------------- */
/* Clipping                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `isolation: isolate` + `z-index: -1` puts the pseudo-elements above the
 * background but below the label, so they paint after the body fill and must
 * be clipped to it — otherwise they leak past the border.
 */
export const BODY_CLIP = rrect(
  rect(BORDER, BORDER, WIDTH - BORDER * 2, HEIGHT - BORDER * 2),
  RADIUS - BORDER,
  RADIUS - BORDER,
);
