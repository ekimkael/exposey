# Animation plans

Motion audit of the Papyrus coverflow strip, against the `improve-animations`
bar. Audited at commit `7aa01fc`.

| # | Plan | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| 001 | [Add a reduced-motion path to the coverflow strip](001-reduced-motion-coverflow.md) | MEDIUM | Accessibility | DONE |
| 002 | [Add press feedback to the coverflow thumbnails](002-thumbnail-press-feedback.md) | MEDIUM | Physicality | DONE |
| 003 | [Swipe the hero left/right to change entry](003-hero-swipe-navigation.md) | feature | Missed opportunity | DONE |

## Execution order

Either order works — **the two plans are independent**. They touch the same
file (`src/components/coverflow-strip.tsx`) but disjoint regions:

- 001 restructures the body of the existing `useAnimatedStyle` worklet.
- 002 adds a second, separate animated style and changes the returned JSX.

Running 001 first is marginally easier, since 002's JSX change is the last
edit either plan makes to the render body.

If both are executed by separate agents in parallel, expect a merge conflict in
the import block at `coverflow-strip.tsx:4-11` and in the constants block —
both plans add to each. Resolve by taking the union.

## Audited and deliberately not planned

- **`scrollTo({ animated: true })` uses the platform curve**
  (`coverflow-strip.tsx:98`). Tapping a thumbnail scrolls with UIScrollView's
  canned easing rather than the momentum physics that govern the rest of the
  strip. Fixing it properly means driving the scroll offset from a shared value
  with a spring, which amounts to reimplementing snap-scrolling. Disproportionate
  to the payoff — LOW severity, high effort.

- **The hero image swaps as a hard cut** (`src/app/index.tsx:34`,
  `transition={0}`). A 302×439pt image teleports when the centred entry changes.
  This is a deliberate fidelity choice, documented in the root `README.md`: the
  reference recording shows no crossfade at 30fps. A ~100ms crossfade would
  soften it, at the cost of diverging from the reference. Owner's call, not a
  defect. **Superseded by plan 003**, which makes the swap gesture-driven and
  therefore animated by construction — 003 knowingly departs from the reference
  here and updates the docs to say so.

## Categories that came back clean

Purpose & frequency, interruptibility, performance, and cohesion needed no
findings. The strip animates `transform` and `opacity` only, runs entirely on
the UI thread, and is fully interruptible with real velocity — because it is
scroll-linked through `useScrollOffset` rather than tweened. There is no
`ease-in`, no `transition: all`, no `scale(0)`, no keyframes on interruptible
UI, and no duplicated easing constants.
