# 001 — Add shared motion tokens

- **Status**: DONE
- **Commit**: 424bbc5
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 new file (~50 lines). No visual change on its own.

## Problem

Motion values are hand-typed at each call site and do not agree with each other.
There is no motion token module, so every later animation plan would invent its
own curve.

Current press-feedback opacities disagree across three components:

```tsx
// src/components/country-row.tsx:31 — current
        opacity: pressed ? 0.6 : 1,
```

```tsx
// src/components/social-button.tsx:39 — current
        opacity: pressed ? 0.7 : 1,
```

```tsx
// src/components/primary-button.tsx:96 — current (web fallback)
        opacity: pressed ? 0.85 : 1,
```

And durations are inline literals with no shared source:

```tsx
// src/components/otp-input.tsx:35 — current
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
```

This plan only creates the token module. Plans 002–006 consume it. It changes no
rendered output by itself.

## Target

A new file `src/lib/motion.ts` exporting durations, easing curves and spring
configs, with these exact values:

```ts
// target — src/lib/motion.ts
import { Easing } from 'react-native-reanimated';

export const duration = {
  press: 160,
  short: 200,
  medium: 260,
  celebration: 420,
} as const;

export const easing = {
  out: Easing.bezier(0.23, 1, 0.32, 1),
  inOut: Easing.bezier(0.77, 0, 0.175, 1),
} as const;

export const spring = {
  press: { duration: 260, dampingRatio: 0.9 },
  standard: { duration: 500, dampingRatio: 0.8 },
  celebration: { duration: 520, dampingRatio: 0.65 },
} as const;

export const pressScale = 0.97;
```

Rationale for these exact numbers (do not change them):

- `Easing.bezier(0.23, 1, 0.32, 1)` is the strong ease-out curve; it is the
  default for anything entering or exiting.
- `Easing.bezier(0.77, 0, 0.175, 1)` is the strong ease-in-out curve, for
  elements moving/morphing while already on screen.
- `duration.press: 160` sits at the top of the 100–160ms press-feedback budget.
- `spring.standard` is the Apple-style `duration 0.5s / bounce 0.2` spring;
  Reanimated expresses bounce as `dampingRatio = 1 - bounce`, so bounce 0.2 →
  `dampingRatio: 0.8`.
- `spring.celebration` is bounce 0.35 → `dampingRatio: 0.65`. Visible bounce is
  reserved for rare, high-emotion moments (the success screen).
- `pressScale: 0.97` is the subtle end of the 0.95–0.98 press range.

## Repo conventions to follow

- Shared non-component modules live in `src/lib/` and are imported with the `@/`
  alias, e.g. `import { font } from '@/lib/fonts';`.
- Exemplar to imitate for file shape, JSDoc density and `as const` usage:
  `src/lib/fonts.ts` — a small module with a file-level JSDoc block, one
  documented member per key, exported `as const`.
- Colours are NOT motion tokens; they stay in `src/theme/tokens.ts`. Do not move
  or duplicate any colour here.

## Steps

1. Create `src/lib/motion.ts` with exactly the code in the **Target** section
   above, adding JSDoc in the style of `src/lib/fonts.ts`: a file-level block
   explaining that these are the shared motion tokens and that every animation
   should pull its curve/duration from here rather than hand-typing values, plus
   a one-line JSDoc comment on each exported member and each key describing when
   to use it (per the rationale list above).
2. Do not import the module anywhere yet — later plans do that.

## Boundaries

- Do NOT modify any existing file. This plan only adds `src/lib/motion.ts`.
- Do NOT change any colour, spacing or layout value anywhere.
- Do NOT add dependencies — `react-native-reanimated` is already installed at
  version 4.3.1.
- If `src/lib/motion.ts` already exists, STOP and report instead of overwriting.

## Verification

- **Mechanical**: run `npx tsc --noEmit` — expected: `TypeScript compilation
  completed`, no errors. Run `./node_modules/.bin/eslint src` — expected: no new
  warnings beyond the pre-existing `A require() style import is forbidden`
  warnings in `src/components/primary-button.tsx` and
  `src/components/theme-menu.tsx`.
- **Feel check**: none — this plan renders nothing. Confirm by running the app
  that the UI is byte-for-byte unchanged.
- **Done when**: `src/lib/motion.ts` exists, typechecks, exports `duration`,
  `easing`, `spring` and `pressScale` with the exact values above, and no other
  file in the repo has been modified (`git status --short` shows one new file).
