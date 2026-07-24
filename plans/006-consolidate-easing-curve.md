# 006 — Define the exit curve once

- **Status**: DONE
- **Commit**: 626d7a3
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file, ~4 lines

## Problem

Every motion value in this branch is a named token in `Motion`
(`src/constants/pumice.ts`) except the easing curve, which is written out twice:

```ts
// src/hooks/use-player-swap.ts:18 — current
const OUT = { duration: Motion.outMs, easing: Easing.in(Easing.cubic) } as const;
```

```ts
// src/hooks/use-player-swap.ts:37 — current
withTiming(Motion.bob, { duration: Motion.overlapMs, easing: Easing.in(Easing.cubic) }),
```

Two hand-written copies of the same curve is exactly the consolidation the
audit playbook flags: if the reference measurement is ever revisited, one of
the two will be missed.

## Target

One named constant, referenced twice.

```ts
/* target — src/hooks/use-player-swap.ts, near the other module constants */
/**
 * Accelerating exit, measured off the reference: the departing player starts
 * slow and picks up speed. Deliberately not the ease-out that UI exits usually
 * want — see README.
 */
const EXIT_EASING = Easing.in(Easing.cubic);

const OUT = { duration: Motion.outMs, easing: EXIT_EASING } as const;
const BOB_OUT = { duration: Motion.overlapMs, easing: EXIT_EASING } as const;
```

and at the call site:

```ts
bob.value = withSequence(
  withTiming(Motion.bob, BOB_OUT),
  withSpring(0, Motion.spring)
);
```

The curve stays in `use-player-swap.ts` rather than moving to
`src/constants/pumice.ts`, because `Easing` is a Reanimated value and that file
is currently dependency-free plain data. Keeping it dependency-free is worth
more than co-locating one curve.

## Repo conventions to follow

- Module-level animation configs are `as const` objects declared above the hook
  — see `src/hooks/use-player-swap.ts:18`.
- Comments explain *why* a value is unusual, not what the code does — see the
  JSDoc on `Motion.gapMs` in `src/constants/pumice.ts`.

## Steps

1. In `src/hooks/use-player-swap.ts`, add `EXIT_EASING` above the existing
   `OUT` declaration, with the JSDoc from Target.
2. Change `OUT` to use `EXIT_EASING`.
3. Add the `BOB_OUT` constant beside it.
4. In `expand()`, replace the inline config object with `BOB_OUT`.

## Boundaries

- Do NOT change the curve itself. `Easing.in(Easing.cubic)` is measured off the
  reference video and is deliberate; this plan is a pure refactor.
- Do NOT move the curve into `src/constants/pumice.ts`.
- Do NOT touch any other file.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors.
  `grep -c "Easing.in(Easing.cubic)" src/hooks/use-player-swap.ts` returns `1`.
- **Feel check**: the swap must be indistinguishable from before. Tap the pill
  and drag the dock down; if anything looks different, the refactor changed
  behaviour and is wrong.
- **Done when**: the curve appears exactly once and the motion is unchanged.
