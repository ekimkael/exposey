# 005 — Make the upward rubber-band resistance rise instead of staying constant

- **Status**: DONE
- **Commit**: 626d7a3
- **Severity**: LOW
- **Category**: Interruptibility
- **Estimated scope**: 2 files, ~10 lines

## Problem

Dragging the dock upward applies a fixed ratio:

```ts
// src/hooks/use-player-swap.ts:70 — current
dockY.value = raw < 0 ? raw * Motion.rubberBand : raw;
```

```ts
// src/constants/pumice.ts — current
/** Resistance applied when dragging the dock upward, where it cannot go. */
rubberBand: 0.3,
```

Resistance never increases. Drag up 400pt and the dock moves 120pt; drag up
800pt and it moves 240pt — off the top of its own travel, past the album row.
The audit playbook calls out "hard stops at drag boundaries instead of rising
friction"; a constant multiplier is the mirror problem — no boundary at all.

Real rubber-banding is asymptotic: resistance grows with distance so the
element converges on a limit it never crosses.

## Target

The standard iOS rubber-band function, bounded by the dock's own height:

```ts
/* target — src/hooks/use-player-swap.ts */
.onUpdate((event) => {
  const raw = dragFrom.value + event.translationY;
  if (raw < 0) {
    // Asymptotic resistance: as the pull grows, travel converges on `limit`.
    const pull = -raw;
    const limit = Metrics.dock.height;
    dockY.value = -(pull * Motion.rubberBand * limit) / (pull * Motion.rubberBand + limit);
  } else {
    dockY.value = raw;
  }
  bob.value = Math.min(Math.max(dockY.value, 0) / Metrics.dock.height, 1) * Motion.bob;
});
```

```ts
/* target — src/constants/pumice.ts */
/**
 * Rubber-band coefficient for upward drags, where the dock cannot go. Travel
 * follows (d·c·L)/(d·c + L) and converges on L = the dock's height, so the
 * sheet resists harder the further it is pulled and never leaves its own slot.
 */
rubberBand: 0.55,
```

`0.55` is the coefficient used by UIScrollView. With the old `0.3` the curve
would feel noticeably stiffer at small pulls than the current linear response;
`0.55` keeps the first few points similar and only diverges as the pull grows.

## Repo conventions to follow

- Tunables live in the `Motion` block of `src/constants/pumice.ts`, each with a
  JSDoc line — see `dismissRatio` there.
- Gesture math stays inside the `.onUpdate` worklet in
  `src/hooks/use-player-swap.ts`; no helper modules for arithmetic this small.

## Steps

1. In `src/constants/pumice.ts`, change `rubberBand: 0.3` to `0.55` and replace
   its comment with the JSDoc from Target.
2. In `src/hooks/use-player-swap.ts`, replace the single-line ternary in
   `.onUpdate` with the `if (raw < 0) { … } else { … }` block from Target.
3. Leave the `bob` line exactly as it is — it already clamps negatives to zero,
   so upward drags still do not move the content.

## Boundaries

- Do NOT apply rubber-banding to downward drags. Downward is the real direction
  of travel and must track the finger 1:1.
- Do NOT change `dismissRatio` or the dismissal logic.
- Do NOT touch `src/components/now-playing-player.tsx`.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors.
- **Feel check**: on the iOS simulator, with the dock expanded:
  - Drag upward slowly and far — past the collab row. The dock must slow down
    progressively and stop short of the album artwork; it must never travel
    more than its own height (124pt) above its resting position.
  - Drag upward a small amount. It must still move — resistance rising must not
    read as the gesture being ignored.
  - Release from any upward position. The dock must spring back to rest.
  - Drag downward. Travel must still be 1:1 with the finger.
  - Confirm the album row and card do not move during upward drags.
- **Done when**: upward travel visibly converges on a limit rather than
  continuing in proportion to the finger.
