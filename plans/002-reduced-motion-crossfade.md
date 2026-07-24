# 002 — Give Reduce Motion a crossfade instead of a hard cut

- **Status**: DONE (not exercised on device — see note)
- **Commit**: 626d7a3
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files, ~25 lines

## Problem

Reanimated's `withTiming` / `withSpring` / `withDelay` default to
`ReduceMotion.System`, so when the OS setting is on every value jumps straight
to its end. `withDelay` additionally skips its delay
(`node_modules/react-native-reanimated/lib/module/animation/delay.js:33`), so
there is correctly no blank gap.

What remains is a hard cut. The two players are visually very different — a
54pt floating pill with a one-line title versus a 124pt full-width sheet with
stacked title, grabber and a longer progress bar — and one replaces the other
between two frames with nothing bridging them.

```ts
// src/hooks/use-player-swap.ts:32-40 — current, no reduced-motion branch
function expand() {
  'worklet';
  pillY.value = withTiming(PILL_OUT, OUT);
  dockY.value = withDelay(Motion.overlapMs, withSpring(0, Motion.spring));
  ...
}
```

The audit playbook is explicit: reduced motion means *fewer and gentler*
animations, not zero — keep opacity transitions that aid comprehension, drop
the position changes.

## Target

When reduced motion is on: positions jump (no translation is perceived), and
the **incoming** player fades in over 150ms. The outgoing player is already
off-screen, so it needs no fade.

```ts
/* target */
import { ReduceMotion, useReducedMotion } from 'react-native-reanimated';

/**
 * `reduceMotion: Never` is load-bearing: without it `withTiming` would itself
 * be disabled by the system setting and the crossfade would jump, defeating
 * the whole plan. No easing — linear is correct for a pure crossfade.
 */
const FADE = { duration: 150, reduceMotion: ReduceMotion.Never } as const;

const reduced = useReducedMotion();
const dockOpacity = useSharedValue(1);
const pillOpacity = useSharedValue(1);

function expand() {
  'worklet';
  if (expanded.value) return;
  expanded.value = true;
  if (reduced) {
    pillY.value = PILL_OUT;
    dockY.value = 0;
    bob.value = 0;
    dockOpacity.value = 0;
    dockOpacity.value = withTiming(1, FADE);
    return;
  }
  // …existing animated body…
}
```

`collapse()` mirrors it: `dockY.value = DOCK_OUT; pillY.value = 0; bob.value = 0;`
then `pillOpacity.value = 0; pillOpacity.value = withTiming(1, FADE);`.

`settleBack()` under reduced motion sets `dockY.value = 0; bob.value = 0;`
with no spring.

Both animated styles gain the opacity:

```ts
const dockStyle = useAnimatedStyle(() => ({
  opacity: dockOpacity.value,
  transform: [{ translateY: dockY.value }],
}));
```

## Repo conventions to follow

- Shared values are declared at the top of `usePlayerSwap` — see
  `src/hooks/use-player-swap.ts:26-29`.
- Timing configs are module-level `as const` objects — see
  `src/hooks/use-player-swap.ts:18` (`const OUT = { … } as const;`).
- `useReducedMotion()` is a React hook: call it in the hook body, never inside
  a worklet. The resulting boolean is captured by the worklet closure.

## Steps

1. Add `useReducedMotion` to the existing `react-native-reanimated` import in
   `src/hooks/use-player-swap.ts`.
2. Add `const FADE = { duration: 150 } as const;` next to `OUT` at line 18.
3. In the hook body add `const reduced = useReducedMotion();` and the two
   opacity shared values, both initialised to `1`.
4. Add the reduced branch to `expand()`, `collapse()` and `settleBack()` as
   shown in Target, each returning early.
5. Add `opacity: dockOpacity.value` to `dockStyle` and
   `opacity: pillOpacity.value` to `pillStyle`.
6. Leave `contentStyle` alone — `bob` is already set to `0` in every reduced
   branch, so the content never moves.

## Boundaries

- Do NOT gate the drag itself on reduced motion. A drag must always track the
  finger; that is direct manipulation, not animation.
- Do NOT add `reduceMotion:` options to the existing `withTiming`/`withSpring`
  calls — the defaults are already correct.
- Do NOT touch `src/constants/pumice.ts`.
- Do NOT change any existing duration, easing or spring value.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors.
- **Feel check**: on the iOS simulator, enable
  Settings → Accessibility → Motion → Reduce Motion, then:
  - Tap the pill. The dock must **fade** in over roughly a sixth of a second,
    in place, with no sliding.
  - Drag the dock down. It must still follow the finger; only the release
    should be instant.
  - Tap the grabber. The pill must fade in, not appear between two frames.
  - Confirm nothing moves vertically: the album row and card must not bob.
  - Turn Reduce Motion back off and confirm the sliding swap is unchanged.
- **Done when**: with Reduce Motion on, every state change is a fade and no
  element translates; with it off, behaviour is byte-for-byte the old one.


## Execution note

Implemented as specified, including the `reduceMotion: ReduceMotion.Never` on
`FADE` — without it `withTiming` is itself disabled by the system setting and
the crossfade jumps, making the whole plan a no-op. That trap was found by
reading `react-native-reanimated/lib/module/animation/util.js:101`.

**Not exercised on device.** `simctl ui` exposes appearance, contrast and
content size but not Reduce Motion, and the `App-prefs:root=ACCESSIBILITY`
deep link lands on a blank pane. The branch typechecks and the semantics were
confirmed from the Reanimated source, but nobody has watched it fade.
