# Papyrus — cylindrical coverflow filmstrip

Reproduction of a reading-log photo viewer: a hero photo with its date, and a
bottom filmstrip whose thumbnails wrap around a cylinder. Scrolling the strip
swaps the hero.

The reference is a screen recording; every constant below was measured off it
rather than guessed (see [Geometry](#geometry)).

## Run

```bash
npm install && npm run ios
```

A development build is required — `expo-symbols` and the SVG decoder in
`expo-image` both need native code, so Expo Go will not do.

## Platforms

iOS is the target. Android gets the same tree for free: the whole effect is
`transform` on a Reanimated `ScrollView`, with no platform-specific code. The
only iOS-only piece is `SymbolView` (SF Symbols) in the header, which falls
back to nothing on Android — swap in Material symbols there if it matters.

## Geometry

Each thumbnail is transformed as `perspective → translateX → rotateY`, driven
by `distance`, its signed offset from the centre in item units:

| Constant | Value | How it was derived |
|---|---|---|
| `ITEM` | 85pt | centred face measured 86.4 × 84.4pt |
| `STRIDE` | 102pt | equals the fitted `R · Δ`, so the centre tracks the finger 1:1 |
| `STEP_DEG` | 30.5° | width falloff at d=1 and d=2 fits `W·cos(dΔ)` — both give 30.5°/30.4° |
| `RADIUS` | `STRIDE / STEP_rad` | derived, not tuned — 187.9pt against 191/193 fitted |
| `PERSPECTIVE` | 500pt | trapezoid near/far edge ratio; measured 1.159 at d=2 vs 1.161 predicted |

Faces land at `RADIUS · sin(angle)` instead of their flat scroll position.
That is what packs the outer entries together; rotating them in place would
let the gaps grow as the faces foreshorten.

The constants were fitted on the at-rest reference frame, using ratios that
are independent of the video's pixel scale, then checked against a mid-scroll
frame they were not fitted to:

| | at rest (fitted) | mid-scroll (held out) |
|---|---|---|
| d=0.5 | — | 49.4pt vs 49.6pt measured |
| d=1 | 95.7pt vs 96.9pt | — |
| d=1.5 | — | 134.6pt vs 134.9pt measured |
| d=2 | 165.8pt vs 168.9pt | — |

## Deliberate differences from the reference

- **The hero updates immediately.** In the reference it visibly lags the
  centred thumbnail during fast scrolls — several items behind — which reads
  as update throttling in the original app rather than intent.
- **Artwork is generated, not photographic.** The reference uses personal
  photos. `scripts/generate-scenes.mjs` emits 14 stylised SVG scenes instead;
  re-run it with `node scripts/generate-scenes.mjs` after editing a palette.
- **The header buttons are inert.** Nothing in the reference shows what they do.
- **The app icon is still the Expo template's.** The reference never shows one.
