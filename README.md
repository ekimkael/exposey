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
