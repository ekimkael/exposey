# 007 — Let an upward swipe on the pill expand it

- **Status**: DONE (deviated — see note)
- **Commit**: 626d7a3
- **Severity**: MEDIUM (missed opportunity)
- **Category**: Missed opportunities
- **Estimated scope**: 3 files, ~20 lines

## Problem

The two directions of the swap use different input verbs:

```ts
// src/hooks/use-player-swap.ts:83-85 — expand is tap-only
const tapPill = Gesture.Tap().onEnd((_event, success) => {
  if (success) expand();
});
```

```ts
// src/hooks/use-player-swap.ts:61-63 — collapse is a drag
const dragDock = Gesture.Pan()
  .activeOffsetY([-10, 10])
```

Teaching a user that the sheet is dragged down to dismiss teaches them that it
can be dragged. The reciprocal gesture — swipe the pill up to bring it back —
does nothing. Nothing moves, nothing resists, there is no signal the gesture
was even seen. That is the worst kind of dead input: it reads as a bug rather
than as an unsupported action.

## Target

A pan on the pill, composed with the existing tap, that commits to `expand()`
on a sufficient upward swipe.

```ts
/* target — src/hooks/use-player-swap.ts */
// ponytail: fires expand() on release rather than tracking the finger through
// the whole swap. Upgrade path if it feels disconnected: drive dockY/pillY
// from translationY the way dragDock does, and commit on the same thresholds.
const swipePillUp = Gesture.Pan()
  .activeOffsetY([-10, 10])
  .onEnd((event) => {
    const swipedUp = -event.translationY > Metrics.pill.height * Motion.dismissRatio;
    const flickedUp = -event.velocityY > 300;
    if (swipedUp || flickedUp) expand();
  });

const tapPill = Gesture.Race(
  Gesture.Tap().onEnd((_event, success) => {
    if (success) expand();
  }),
  swipePillUp
);
```

`Gesture.Race` lets whichever recognises first win: a stationary press stays a
tap, a 10pt upward movement becomes the pan. `expand()` is idempotent once
plan 001 lands, so there is no risk of both firing.

Threshold: `Metrics.pill.height * Motion.dismissRatio` = 54 × 0.4 ≈ 22pt of
upward travel, or an upward flick over 300 pt/s. Both are deliberately easier
than the collapse thresholds — expanding is non-destructive, collapsing hides
the controls.

## Repo conventions to follow

- Gestures are built in `usePlayerSwap` and returned as named values, then
  handed to `GestureDetector` in the components — see
  `src/hooks/use-player-swap.ts:95` and
  `src/components/now-playing-player.tsx:127`.
- Thresholds reuse existing `Motion` and `Metrics` tokens rather than inventing
  parallel numbers — see `src/hooks/use-player-swap.ts:74`.

## Steps

1. In `src/hooks/use-player-swap.ts`, add the `swipePillUp` pan exactly as in
   Target, including the `ponytail:` comment.
2. Wrap the existing tap and the new pan in `Gesture.Race(...)`, keeping the
   exported name `tapPill` so the component needs no change.
3. Confirm `Gesture` is already imported from `react-native-gesture-handler`
   at line 1 — it is.

## Boundaries

- Do NOT track the finger through the expand. That is a larger rework of both
  transitions and is explicitly out of scope; the comment records it as the
  upgrade path.
- Do NOT make the pill draggable downward — there is nowhere below it to go and
  no dismiss-the-player state in this reproduction.
- Do NOT change the dock's pan, thresholds, or any timing.
- Do NOT rename the exported `tapPill`, or `src/components/now-playing-player.tsx`
  and `src/app/index.tsx` will need edits this plan does not cover.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors.
- **Feel check**: on the iOS simulator, starting from the pill:
  - Swipe up ~30pt on the pill's artwork. The dock must expand.
  - Tap the pill without moving. The dock must still expand — the pan must not
    have swallowed the tap.
  - Press the play button and drag up slightly. Play/pause must fire, or not,
    but the player must not expand from a gesture that started on the button.
  - Swipe *down* on the pill. Nothing must happen — no movement, no expand.
  - Swipe up, then immediately drag the dock back down. Both must work in
    sequence without the player getting stuck between states.
- **Done when**: an upward swipe on the pill expands it and a plain tap still
  does too.

## Dependency

Depends on **plan 001**. Without the re-entry guard, `Gesture.Race` firing both
recognisers in an edge case would call `expand()` twice and restart the dock's
delay.


## Execution note — deviated

`Gesture.Race(tap, pan)` does not work: the tap wins arbitration and the
upward swipe is never recognised (verified — the swipe was silently ignored
while the tap kept working). Shipped with `Gesture.Exclusive(pan, tap)`, which
gives the pan priority and lets the tap fire only once the pan has failed.

Verified on the simulator: a 45pt upward swipe expands; a plain tap still
expands.
