# 001 — Rotary-dial marquee (barrel effect)

Commit: feat/spotify-marquee-onboarding @ post-initial-reproduction.
Target file: `src/components/artist-marquee.tsx` (+ `artist-card.tsx`).

## Finding (HIGH — feel-breaking vs reference)

The marquee is a constant linear infinite scroll. Frame analysis of the
reference (60 fps, 4.4 s loop) shows a **rotary-dial** motion instead:

| Phase | Time | Motion |
|---|---|---|
| Advance | 0 → 2400 ms | +4 slots, S-curve (`Easing.inOut(Easing.cubic)`) |
| Hold | 2400 → 3000 ms | none |
| Rewind | 3000 → 3600 ms | back to 0, `Easing.inOut(Easing.cubic)` |
| Hold | 3600 → 4400 ms | none, then loop |

Cards also rotate/shift **as a function of viewport position** (barrel):
flat at center (only their static ±3–8° base tilt), tilted to **-18°**
and shifted **-16 pt left** at the bottom edge, **+6° / -6 pt** at the top
edge. Measured: Tame Impala -22° entering bottom, -4° at center, -2° at
top; ALT-J -25° at bottom during rewind, -2° at center.

## Fix

1. Remove the duplicated list (no seamless loop needed — the dial returns).
2. Replace the `withRepeat(withTiming(-CYCLE, linear))` with
   `withRepeat(withSequence(advance, hold, rewind, hold))` per the table
   (hold = `withTiming(same-value, { duration })`).
3. Per-card `useAnimatedStyle` reading the scroll shared value and the
   measured viewport height H: with `d = slotCenterY + y - H/2`,
   - `rotate = artist.tilt + interpolate(d, [-H/2, 0, H/2], [6, 0, -18])` deg
   - `translateX = artist.offsetX + interpolate(d, [-H/2, 0, H/2], [-6, 0, -16])`
   Move the static transform out of `ArtistCard` into this style.
4. Transform/opacity only; worklets on UI thread.

## Verification

Record simulator video, split into frames at 5 fps, compare against
`/tmp/frames/trk_*.png`: same phase boundaries (motion stops ~2.4 s,
rewind ~3.0–3.6 s), bottom-entering cards visibly rocked back ~-20°.
