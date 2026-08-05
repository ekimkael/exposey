# 003 — Gate the OTP shake behind reduced motion and give it spring physics

- **Status**: DONE
- **Commit**: 424bbc5
- **Severity**: MEDIUM
- **Category**: Accessibility (primary) + Easing & physicality (secondary)
- **Estimated scope**: 1 file (~20 lines changed)
- **Depends on**: plan 001 (motion tokens)

## Problem

Two issues in the same code block.

**(a) Accessibility — the shake ignores Reduce Motion.** When the user enters a
wrong verification code, the OTP row translates horizontally five times. Users
with the system "Reduce Motion" setting enabled — often precisely because
oscillating movement triggers nausea or vestibular symptoms — still get the full
shake. There is no reduced-motion handling anywhere in the repo (`grep -rn
"useReducedMotion" src` returns nothing).

**(b) Feel — the shake is linear and mechanical.** Five equal 50ms `withTiming`
legs with the default linear-ish easing read like a metronome, not like a
physical object refusing to move.

```tsx
// src/components/otp-input.tsx:31 — current
  useEffect(() => {
    if (!error) return;
    if (process.env.EXPO_OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, shake]);
```

Note the error haptic and the red cell colouring are correct and must survive
both fixes — reduced motion means dropping *movement*, not dropping *feedback*.

## Target

**(a)** When `useReducedMotion()` is `true`, skip the translate entirely. The
error haptic still fires and the cells still turn red — the user still gets
unambiguous, non-motion feedback.

**(b)** Keep the same 5-leg decaying sequence, but ease each leg with the strong
ease-out curve so the row snaps away and settles, and land the final leg on a
spring so it comes to rest physically instead of stopping dead.

```tsx
// target — src/components/otp-input.tsx
const reduceMotion = useReducedMotion();

useEffect(() => {
  if (!error) return;
  if (process.env.EXPO_OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  if (reduceMotion) return;
  shake.value = withSequence(
    withTiming(-8, { duration: 50, easing: easing.out }),
    withTiming(8, { duration: 50, easing: easing.out }),
    withTiming(-6, { duration: 50, easing: easing.out }),
    withTiming(6, { duration: 50, easing: easing.out }),
    withSpring(0, spring.press),
  );
}, [error, reduceMotion, shake]);
```

Exact values, do not substitute:

- Curve: `easing.out` from `@/lib/motion` = `Easing.bezier(0.23, 1, 0.32, 1)`.
- Final leg: `withSpring(0, spring.press)` where `spring.press` is
  `{ duration: 260, dampingRatio: 0.9 }` — high damping so it settles without a
  visible second bounce. An error shake must not look playful.
- Offsets stay `-8, 8, -6, 6, 0`. Total motion stays well under 300ms.

## Repo conventions to follow

- Motion values come from `@/lib/motion` (plan 001):
  `import { easing, spring } from '@/lib/motion';`. Do not hand-type
  `Easing.bezier(...)` at the call site.
- The platform guard idiom in this repo is `process.env.EXPO_OS === 'ios'`, never
  `Platform.OS` — see `src/components/otp-input.tsx:34`, which already does this
  correctly and must be left as-is.
- Reanimated imports are a single named-import line, e.g.
  `src/components/otp-input.tsx:4`.

## Steps

1. In `src/components/otp-input.tsx`, extend the existing Reanimated import (line
   4) to also pull `useReducedMotion` and `withSpring`.
2. Add `import { easing, spring } from '@/lib/motion';` to the imports.
3. Inside `OtpInput`, next to the existing `const shake = useSharedValue(0);`,
   add `const reduceMotion = useReducedMotion();`.
4. Replace the body of the existing `useEffect` (lines 31–42) with the target
   code above, keeping the haptic call before the reduced-motion early return so
   the haptic always fires.
5. Add `reduceMotion` to the effect's dependency array: `[error, reduceMotion, shake]`.
6. Update the inline comment above the effect from `// Shake + haptic whenever we
   enter the error state.` to state that the haptic always fires but the shake is
   skipped under Reduce Motion.

## Boundaries

- Do NOT change the error colours, the cell borders, the `dangerSoft`
  background, or anything else in the render tree — this plan touches the
  `useEffect` and the imports only.
- Do NOT remove or reorder the `Haptics.notificationAsync` call, and do not put
  it after the reduced-motion return.
- Do NOT change the OTP length, the digit-entry logic or the hidden `TextInput`.
- Do NOT add dependencies.
- If the code at `src/components/otp-input.tsx:31` does not match the excerpt in
  **Problem**, STOP and report drift.

## Verification

- **Mechanical**: `npx tsc --noEmit` → `TypeScript compilation completed`.
  `./node_modules/.bin/eslint src` → no new warnings (in particular no
  `react-hooks/exhaustive-deps` warning: `reduceMotion` must be in the deps).
- **Feel check**: run the app, reach the verification screen, enter a wrong
  6-digit code (anything other than `428913`) and press "Next":
  - The row snaps out fast and settles back to centre with no visible second
    bounce — it should read as "refused", not "wobbly".
  - The cells turn red and the error haptic fires.
  - Enter another wrong code immediately: the shake restarts cleanly and does not
    accumulate drift (the row must end exactly centred).
  - Then enable Settings → Accessibility → Motion → Reduce Motion in the
    Simulator and repeat: the row must NOT move at all, while the red cells,
    the error message and the haptic still happen.
- **Done when**: both behaviours above hold, `tsc` passes, and `git diff --stat`
  shows only `src/components/otp-input.tsx` changed.
