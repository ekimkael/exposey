# Baobab — Canopi onboarding screen

A faithful reproduction of the **"Welcome to Canopi"** onboarding screen
(dark gradient, brand mark, a shelf of content-type cards, and a
Sign-in-with-Apple button), built with Expo Router + Reanimated.

Project codename: **Baobab** (`net.digitalekim.baobab`). The in-app brand
text stays *Canopi* to match the reference.

## What's in it

- `src/app/index.tsx` — the screen: gradient background, logo, headings,
  card shelf, Apple button. Entrance = fade + slide-up (staggered).
- `src/components/canopi-logo.tsx` — the "cp / canopy" brand mark (SVG).
- `src/components/onboarding-cards.tsx` — the four cards (Location, Tasks,
  Photo, Website), drawn with plain Views, plus the idle float animation.

All motion runs on the UI thread via Reanimated and only animates
`opacity` / `transform` (GPU-friendly). Cards bob gently and forever with
a per-card phase offset; the whole screen fades/slides in on mount.

## Run it

```bash
# iOS simulator (native dev build — this project has an ios/ folder)
LANG=en_US.UTF-8 npm run ios
```

The `LANG=en_US.UTF-8` prefix works around a CocoaPods
`Unicode Normalization` crash under non-UTF-8 locales.

## Platforms

- **iOS** — primary target, verified on the iPhone 16 Pro simulator.
- **Android** — should render (all layout is universal RN); the SF Symbol
  glyphs in the Tasks/Website/Apple button are iOS-only and fall back to
  empty on Android. Not verified.

## Limitations / notes

- The **Apple button is a visual mock** (press animation only, no auth).
- The **Photo** card fakes the reference's ribbed-building photo with
  vertical louvers; the **Location** card is a stylized map — neither uses
  a bitmap asset.
- Gradient is a vertical `expo-linear-gradient`; the reference's faint
  radial glow behind the cards is approximated, not exact.
