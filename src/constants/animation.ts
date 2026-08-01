import { Easing } from 'react-native-reanimated';

/**
 * Geometry of the cylindrical coverflow filmstrip.
 *
 * Every value here was measured off the reference screen recording rather than
 * chosen by eye, using ratios that are independent of the video's pixel scale.
 * See the Geometry section of `README.md` for the derivation and the
 * measured-vs-predicted table. Changing any of them breaks the reproduction.
 */

/** Thumbnail edge length, in points. Reference measured 86.4 x 84.4pt. */
export const ITEM = 85;

/**
 * Scroll distance between two entries. Equals the fitted `RADIUS * STEP_rad`,
 * which is what makes the centre of the strip track the finger 1:1.
 */
export const STRIDE = 102;

/**
 * Cylinder arc consumed by one entry. Fitting `W * cos(distance * Δ)` against
 * the reference at one and two steps out gave 30.5° and 30.4° independently.
 */
export const STEP_DEG = 30.5;

export const DEG_TO_RAD = Math.PI / 180;

/**
 * Cylinder radius, derived rather than chosen: `RADIUS * STEP_rad === STRIDE`.
 * Any other radius and the carousel slides out from under the touch.
 */
export const RADIUS = STRIDE / (STEP_DEG * DEG_TO_RAD);

/** Viewer distance for the per-face perspective projection. */
export const PERSPECTIVE = 500;

/**
 * Entries stop turning at ~79° (`MAX_STEPS * STEP_DEG`). Parked faces stay on
 * screen — `RADIUS * sin` caps at `RADIUS`, which is inside the screen
 * half-width — so they are faded out over the last quarter step rather than
 * cut, which would pop a visible sliver at the edge.
 */
export const MAX_STEPS = 2.6;
export const FADE_FROM = 2.35;

/** Reduce Motion: scale drop one step out from centre, standing in for foreshortening. */
export const FLAT_SCALE_FALLOFF = 0.08;

/** Height of the strip's scroll viewport. Tallest near-edge face is ~92pt. */
export const STRIP_HEIGHT = 100;

/** Press feedback: 0.97 scale, subtle enough to acknowledge without bouncing. */
export const PRESS_SCALE_DROP = 0.03;

/** Strong ease-out — the response should be quickest where the eye is watching. */
export const PRESS_TIMING = { duration: 160, easing: Easing.bezier(0.23, 1, 0.32, 1) };
