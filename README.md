# Baobab — onboarding screen reproduction

A pixel-faithful reproduction of a **"Welcome to Canopi"** onboarding screen,
rebranded as **Baobab**: a dark-green gradient backdrop, a baobab-tree brand
mark, a shelf of content-type cards (Location · Tasks · Photo · Website) that
bleed off both screen edges, and a Sign-in-with-Apple button — with a
staggered entrance and a subtle perpetual card float.

Built with Expo Router + Reanimated. Project codename **Baobab**
(`net.digitalekim.baobab`).

<!-- Reference media: the original screenshot this reproduces is not committed. -->

## Requirements

- Node ≥ 20, Xcode + iOS Simulator (macOS)
- This project has a native `ios/` folder → it runs as a **dev build**, not Expo Go.

## Run it

```bash
# iOS simulator
LANG=en_US.UTF-8 npm run ios
```

The `LANG=en_US.UTF-8` prefix works around a CocoaPods `Unicode Normalization`
crash under non-UTF-8 locales. See [AGENTS.md](AGENTS.md#pitfalls) for the other
build traps.

## Platforms

- **iOS** — primary target, verified on the iPhone 16 Pro simulator.
- **Android** — layout is universal RN and should render, but the SF Symbol
  glyphs (Tasks / Website / Apple button) are iOS-only and fall back to empty.
  Not verified.

## What it demonstrates

- A custom-drawn marketing screen with a gradient backdrop and vector logo.
- Reanimated motion on the UI thread (entrance + idle float + press feedback),
  centralised into hooks and tokens, and respecting **Reduce Motion**.

## Limitations

- The **Apple button is a visual mock** (press animation only, no auth).
- The **Photo** card fakes the reference's ribbed-building photo with a louver
  gradient; the **Location** card is a stylised map — neither uses a bitmap.
- The background gradient is vertical; the reference's faint radial glow is
  approximated.

## Project layout

See [AGENTS.md](AGENTS.md) for the full map, where the animation lives, the
conventions used, how to lift the animation into another project, and the
build pitfalls encountered.
