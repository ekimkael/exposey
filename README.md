# Turaco — Connect Your Spotify marquee

Reproduction of a "Connect Your Spotify" onboarding screen: a
**gesture-driven rotary wheel** of artist sticker cards — the 8 artists
sit twice around a 16-slot ring (R ≈ 382 pt). The user's vertical pan
spins the wheel in either direction; on release the momentum is
projected and the wheel **snaps to the nearest slot** like a revolver
cylinder / rotary phone dial. Progressive blur + black fade at the top
and bottom edges.

- **Wheel**: each card maps its arc distance to an angle θ —
  `y = R·sin θ`, x curves away at the edges (`R·(1−cos θ)`). Cards do
  not rotate with the wheel; they keep only their static sticker tilt.
- **Gesture**: `Gesture.Pan` drives a shared value on the UI thread;
  release projects velocity (`FLING_PROJECTION`) and settles with
  `withSpring` on the nearest `PITCH` multiple (the detent snap).
- **Progressive blur**: `BlurView` masked by a vertical `LinearGradient`
  (`@react-native-masked-view/masked-view`), plus a short black fade.
- **Artist art**: stylized `react-native-svg` placeholders (no real
  artist photos in the repo).

Runs in **Expo Go** (SDK 56, universal layer only): `npx expo start --ios`.
Platforms: built and validated on iOS; uses only cross-platform JS
libraries so Android should work as-is (untested).

---

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
| [`feat/spotify-marquee-onboarding`](https://github.com/ekimkael/exposey/tree/feat/spotify-marquee-onboarding) | "Connect Your Spotify" onboarding ("Turaco") with an infinite vertical marquee of tilted artist sticker cards and progressive edge blur. |

Each branch usually has its own `README.md`/`AGENTS.md` detailing the
reproduced screen, technical choices, and pitfalls encountered.

## Available commands

- `/reproduce-ui` — reproduce a reference (video or image) provided as an attachment.
- `/animation-brief` — spec out an animation via multiple-choice questions before implementation.
- `/quality-pass` — cleanup/refactoring/documentation pass on an already-implemented branch.
