# Animation plans — Pumice player swap

Produced by `improve-animations` against commit `626d7a3`, auditing the
pill ↔ dock now-playing swap.

| # | Plan | Severity | Category | Status |
|---|---|---|---|---|
| 001 | [Guard the player swap against re-entrant triggers](001-guard-swap-re-entry.md) | MEDIUM | Interruptibility | DONE |
| 002 | [Give Reduce Motion a crossfade instead of a hard cut](002-reduced-motion-crossfade.md) | MEDIUM | Accessibility | DONE¹ |
| 003 | [Dismiss on the playbook's flick metric](003-flick-dismissal-threshold.md) | MEDIUM | Interruptibility | DONE² |
| 004 | [Add press feedback to the play button and pill target](004-press-feedback.md) | MEDIUM | Physicality | DONE¹ |
| 005 | [Make the upward rubber-band resistance rise](005-asymptotic-rubber-band.md) | LOW | Interruptibility | DONE |
| 006 | [Define the exit curve once](006-consolidate-easing-curve.md) | LOW | Cohesion | DONE |
| 007 | [Let an upward swipe on the pill expand it](007-swipe-pill-up-to-expand.md) | MEDIUM | Missed opportunity | DONE² |

¹ implemented and typechecked, but the behaviour could not be exercised on the
simulator — see each plan's execution note.
² shipped with a deviation from the plan as written — see each plan's note.

## Recommended order

1. **001** first — it is the only behavioural guard, and 002 and 007 both build
   on the `expanded` shared value it introduces.
2. **006** next — a pure refactor, cheapest to verify, and it tidies the file
   the remaining plans edit.
3. **002**, **003**, **005** in any order — each touches a different part of
   `usePlayerSwap` and they do not overlap.
4. **004** — the only plan that adds a file and edits the components.
5. **007** last — depends on 001, and is easiest to feel-check once the rest of
   the gesture work is settled.

## Dependencies

- **007 → 001**: `Gesture.Race` can fire both recognisers; `expand()` must be
  idempotent first.
- **002 → 001**: the reduced-motion branches return early on the same
  `expanded` guard.

## Not planned, deliberately

Two playbook violations were found and rejected as settled decisions:

- `Easing.in(Easing.cubic)` on the exits — the playbook says `ease-in` on UI is
  always a finding, but this curve is measured frame-by-frame off the reference
  video and documented in the README.
- The ~950ms total collapse, against a 200–500ms drawer budget — the reference's
  pacing, kept on purpose.

One suspected accessibility bug was checked and found not to exist: `withDelay`
skips its delay entirely under Reduce Motion
(`react-native-reanimated/lib/module/animation/delay.js:33`), so the collapse's
500ms gap does not survive into the reduced-motion path as a blank screen.


## Harness limitation found while executing

`touch_path` in the iOS simulator fragments slow gestures into separate
touches. A 68pt drag delivered over ~1.2s failed even the *distance* test,
which means `onUpdate` never accumulated a continuous drag. Every drag
verification in these plans therefore had to use fast gestures, and the flick
path could not be exercised at all. Treat "verified on the simulator" in these
notes as covering fast, continuous gestures only.
