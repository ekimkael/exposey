/**
 * @file Onboarding slide definitions for Remindo.
 *
 * This is the **single source of truth** for carousel content.
 * To add, remove, or reorder a slide — edit {@link SLIDES} here.
 * The carousel length, dot count, and auto-advance loop all derive from it automatically.
 *
 * ## Asset convention
 * Drop SVG mockups under `assets/images/ghost-phone-*.svg` and reference them
 * via `require(...)` in the `image` field below.
 *
 * @module utils/data
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** How long (ms) a slide is displayed before the carousel auto-advances. */
export const SLIDE_DURATION = 6_000;

/**
 * Pixel width of the active (expanded) progress dot.
 * Inactive dots collapse to 8px; the active dot expands to this value.
 */
export const DOT_ACTIVE_WIDTH = 40;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of a single onboarding carousel slide. */
export interface OnboardingSlide {
  /** Unique string key — used as React list key and for debugging. */
  id: string;
  /** Large headline rendered below the progress dots. */
  title: string;
  /**
   * Supporting copy beneath the headline.
   * Supports `\n` for manual line breaks.
   */
  subtitle: string;
  /**
   * Local asset returned by a `require(...)` call.
   * Rendered full-width by `expo-image` with `contentFit="contain"`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
}

// ─── Slide data ───────────────────────────────────────────────────────────────

/**
 * Ordered list of onboarding slides shown in the carousel.
 *
 * Each entry pairs a marketing message with a matching phone-mockup SVG.
 * The images live in `assets/images/` and are named after the slide id.
 */
export const SLIDES: OnboardingSlide[] = [
  {
    id: 'organise',
    title: 'Stay Organised',
    subtitle:
      'Capture tasks and ideas with ease.\nSync instantly across all your Apple devices.',
    image: require('@/assets/images/ghost-phone.svg'),
  },
  {
    id: 'reminders',
    title: 'Never Miss a Beat',
    subtitle:
      'Smart reminders at the right time and place.\nAlways nudge you when it matters.',
    image: require('@/assets/images/ghost-phone-remind.svg'),
  },
  {
    id: 'together',
    title: 'Better Together',
    subtitle:
      'Share lists and collaborate with ease.\nReal-time updates, no friction.',
    image: require('@/assets/images/ghost-phone-collab.svg'),
  },
  {
    id: 'everywhere',
    title: 'Everywhere You Go',
    subtitle:
      'iPhone, iPad, Mac and Apple Watch.\nYour tasks follow you, effortlessly.',
    image: require('@/assets/images/ghost-phone-devices.svg'),
  },
];
