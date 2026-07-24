# 001 — Guard the player swap against re-entrant triggers

- **Status**: DONE
- **Commit**: 626d7a3
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 1 file, ~10 lines

## Problem

`expand()` and `collapse()` both re-run unconditionally every time their gesture
fires. Springs retarget gracefully when re-triggered, but `withDelay` does not —
it restarts its countdown from zero.

```ts
// src/hooks/use-player-swap.ts:31-40 — current
function expand() {
  'worklet';
  pillY.value = withTiming(PILL_OUT, OUT);
  dockY.value = withDelay(Motion.overlapMs, withSpring(0, Motion.spring));
  bob.value = withSequence(
    withTiming(Motion.bob, { duration: Motion.overlapMs, easing: Easing.in(Easing.cubic) }),
    withSpring(0, Motion.spring)
  );
}
```

A second tap on the pill 100ms after the first restarts the 120ms delay, so the
dock arrives at ~220ms instead of ~120ms. The user sees the pill leave, then a
pause, then the dock — a stutter in the exact window they are watching.

The same applies to `collapse()` at `src/hooks/use-player-swap.ts:47-52`, whose
`withDelay(Motion.gapMs, …)` is 500ms long: tapping the grabber twice in quick
succession restarts a half-second timer, so the pill takes up to 1s to return.

## Target

A shared boolean gates both transitions. Calls that would not change state are
ignored outright.

```ts
/* target */
const expanded = useSharedValue(false);

function expand() {
  'worklet';
  if (expanded.value) return;
  expanded.value = true;
  // …existing body unchanged…
}

function collapse(velocity: number) {
  'worklet';
  if (!expanded.value) return;
  expanded.value = false;
  // …existing body unchanged…
}
```

`settleBack()` must NOT touch `expanded` — a cancelled drag leaves the player
expanded, which is already the current value.

## Repo conventions to follow

- Animation state lives in `useSharedValue` inside `usePlayerSwap`, never in
  React state — see `src/hooks/use-player-swap.ts:26-29`.
- Worklet functions declare `'worklet';` as their first statement — see
  `src/hooks/use-player-swap.ts:33`.

## Steps

1. In `src/hooks/use-player-swap.ts`, add `const expanded = useSharedValue(false);`
   directly below `const dragFrom = useSharedValue(0);` (line 29).
2. In `expand()`, insert `if (expanded.value) return;` and `expanded.value = true;`
   as the first two statements after `'worklet';`.
3. In `collapse()`, insert `if (!expanded.value) return;` and
   `expanded.value = false;` as the first two statements after `'worklet';`.
4. Leave `settleBack()` unchanged.

## Boundaries

- Do NOT touch `src/components/now-playing-player.tsx` or `src/constants/pumice.ts`.
- Do NOT change any duration, easing, or spring value.
- Do NOT convert the shared value to React state — it is read inside worklets.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors.
- **Feel check**: run on the iOS simulator (`npx expo run:ios`), then:
  - Double-tap the pill as fast as possible. The dock must arrive on the same
    beat as a single tap — no added pause between the pill leaving and the dock
    rising.
  - Tap the grabber twice quickly. The pill must return once, on the original
    schedule, not after a restarted 500ms timer.
  - Drag the dock halfway down and release (a cancelled collapse), then drag it
    down fully. The second drag must still collapse — proof that `settleBack`
    did not clear `expanded`.
- **Done when**: rapid re-triggering of either gesture produces the same timing
  as a single trigger.
