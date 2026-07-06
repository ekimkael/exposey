import { Animation } from '@expo/ui/swift-ui/modifiers';

/**
 * Animation and layout constants for the morphing wallet sheet.
 *
 * The morph is entirely native: a single React state change flips which
 * detent is selected, and both the UIKit height spring and the SwiftUI
 * content cross-fade interpolate on the UI thread. There is no JS per-frame
 * work, so these are the only tunables that shape the motion.
 */

/**
 * Spring driving the sheet morph. The reference transition runs ~13 frames
 * at 30fps (~430ms) with a soft spring and no visible overshoot, which maps
 * to a 0.45s duration and a low bounce.
 */
export const MORPH_SPRING = Animation.spring({ duration: 0.45, bounce: 0.1 });

/**
 * The two heights (in points) the sheet snaps between, measured from the
 * reference frames. Swap for `onGeometryChange`-driven sizing if the pane
 * content ever becomes dynamic.
 */
export const OPTIONS_SHEET_HEIGHT = 272;
export const DETAIL_SHEET_HEIGHT = 468;

/**
 * Detail content height. Floating iOS 26 sheets have no bottom safe-area
 * inset, so the content fills almost the whole detent (minus a small margin).
 */
export const DETAIL_CONTENT_HEIGHT = DETAIL_SHEET_HEIGHT - 8;
