# Pumice — now-playing player over a native library

> Branch `feat/pumice-player-dock-pill` of [Exposey](#exposey).

An Apple-Music-style **Library** screen with a now-playing bar that swaps
between two shapes: a compact rounded **pill floating** above the bottom
edge, and a full-width sheet **docked** to it. The page scrolls underneath
the player, so content genuinely passes behind it.

The animated swap is the centrepiece; the page around it is built on native
`@expo/ui` components.

## The player swap

The pill is the resting state.

- **Tap** the pill's artwork or text, or **swipe it up** → expands to the dock.
- **Drag** the dock down → collapses back to the pill. Past 40% of the
  dock's height, or on a downward flick over ~350 pt/s, it commits and
  carries the finger's velocity through the release; short of that it
  springs back. Dragging **up** rubber-bands with rising (asymptotic)
  resistance and returns.
- **Tap the grabber** → also collapses, so the player is not drag-only.
- **Press feedback**: the play button and the pill scale to 0.96 / 0.98
  while held.
- Play and AirPlay are independent: pressing play never changes the shape.

Despite appearances the transition is **not a morph** — nothing is shared
between the two players. Both stay mounted and only ever translate; only
`transform` and `opacity` are animated. The two directions are deliberately
different:

| | Collapse (drag) | Expand (tap / swipe) |
|---|---|---|
| outgoing | tracks the finger, then leaves on its momentum | 320 ms, `Easing.in(cubic)` |
| gap | ~500 ms with **no player on screen** | none — the dock rises after 120 ms |
| incoming | spring, damping 22 / stiffness 220 | same spring |
| visible after | ~800 ms, as measured on the reference | ~120 ms |

Collapse keeps the reference's pacing. Expand does not: it answers a
finger, and half a second of empty screen after a tap reads as a bug
rather than as choreography.

The page content bobs down 46pt during the swap and springs back, matching
the reference's scroll-inset shift; during a drag it follows the finger.

Under **Reduce Motion** the swap becomes a 150 ms crossfade in place — no
translation — rather than a hard cut between two differently shaped players.

Both players cast a layered shadow (three transparent layers, not one flat
one): the dock casts **upward** onto the page, the pill casts **down and
out**, so each reads as a surface with air under it rather than as the floor.

## The page

- Six navigational rows (Playlists, Artists, Albums, …) as a native
  `@expo/ui` `List` — SwiftUI on iOS, Jetpack Compose on Android, from one
  tree. Icons are SF Symbols on iOS paired with Material Symbols on Android.
- A horizontal **Recently Added** strip of album covers, and a
  **Recently Played** native list. The covers live in React Native, since
  the universal `@expo/ui` layer has no image primitive.
- The page adopts iOS `systemGroupedBackground` (`#F2F2F7`): the native
  `List` paints its own grouped background and exposes no modifier to hide
  it, so the page matches it rather than fighting it.

### Running it

```bash
npx expo run:ios
```

Everything used here (Reanimated, `expo-image`, `expo-symbols`, `@expo/ui`)
also runs in Expo Go on SDK 56 — a development build is only needed to see
the app under its own name and icon.

### Where the code lives

- `src/hooks/use-player-swap.ts` — **all** the swap logic: shared values,
  the `expand` / `collapse` / `settleBack` worklets, the gestures, and the
  reduced-motion branch. Components never animate; they consume the styles
  and gestures this hook returns.
- `src/constants/pumice.ts` — every tunable: metrics (derived from the
  reference's pixel scale), motion timings/spring, palette, elevation. No
  magic numbers inline. This file is deliberately dependency-free data.
- `src/components/now-playing-player.tsx` — `DockPlayer` and `PillPlayer`,
  pure rendering.
- `src/components/library.tsx` — the page content.
- `plans/` — the animation audit (`improve-animations`) and its status.

### Platforms

iOS is the reference target. Android renders from the same tree: every SF
Symbol is declared with its Material Symbols counterpart, so no
platform-specific code is needed. The metrics are tuned against a 402pt-wide
screen (iPhone 16/17 Pro). Android has not been run.

### Known limitations

- **Artwork is extracted from the reference video**, so it is soft at 2–3×.
- **The top of the screen is cropped out of the reference**, so the page
  content above the player (the Library rows, section titles) is an
  Apple-Music-flavoured invention, not a reproduction. The swap itself is
  what was measured.
- The progress bar is static (48%) — there is no audio, so play/pause only
  flips the icon.
- The flick-dismissal threshold (`throwVelocity`) is reasoned, not measured:
  the iOS simulator fragments synthetic slow drags, so it could not be
  exercised. It needs a real finger.
- AirPlay and the row chevrons are non-interactive glyphs — there is nothing
  behind them here.

---

<a id="exposey"></a>

# Exposey

Sandbox for faithfully reproducing mobile UI and animations (from a
reference video or screenshot) using **Expo Router** and native components
(`@expo/ui` SwiftUI / Jetpack Compose, Reanimated).

Each reproduced screen/animation lives on **its own branch**, independent
from `main` — `main` only holds the base Expo template. No branch is ever
merged into another: each one is a standalone reproduction exercise.

## Stack

- [Expo SDK 56](https://docs.expo.dev/) + Expo Router (file-based routing)
- React Native 0.85, React 19
- `@expo/ui` (SwiftUI / Jetpack Compose) for native components
- React Native Reanimated + Gesture Handler for animations/gestures

## Getting started

```bash
npm install
npx expo start
```

Then open it in a [development build](https://docs.expo.dev/develop/development-builds/introduction/),
an iOS simulator, an Android emulator, or [Expo Go](https://expo.dev/go).

## Branches

| Branch | Description |
|---|---|
| [`feat/canopi-onboarding`](https://github.com/ekimkael/exposey/tree/feat/canopi-onboarding) | "Welcome to Canopi" onboarding screen ("Baobab"): dark-green gradient, a shelf of content-type cards bleeding off both edges, staggered entrance and perpetual card float. |
| [`feat/family-morphing-sheet`](https://github.com/ekimkael/exposey/tree/feat/family-morphing-sheet) | Family wallet bottom sheet with a morphing transition, native Stack header toolbar, and Liquid Glass buttons (iOS 26), built with `@expo/ui` SwiftUI. |
| [`feat/featured-music-ui`](https://github.com/ekimkael/exposey/tree/feat/featured-music-ui) | Featured music UI with video previews and a zoomed detail view. |
| [`feat/gatesware-trip-detail`](https://github.com/ekimkael/exposey/tree/feat/gatesware-trip-detail) | Trip detail screen (Airbnb/Gatesware-style): trip stats, restaurant cards, Instagram/Snap-style stories, grid layouts for places/hotels. |
| [`feat/invest-onboarding`](https://github.com/ekimkael/exposey/tree/feat/invest-onboarding) | Onboarding and authentication flow for an investment app. |
| [`feat/magpie-explore-morph`](https://github.com/ekimkael/exposey/tree/feat/magpie-explore-morph) | Looping bookmark/explore hero animation ("Magpie", from app "Sortd."), reproduced from a single reference video. |
| [`feat/mindfulness-morph`](https://github.com/ekimkael/exposey/tree/feat/mindfulness-morph) | Mindfulness screen with a pill-to-beach-photo morph transition and an "Apple Intelligence"-style glowing button (SVG gradient). |
| [`feat/onboarding-carousel`](https://github.com/ekimkael/exposey/tree/feat/onboarding-carousel) | Onboarding carousel with an animated globe ("Remindo" app). |
| [`feat/pumice-player-dock-pill`](https://github.com/ekimkael/exposey/tree/feat/pumice-player-dock-pill) | Apple-Music-style Library screen with a now-playing bar that swaps between a floating pill and a full-width docked sheet; page scrolls underneath it. |
| [`feat/send-money-screen`](https://github.com/ekimkael/exposey/tree/feat/send-money-screen) | Send Money screen: native form sheet, numeric keypad, amount animations, biometric confirmation morphing into a success screen. |
| [`feat/slash-login-hero-card`](https://github.com/ekimkael/exposey/tree/feat/slash-login-hero-card) | Login screen ("Onyx") with a card fan that folds into a stack on keyboard focus. |
| [`feat/spotify-marquee-onboarding`](https://github.com/ekimkael/exposey/tree/feat/spotify-marquee-onboarding) | "Connect Your Spotify" onboarding screen ("Turaco"): gesture-driven rotary wheel of artist cards that snaps to the nearest slot like a rotary dial. |
| [`feat/value-prop-onboarding`](https://github.com/ekimkael/exposey/tree/feat/value-prop-onboarding) | Cycling value-prop onboarding screen ("Remindo" app) with a radial gradient and a particle CTA button. |

Each branch usually has its own `README.md`/`AGENTS.md` detailing the
reproduced screen, technical choices, and pitfalls encountered.

## Available commands

- `/reproduce-ui` — reproduce a reference (video or image) provided as an attachment.
- `/animation-brief` — spec out an animation via multiple-choice questions before implementation.
- `/quality-pass` — cleanup/refactoring/documentation pass on an already-implemented branch.
- `/social-post` — draft an announcement post for the current branch's case study.
