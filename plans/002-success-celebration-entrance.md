# 002 — Animate the success screen entrance

- **Status**: DONE
- **Commit**: 424bbc5
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Physicality
- **Estimated scope**: 1 file (~35 lines changed)
- **Depends on**: plan 001 (motion tokens)

## Problem

`src/app/success.tsx` is the payoff of the entire sign-up flow — the one rare,
high-emotion, first-run-only moment in the app. It currently renders with zero
motion: the green check mark and both lines of text are simply there the instant
the screen pushes in.

```tsx
// src/app/success.tsx:23 — current
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 32, paddingBottom: insets.bottom }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Image source={require('@/assets/images/success-check.svg')} style={{ width: 140, height: 140 }} contentFit="contain" />
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 30, lineHeight: 36, textAlign: 'center', color: colors.text }}>
            Thanks, {name}! You&apos;re all set
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 22, textAlign: 'center', color: colors.textMuted }}>
            Your smart investment journey starts now, powered by real-time insights and seamless tracking.
          </Text>
        </View>
      </View>
```

Rare, celebratory screens are exactly where a delight budget is allowed to be
spent. Everything else in this app is deliberately crisp; this screen should be
the one place with a visible, satisfying bounce.

## Target

The check mark pops in with a spring; the text block follows with a short
staggered fade-up. Exact target behaviour:

| Element | Property | From | To | Animation |
| --- | --- | --- | --- | --- |
| Check mark | `scale` | `0.9` | `1` | `withSpring(1, spring.celebration)` |
| Check mark | `opacity` | `0` | `1` | `withTiming(1, { duration: duration.short, easing: easing.out })` |
| Text block | `opacity` | `0` | `1` | `withDelay(80, withTiming(1, { duration: duration.short, easing: easing.out }))` |
| Text block | `translateY` | `12` | `0` | `withDelay(80, withTiming(0, { duration: duration.short, easing: easing.out }))` |

Hard requirements:

- The check mark starts at `scale: 0.9`, **never** at `scale: 0`. Nothing in the
  real world appears from nothing.
- The stagger between the check mark and the text is exactly `80` ms — the top of
  the 30–80ms stagger range. Stagger is decorative and must never block
  interaction: the "Continue" button is NOT animated and stays tappable from
  frame one.
- Under reduced motion, keep the opacity fades and drop both the scale and the
  translate (reduced motion means gentler, not zero).

Target code for the animated pieces:

```tsx
// target — src/app/success.tsx
const reduceMotion = useReducedMotion();
const enter = useSharedValue(0);

useEffect(() => {
  enter.value = 1;
}, [enter]);

const checkStyle = useAnimatedStyle(() => ({
  opacity: withTiming(enter.value, { duration: duration.short, easing: easing.out }),
  transform: [
    { scale: reduceMotion ? 1 : withSpring(0.9 + enter.value * 0.1, spring.celebration) },
  ],
}));

const textStyle = useAnimatedStyle(() => ({
  opacity: withDelay(80, withTiming(enter.value, { duration: duration.short, easing: easing.out })),
  transform: [
    { translateY: reduceMotion ? 0 : withDelay(80, withTiming((1 - enter.value) * 12, { duration: duration.short, easing: easing.out })) },
  ],
}));
```

## Repo conventions to follow

- Reanimated is already used in this repo; imitate `src/components/otp-input.tsx`
  for the import shape and the `useSharedValue` + `useAnimatedStyle` pattern:
  ```tsx
  // src/components/otp-input.tsx:4
  import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
  ```
- Motion values come from `@/lib/motion` (created in plan 001). Import them as
  `import { duration, easing, spring } from '@/lib/motion';`. Never hand-type a
  duration or a curve.
- Styles are inline objects, not `StyleSheet.create`. Keep that.
- JSDoc: every component in this repo has a block comment; update the existing
  `SuccessScreen` JSDoc to mention the entrance animation.

## Steps

1. In `src/app/success.tsx`, add to the existing imports:
   - `import { useEffect } from 'react';`
   - `import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';`
   - `import { duration, easing, spring } from '@/lib/motion';`
2. Inside `SuccessScreen`, after the existing `const name = …` line, add the
   `reduceMotion`, `enter`, `useEffect`, `checkStyle` and `textStyle` code
   exactly as written in the **Target** section.
3. Wrap the check mark: replace the bare `<Image … />` with an
   `<Animated.View style={checkStyle}>` containing the unchanged `<Image … />`.
   Do not change the image's `source`, `style` or `contentFit`.
4. Convert the text wrapper `<View style={{ alignItems: 'center', gap: 12 }}>`
   into `<Animated.View style={[{ alignItems: 'center', gap: 12 }, textStyle]}>`.
   Leave both `<Text>` elements and their styles untouched.
5. Update the `SuccessScreen` JSDoc block to note that the check springs in and
   the copy follows with an 80ms stagger, and that both are reduced under the
   system Reduce Motion setting.

## Boundaries

- Do NOT animate, wrap or otherwise touch the `<PrimaryButton label="Continue" …>`
  — it must remain immediately interactive.
- Do NOT change any copy, colour, font, spacing or layout value.
- Do NOT touch any other screen.
- Do NOT add dependencies.
- If the current code at `src/app/success.tsx:23` does not match the excerpt in
  **Problem**, STOP and report drift instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` → `TypeScript compilation completed`.
  `./node_modules/.bin/eslint src` → no new warnings.
- **Feel check**: run the app (`npm run ios`), complete the sign-up flow
  (verification code `428913`, then the three profile steps) to reach the success
  screen, and confirm:
  - The check mark grows from slightly-smaller to full size with one soft
    overshoot — it must never start invisible-and-tiny (`scale: 0`) nor wobble
    more than once.
  - The headline and body lift a few points as they fade in, clearly *after* the
    check has begun, not simultaneously.
  - The "Continue" button does not move or fade, and can be tapped during the
    animation.
  - Re-enter the screen (back, then forward again) and confirm the animation
    replays cleanly rather than getting stuck mid-way.
  - In the Simulator, enable Settings → Accessibility → Motion → Reduce Motion,
    re-run the flow, and confirm the check and text still fade in but no longer
    scale or slide.
- **Done when**: the success screen animates as described, `tsc` passes, and
  `git diff --stat` shows only `src/app/success.tsx` changed.
