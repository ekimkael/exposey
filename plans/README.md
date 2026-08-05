# Animation plans — `feat/invest-onboarding`

Audit run at commit `424bbc5`. Each plan is self-contained: an executor with no
context from the audit conversation can apply it end to end.

## Plans

| # | Title | Severity | Files | Status |
| --- | --- | --- | --- | --- |
| [001](001-motion-tokens.md) | Add shared motion tokens | LOW | `src/lib/motion.ts` (new) | DONE |
| [002](002-success-celebration-entrance.md) | Animate the success screen entrance | MEDIUM | `src/app/success.tsx` | DONE |
| [003](003-otp-shake-reduced-motion-and-spring.md) | Gate the OTP shake behind reduced motion, add spring physics | MEDIUM | `src/components/otp-input.tsx` | DONE |
| [004](004-press-scale-and-chip-transition.md) | Shared press-scale feedback + animated chip selection | MEDIUM | `pressable-scale.tsx` (new), `country-row`, `social-button`, `chip-group`, `phone`, `profile/contact` | DONE |
| [005](005-wizard-progress-fill.md) | Fill the newly-completed wizard segment | LOW | `src/components/wizard-progress.tsx` | DONE |
| [006](006-otp-digit-landing.md) | Give OTP digits a landing animation | LOW | `src/components/otp-input.tsx` | DONE |

## Recommended execution order

```
001 ──┬── 002
      ├── 003 ── 006     (same file: 003 must land before 006)
      ├── 004
      └── 005
```

1. **001 first, always.** Every other plan imports `@/lib/motion`. On its own it
   changes nothing visible, so it is safe to land immediately.
2. **002, 003, 004, 005** are mutually independent and touch disjoint files —
   they can be executed in parallel or in any order once 001 is in.
3. **006 must follow 003.** Both edit `src/components/otp-input.tsx`; running 006
   first will conflict.

If you want the biggest perceived improvement for the least work: **001 → 002 →
004**. Those three cover the celebration moment and every press surface in the
app.

## Dependencies at a glance

| Plan | Depends on | Shares files with |
| --- | --- | --- |
| 001 | — | — |
| 002 | 001 | — |
| 003 | 001 | 006 |
| 004 | 001 | — |
| 005 | 001 | — |
| 006 | 001, 003 | 003 |

## Corrections found during the on-device feel check

Two defects that only surfaced once the animations were recorded on the
simulator and stepped through frame by frame. Both are fixed in the code; the
plan documents above still describe the original (pre-fix) intent.

1. **The celebration never played (plan 002).** The entrance animation ran while
   the success screen was still sliding in from the stack push, so the check mark
   was already at full size and opacity by the time it became visible. Fixed by
   adding `ENTER_DELAY = 250` (the same treatment plan 005 applies to the wizard
   fill) before the check's and the copy's animations, so the pop happens after
   the push settles.
2. **Re-submitting the same wrong code gave no feedback (plan 003).** The shake
   fired from a `useEffect` keyed on `error`, so a second tap on "Next" with an
   unchanged code produced no shake and no haptic — the effect never re-ran.
   Fixed with an `attempt` counter prop on `OtpInput`, incremented on every
   rejected submit in `verify.tsx`, and added to the effect's dependencies.

Verification method worth reusing: `xcrun simctl io booted recordVideo`, then
`ffmpeg` frame extraction plus `magick compare -metric RMSE` between consecutive
frames to locate the moments that actually move. Screenshots alone cannot catch
a 160–520ms animation — they only prove the final state settles correctly.

## Audited and deliberately not planned

- **Carousel dot morph** (`src/components/onboarding-carousel.tsx:95`) animates
  `width` rather than a transform. Normally a performance finding, but these are
  9pt dots driven on the Reanimated UI thread from an already-running scroll
  handler; the layout cost is negligible and a `scaleX` rewrite would need
  measured widths for no perceptible gain. Left as-is on purpose.
- **Native `@expo/ui` surfaces** — `PrimaryButton` (SwiftUI / Jetpack Compose),
  `ThemeMenu` and the `DatePicker` — bring their own platform-standard motion.
  Re-animating them in JS would fight the OS and break platform feel.
- **Stack push/modal transitions** are handled by `expo-router` /
  `react-native-screens` native animators and are already correct.
- **`PrimaryButton`'s `opacity: pressed ? 0.85 : 1`** is the web-only fallback
  path; the native paths never reach it, so it is out of scope for plan 004.
