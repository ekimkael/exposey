# AGENTS.md — Papyrus

Orientation for AI agents working in this repo. Human-facing docs are in
[README.md](README.md).

## What this branch is

One case study: a reproduction of a reading-log photo viewer whose bottom
filmstrip wraps its thumbnails around a cylinder. `main` holds only the bare
Expo template — every reproduction lives on its own `feat/*` branch and is
never merged. Do not merge this branch anywhere.

## Project structure

```
src/
  app/                        Routes only — expo-router file-based routing
    _layout.tsx               Stack, headerless, dark background
    index.tsx                 The screen: header, hero, date, strip
  components/
    coverflow-strip.tsx       Filmstrip + one Thumbnail. Rendering only.
  hooks/
    use-coverflow-transform.ts  The cylinder maths (the reusable part)
    use-press-scale.ts          Press feedback
  constants/
    animation.ts              All motion values, measured off the reference
    theme.ts                  Colours, layout metrics, type scale
  data/
    reading-log.ts            14 entries: date + Metro asset id
assets/scenes/                14 free-license Unsplash photos
plans/                        Animation audit + the plans applied from it
```

Routes live in `src/app/` **exclusively** — never co-locate components, hooks
or types there.

## Where the animation lives

All of it is in `src/hooks/use-coverflow-transform.ts`. The component tree does
no motion work; it consumes an animated style.

The effect is **scroll-linked, not tweened**. `useScrollOffset` reads the
ScrollView's live offset into a shared value, and each entry derives its own
transform from it on the UI thread. Consequences worth understanding before
changing anything:

- It is interruptible and carries real velocity for free — there is no
  animation to cancel, only a position to read.
- There are no durations or easings in the carousel at all. The only tweened
  motion in the app is the 160ms press feedback.
- Snapping is the platform's (`snapToInterval` + `decelerationRate="fast"`), so
  momentum stays native.

## Reusing the effect elsewhere

`useCoverflowTransform` is the artifact worth lifting. It needs only:

1. `react-native-reanimated` (v4 here, plus `react-native-worklets`).
2. The constants from `src/constants/animation.ts`.
3. A horizontal `Animated.ScrollView` whose offset you feed in via
   `useScrollOffset`, with `paddingHorizontal: (width - STRIDE) / 2` on the
   content container and each item in a `STRIDE`-wide slot.

The maths is independent of this app's data. Swap `ITEM`/`STRIDE`/`STEP_DEG`
for your own measurements and it works with any content.

## Conventions

- TypeScript strict, no `any`. `interface` for object types, never `enum` —
  use `as const` maps.
- Files and directories in **kebab-case**. Components PascalCase, hooks `use*`,
  handlers `handle*`.
- Path alias `@/*` → `src/*`, `@/assets/*` → `assets/*`. Prefer it over
  relative imports.
- Animate `transform` and `opacity` only. Never width/height/margin/top/left.
- Every string must be inside `<Text>`. Never `value && <Comp/>` with a
  possibly-zero value — use a ternary.
- `npx expo install`, never bare `npm install`, so SDK compatibility holds.

## Traps encountered here

- **The calibrated constants are not arbitrary.** `ITEM`, `STRIDE`,
  `STEP_DEG`, `RADIUS`, `PERSPECTIVE`, `MAX_STEPS`, `FADE_FROM` were fitted to
  a reference recording. `RADIUS` in particular is *derived*
  (`RADIUS * STEP_rad === STRIDE`) — that identity is what makes the strip
  track the finger 1:1. Change it and the carousel slides out from under the
  touch. Regression-test with the silhouette measurement in the README before
  and after any change.

- **Centring pads by the slot, not the thumbnail.** `paddingHorizontal` must be
  `(width - STRIDE) / 2`. Using `ITEM` leaves entry 0 off-centre by half the
  gap — a 10pt error that is easy to miss by eye.

- **Parked faces never leave the screen.** `RADIUS * sin` caps at `RADIUS`,
  which is inside the screen half-width, so far entries are faded out rather
  than cut. A hard opacity cut pops a visible sliver at the edge.

- **`useReducedMotion()` is read at app start** and does not re-render on
  change. Toggling the OS setting requires a full app relaunch, not a hot
  reload.

- **`npm uninstall` can nest a duplicate native module.** Removing unused
  packages re-resolved the tree and produced two `react-native-screens`
  copies; `npx expo-doctor` catches this. Run it after any dependency change.

- **Locale for pods.** `LANG=en_US.UTF-8` when running `expo prebuild` /
  `pod install`, or CocoaPods fails on non-UTF-8 locales.

## Verifying a change

```bash
npx tsc --noEmit
npx expo-doctor
npm run ios
```

For anything touching motion, prove the geometry did not shift — screenshot,
then measure the strip silhouette (command in [README.md](README.md#geometry))
and compare against the documented values. A pixel diff of the region below the
status bar should be exactly 0 for non-visual changes; the clock is the only
thing expected to differ between two runs.
