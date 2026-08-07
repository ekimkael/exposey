# AGENTS.md — Opal

Notes for an AI agent (or a human) working on this branch. The user-facing
overview is in [README.md](README.md).

## What this branch is

One branch of the `exposey` sandbox: a faithful reproduction of Ryan Mulligan's
[Shiny call-to-action button](https://codepen.io/hexagoncircle/pen/MWMqXbK).
Branches here are standalone exercises and are never merged into each other —
`main` holds only the base Expo template.

## Architecture

Three files, split by responsibility. Keep them that way.

| File | Holds | Must not hold |
|---|---|---|
| `src/constants/shiny-button.ts` | geometry, palette, timings, precomputed gradient endpoints | React, hooks |
| `src/hooks/use-shiny-button-animation.ts` | shared values, the frame loop, derived values, press handlers | JSX |
| `src/components/shiny-button.tsx` | the Skia tree and styles | animation logic, magic numbers |

Every tunable value lives in the constants file, and each one carries a comment
naming the CSS declaration it came from. Change values there, not inline.

## How the CSS maps onto Skia

| CSS | Here |
|---|---|
| `conic-gradient()` | `SweepGradient` |
| `@property --gradient-angle` + `@keyframes` | a shared value advanced by `useFrameCallback` |
| `animation-composition: add` | two angles (`baseAngle` + `boostAngle`) summed |
| `mask-image` | `<Mask mode="luminance">` — **white reveals, black hides** |
| `:hover` / `:focus` | `onPressIn` / `onPressOut` |
| `isolation: isolate` + `z-index: -1` | paint order: body fill first, decorative layers after, clipped to the body |
| *(no equivalent)* | the inner wash — see below |

### The one deliberate deviation

`shiny-button.tsx` paints a blue wash inside the pill that follows the halo.
The pen has no such layer: in the browser the interior light comes from
`::after`, but its mask — `radial-gradient(circle at bottom, transparent 40%,
black)` — is centred *below* the pill and hides the shimmer across nearly all
of it. Ported literally, the interior swung only 12.4 → 13.5 mean luminance
over a full revolution, so the dots never lit up and raising the shimmer's own
opacity changed nothing.

The wash reuses the border sweep's colours, stops and rotation, so it stays in
phase with the halo by construction. It is masked by an ellipse (dark centre,
clear rim) because a bare sweep gradient fills its wedge down to the centre and
reads as a cone converging on the middle of the button rather than as light
spilling in from the border.

### The rotation model

The CSS composes two animations: a 3 s forward spin that always runs, plus a
7.5 s **reversed** spin that is `paused` until `:hover`. Adding them means the
border rotates *slower* while pressed, not faster — that is intentional and
matches the pen.

Here, `baseAngle` always advances and `boostAngle` only advances (negatively)
while pressed; `spinAngle = baseAngle + boostAngle`. The border additionally
subtracts `activation * 95deg` for `--gradient-angle-offset`.

## Pitfalls hit while building this

These cost real time. Read before changing the animation.

1. **Paint order is load-bearing.** The shimmer and dots must be drawn *after*
   the black body fill. Drawing them before means the fill covers them, and the
   only thing visible is what leaks past the fill's bottom edge — which cannot
   move, so the light looks frozen.

2. **Rotate the mask together with its gradient.** The CSS `rotate` spins the
   whole `::after` element, mask included. Rotating only the gradient inside a
   static mask makes the crescent pulse in place instead of orbiting.

3. **Every sweep needs its own `transform`.** A `SweepGradient` with no
   transform is static, however carefully the angle is computed elsewhere. The
   border sweep was silently frozen for exactly this reason.

4. **Helpers called from worklets need the `worklet` directive.** `toRadians`
   is module-scope and called inside `useDerivedValue` bodies; without
   `'worklet'` it throws *"Tried to synchronously call a non-worklet function
   on the UI thread"* at runtime — the type-checker will not catch it.

5. **Dot density has to match the CSS.** At 8 pt spacing the grid inked under
   2% of the pill and read as pure black once the wedge mask thinned it. The
   CSS values (4 px spacing, 0.5 px radius) are the ones that are visible.

6. **`DerivedValue` is invariant.** `interpolateColors` returns
   `string | number[]`, so the shared value must be typed with exactly that
   union — a wider `Color` will not assign.

7. **CocoaPods needs a UTF-8 locale.** Otherwise it dies with
   `Unicode Normalization not appropriate for ASCII-8BIT`. Export
   `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` before building.

## Verifying a change

Screenshots are not enough — the motion is what matters, and a still frame
cannot show whether something is moving. Use a numeric trace:

```bash
xcrun simctl io booted recordVideo --codec h264 -f /tmp/cap.mp4
```

Then sample one row across the bottom edge of the pill and find the brightest
column per frame:

```bash
ffmpeg -i /tmp/cap.mp4 -vf "fps=4,crop=900:22:155:1402" -start_number 1 f%02d.png
```

The expected signature at rest: the brightest column sweeps from ~82 down to
~7, then leaves the strip (luminance drops to ~2), on a **3.0 s period**. Peak
luminance during transit is ~45–47. A frozen column means something stopped
rotating.

The crop offsets above are for an iPhone 17 recording (1206×2622); recompute
them for another device.

## Conventions

- TypeScript strict, `interface` over `type` for object shapes, no `enum`.
- kebab-case files, PascalCase components, `use*` hooks, `handle*` handlers.
- Path alias `@/*` → `src/*`; prefer it over relative imports.
- Routes live in `src/app/` **only** — no components or utils co-located there.
- Animate transform and opacity only; never width/height/top/left.
- Motion runs on the UI thread: worklets and derived values, never `setState`
  per frame.

## Reusing the button elsewhere

Copy the three files, keep the relative structure, and install
`@shopify/react-native-skia` plus `react-native-reanimated`. It needs a
development build — Skia will not run in Expo Go. Nothing in the component
depends on expo-router or on this project's theme.
