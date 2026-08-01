# 001 — Add a reduced-motion path to the coverflow strip

- **Status**: DONE
- **Commit**: 7aa01fc
- **Severity**: MEDIUM
- **Category**: 6 — Accessibility
- **Estimated scope**: 1 file, ~20 lines

## Problem

`src/components/coverflow-strip.tsx` rotates every thumbnail in 3D as the user
scrolls. Each face turns up to ±79° (`MAX_STEPS = 2.6` × `STEP_DEG = 30.5`)
through a 500pt perspective, and is additionally displaced horizontally by a
synthetic cylinder remap. Rotation through perspective plus large positional
displacement is the classic vestibular trigger.

`useReducedMotion()` is never called anywhere in `src/` — there is no reduced
motion path at all. Users who have enabled "Reduce Motion" at the OS level get
the full 3D carousel.

Current code:

```tsx
// src/components/coverflow-strip.tsx:46-62 — current
const animatedStyle = useAnimatedStyle(() => {
  const distance = index - scrollX.value / STRIDE;
  const steps = Math.min(Math.max(distance, -MAX_STEPS), MAX_STEPS);
  const angle = steps * STEP_DEG;

  return {
    opacity: 1 - Math.min(1, Math.max(0, (Math.abs(distance) - FADE_FROM) / (MAX_STEPS - FADE_FROM))),
    transform: [
      { perspective: PERSPECTIVE },
      // Orthographic cylinder: the face sits at R*sin(angle) rather than at
      // its flat scroll position, which is what packs the outer entries
      // together instead of letting the gaps grow as they foreshorten.
      { translateX: RADIUS * Math.sin(angle * DEG_TO_RAD) - distance * STRIDE },
      { rotateY: `${angle}deg` },
    ],
  };
});
```

## Target

Under reduced motion, drop the two vestibular elements — the 3D rotation and
the synthetic horizontal remap — and keep only what communicates *which entry
is selected*. The strip still scrolls, because scrolling is direct
manipulation (the content tracks the finger), not synthetic motion.

Reduced-motion behaviour:

- No `perspective`, no `rotateY`.
- No cylinder `translateX` remap — entries sit at their natural flat scroll
  positions, i.e. the transform contributes no translation at all.
- A gentle scale falloff replaces foreshortening as the selection cue:
  `1.0` at the centre, decreasing linearly to `0.92` one step out, clamped
  there (never smaller than `0.92`).
- The existing far-entry opacity fade is kept **unchanged**.

Target code:

```tsx
// target — src/components/coverflow-strip.tsx
const reduceMotion = useReducedMotion();

const animatedStyle = useAnimatedStyle(() => {
  const distance = index - scrollX.value / STRIDE;
  const fade =
    1 - Math.min(1, Math.max(0, (Math.abs(distance) - FADE_FROM) / (MAX_STEPS - FADE_FROM)));

  if (reduceMotion) {
    // Reduce Motion: no 3D rotation and no cylinder remap — the two vestibular
    // triggers. A flat scale falloff carries the "which entry is centred" cue
    // that foreshortening carries otherwise.
    return {
      opacity: fade,
      transform: [{ scale: 1 - Math.min(Math.abs(distance), 1) * FLAT_SCALE_FALLOFF }],
    };
  }

  const steps = Math.min(Math.max(distance, -MAX_STEPS), MAX_STEPS);
  const angle = steps * STEP_DEG;

  return {
    opacity: fade,
    transform: [
      { perspective: PERSPECTIVE },
      // Orthographic cylinder: the face sits at R*sin(angle) rather than at
      // its flat scroll position, which is what packs the outer entries
      // together instead of letting the gaps grow as they foreshorten.
      { translateX: RADIUS * Math.sin(angle * DEG_TO_RAD) - distance * STRIDE },
      { rotateY: `${angle}deg` },
    ],
  };
});
```

New constant, placed with the others at the top of the file:

```tsx
/** Reduce Motion: scale drop one step out from centre, standing in for foreshortening. */
const FLAT_SCALE_FALLOFF = 0.08;
```

## Repo conventions to follow

- **Motion constants are module-level `SCREAMING_SNAKE` consts at the top of
  `src/components/coverflow-strip.tsx`, each with a JSDoc block explaining
  *why* the value is what it is.** Exemplar, `coverflow-strip.tsx:22-27`:

  ```tsx
  /**
   * Cylinder radius, derived rather than chosen: `RADIUS * STEP_rad === STRIDE`
   * makes the centre of the strip track the finger 1:1. Any other radius and the
   * carousel slides out from under the touch.
   */
  const RADIUS = STRIDE / (STEP_DEG * DEG_TO_RAD);
  ```

  Add `FLAT_SCALE_FALLOFF` in that same block, in that same style.

- `useReducedMotion` is imported from `react-native-reanimated`, alongside the
  existing hooks in the import block at `coverflow-strip.tsx:4-11`. Keep the
  import list alphabetically ordered as it already is.

- Comments in this file explain the *reasoning*, not the mechanics. Match that
  register — see the `translateX` comment above.

## Steps

1. In `src/components/coverflow-strip.tsx`, add `useReducedMotion` to the
   existing `react-native-reanimated` import block (lines 4-11), keeping
   alphabetical order — it goes between `useAnimatedStyle` and `useScrollOffset`.

2. Add the `FLAT_SCALE_FALLOFF` constant with its JSDoc immediately after the
   `FADE_FROM` declaration (currently line 35).

3. Inside `function Thumbnail` (line 45), call `const reduceMotion = useReducedMotion();`
   before the `useAnimatedStyle` call. It must be called at component level,
   not inside the worklet — it is a React hook.

4. Restructure the `useAnimatedStyle` body exactly as shown in **Target**:
   hoist the opacity expression into a `fade` local, add the early-return
   reduced-motion branch, and leave the existing cylinder branch otherwise
   byte-identical (including its comment).

## Boundaries

- Do NOT touch `src/app/index.tsx`, `src/app/_layout.tsx`, or
  `src/data/reading-log.ts`.
- Do NOT change any of the calibrated geometry constants: `ITEM`, `STRIDE`,
  `STEP_DEG`, `RADIUS`, `PERSPECTIVE`, `MAX_STEPS`, `FADE_FROM`. These were
  measured off a reference video and are documented in `README.md`; changing
  them breaks the reproduction.
- Do NOT change the non-reduced-motion visual result in any way. This plan is
  purely additive — with Reduce Motion off, rendering must be pixel-identical.
- Do NOT add dependencies. `useReducedMotion` already ships with the installed
  `react-native-reanimated` (4.3.1).
- Do NOT convert `reduceMotion` into a shared value or try to make it live-update.
  Reanimated documents that this setting is read at app start and does not
  trigger a rerender; requiring an app relaunch is the expected behaviour.
- If the code you find does not match the excerpt above (drift since commit
  `7aa01fc`), STOP and report rather than improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` — must print no errors.

- **Feel check, Reduce Motion OFF** (regression guard — this must be unchanged):
  1. Launch: `npm run ios`.
  2. Screenshot and measure the strip geometry:
     ```bash
     xcrun simctl io booted screenshot /tmp/check.png
     magick /tmp/check.png -colorspace gray -crop 1206x340+0+1985 +repage -compress none pgm:- > /tmp/c.pgm
     awk 'NR==1{next} NR==2{W=$1;H=$2;next} NR==3{next}
     {for(i=1;i<=NF;i++)v[n++]=$i}
     END{ inb=0
       for(x=0;x<W;x++){ on=0
         for(y=0;y<H;y++){ if(v[y*W+x]>30){ on=1; break } }
         if(on && !inb){ s=x; inb=1 } else if(!on && inb){ printf "w=%.1fpt x=%+.1fpt\n",(x-s)/3.0,((s+x-1)/2-603)/3; inb=0 }
       }
     }' /tmp/c.pgm
     ```
  3. On a freshly launched app (entry 0 centred) this must still print exactly:
     ```
     w=85.0pt x=+0.0pt
     w=73.7pt x=+95.7pt
     w=46.7pt x=+165.8pt
     ```
     Any deviation means the cylinder branch was altered — revert and retry.

- **Feel check, Reduce Motion ON**:
  1. Simulator → Settings → Accessibility → Motion → **Reduce Motion** = on.
  2. **Fully relaunch the app** (`xcrun simctl terminate booted net.digitalekim.papyrus`
     then `xcrun simctl launch booted net.digitalekim.papyrus`). The setting is
     read at start; a hot reload will not pick it up.
  3. Confirm by eye and by re-running the measurement above:
     - Thumbnails are **flat rectangles** — no trapezoid, no visible slanting of
       the left/right edges on off-centre entries.
     - All entries have the **same width** (85.0pt) regardless of position; only
       scale and opacity vary. Widths of `85.0 / ~78 / ~78` are expected instead
       of the `85.0 / 73.7 / 46.7` falloff.
     - The centred entry is still visually distinguishable from its neighbours.
     - Scrolling still tracks the finger 1:1 and still snaps — scrolling itself
       must NOT be disabled.

- **Done when**: `tsc` is clean, the Reduce-Motion-OFF measurement is
  byte-identical to the three values above, and with Reduce Motion ON no
  thumbnail renders as a trapezoid at any scroll position.
