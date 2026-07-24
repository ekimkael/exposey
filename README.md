# Pumice — now-playing dock ↔ floating pill

> Branch `feat/pumice-player-dock-pill` of [Exposey](#exposey).

A music library screen whose now-playing bar swaps between two shapes: a
compact rounded **pill floating** above the bottom edge, and a full-width
sheet **docked** to it.

The pill is the resting state.

- **Tap** the pill's artwork or text → expands to the dock.
- **Drag** the dock down → collapses back to the pill. Past 40% of the
  dock's height, or on a downward flick over 600 pt/s, it commits and
  carries the finger's velocity through the release; short of that it
  springs back. Dragging up rubber-bands at 0.3 and returns.
- **Tap the grabber** → also collapses, so the player is not drag-only.
- Play and AirPlay are independent: pressing play never changes the shape.

Despite appearances the transition is **not a morph** — nothing is shared
between the two players. The two directions are deliberately different:

| | Collapse (drag) | Expand (tap) |
|---|---|---|
| outgoing | tracks the finger, then leaves on its momentum | 320 ms, `Easing.in(cubic)` |
| gap | ~500 ms with **no player on screen** | none — the dock starts rising after 120 ms |
| incoming | spring, damping 22 / stiffness 220 | same spring |
| visible after | ~800 ms, as measured on the reference | ~120 ms |

Collapse keeps the reference's pacing. Expand does not: it answers a
finger, and half a second of empty screen after a tap reads as a bug
rather than as choreography.

The page content bobs down 46pt during the swap and springs back, matching
the reference's scroll-inset shift — during a drag it follows the finger.
Only `transform` is animated.

### Running it

```bash
npx expo run:ios
```

Everything used here (Reanimated, `expo-image`, `expo-symbols`) also runs
in Expo Go on SDK 56 — a development build is only needed to see the app
under its own name and icon.

### Platforms

iOS is the reference target. Android renders from the same tree: SF Symbols
are declared with their Material Symbols counterparts
(`airplayaudio`/`airplay`, `play.fill`/`play_arrow`, `plus`/`add`,
`arrow.right`/`arrow_forward`), so no platform-specific code is needed.
The metrics are tuned against a 402pt-wide screen (iPhone 16/17 Pro).

### Known limitations

- **Artwork is extracted from the reference video**, so it is soft at 3× —
  the `Surpass` card in particular. The card's looping video is reproduced
  as a still; the animation under test is the player swap, not playback.
- **The top of the screen is cropped out of the reference.** The `Listen
  Now` large title is an inference, not a reproduction.
- The progress bar is static (48%) — there is no audio, so play/pause only
  flips the icon.
- AirPlay has nothing to route to, so it stays a non-interactive glyph
  rather than a button that does nothing.
- The grabber collapses rather than opening a full-screen now-playing
  view, which does not exist here. Dragging up rubber-bands instead of
  promising a screen that isn't there.

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
| [`feat/family-morphing-sheet`](https://github.com/ekimkael/exposey/tree/feat/family-morphing-sheet) | Family wallet bottom sheet with a morphing transition, native Stack header toolbar, and Liquid Glass buttons (iOS 26), built with `@expo/ui` SwiftUI. |
| [`feat/featured-music-ui`](https://github.com/ekimkael/exposey/tree/feat/featured-music-ui) | Featured music UI with video previews and a zoomed detail view. |
| [`feat/gatesware-trip-detail`](https://github.com/ekimkael/exposey/tree/feat/gatesware-trip-detail) | Trip detail screen (Airbnb/Gatesware-style): trip stats, restaurant cards, Instagram/Snap-style stories, grid layouts for places/hotels. |
| [`feat/invest-onboarding`](https://github.com/ekimkael/exposey/tree/feat/invest-onboarding) | Onboarding and authentication flow for an investment app. |
| [`feat/mindfulness-morph`](https://github.com/ekimkael/exposey/tree/feat/mindfulness-morph) | Mindfulness screen with a pill-to-beach-photo morph transition and an "Apple Intelligence"-style glowing button (SVG gradient). |
| [`feat/onboarding-carousel`](https://github.com/ekimkael/exposey/tree/feat/onboarding-carousel) | Onboarding carousel with an animated globe ("Remindo" app). |
| [`feat/send-money-screen`](https://github.com/ekimkael/exposey/tree/feat/send-money-screen) | Send Money screen: native form sheet, numeric keypad, amount animations, biometric confirmation morphing into a success screen. |
| [`feat/slash-login-hero-card`](https://github.com/ekimkael/exposey/tree/feat/slash-login-hero-card) | Login screen ("Onyx") with a card fan that folds into a stack on keyboard focus. |
| [`feat/value-prop-onboarding`](https://github.com/ekimkael/exposey/tree/feat/value-prop-onboarding) | Cycling value-prop onboarding screen ("Remindo" app) with a radial gradient and a particle CTA button. |

Each branch usually has its own `README.md`/`AGENTS.md` detailing the
reproduced screen, technical choices, and pitfalls encountered.

## Available commands

- `/reproduce-ui` — reproduce a reference (video or image) provided as an attachment.
- `/animation-brief` — spec out an animation via multiple-choice questions before implementation.
- `/quality-pass` — cleanup/refactoring/documentation pass on an already-implemented branch.
