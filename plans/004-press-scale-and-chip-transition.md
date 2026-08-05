# 004 — Replace opacity-flick press feedback with a shared scale press, and animate chip selection

- **Status**: DONE
- **Commit**: 424bbc5
- **Severity**: MEDIUM
- **Category**: Physicality & origin + Cohesion & tokens
- **Estimated scope**: 1 new file + 5 edited files (~70 lines total)
- **Depends on**: plan 001 (motion tokens)

## Problem

**(a) Press feedback is an instant opacity flick, and the value differs per
component.** React Native's `({ pressed })` style callback swaps opacity with no
transition at all: the element blinks to a dimmer state and blinks back. There is
no sense of the surface being physically pushed. The three call sites also
disagree on how much to dim (0.6 / 0.7 / 0.85), so the app has three different
press "feels".

```tsx
// src/components/country-row.tsx:26 — current
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        opacity: pressed ? 0.6 : 1,
      })}>
```

```tsx
// src/components/social-button.tsx:27 — current
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 52,
        borderRadius: 14,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.surface,
        opacity: pressed ? 0.7 : 1,
      })}>
```

```tsx
// src/app/phone.tsx:37 — current
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
            height: 56,
            opacity: pressed ? 0.6 : 1,
          })}>
```

```tsx
// src/app/profile/contact.tsx:59 — current
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.inputBg,
              borderRadius: 14,
              borderCurve: 'continuous',
              paddingHorizontal: 14,
              height: 56,
              opacity: pressed ? 0.6 : 1,
            })}>
```

**(b) The wizard chips have no press feedback at all, and their selection colour
teleports.** Tapping a chip in `ChipGroup` swaps `backgroundColor` and the label
colour between two constants in a single frame — a hard cut on the most-tapped
control of the three-step wizard.

```tsx
// src/components/chip-group.tsx:40 — current
            style={{
              paddingHorizontal: 18,
              height: 44,
              justifyContent: 'center',
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: selected ? colors.accent : colors.surfaceMuted,
            }}>
```

## Target

**(a)** A single shared `PressableScale` component that every tappable
surface/card/row uses. Exact motion spec:

| Phase | Property | Value | Animation |
| --- | --- | --- | --- |
| Press in | `scale` | `0.97` | `withTiming(…, { duration: 160, easing: easing.out })` |
| Press in | `opacity` | `0.9` | `withTiming(…, { duration: 160, easing: easing.out })` |
| Release | `scale` | `1` | same timing |
| Release | `opacity` | `1` | same timing |

`0.97` is the subtle end of the 0.95–0.98 press range; `160`ms is the top of the
100–160ms press-feedback budget; the curve is the strong ease-out
`Easing.bezier(0.23, 1, 0.32, 1)`. Under reduced motion the scale is pinned to
`1` and only the opacity dip remains.

```tsx
// target — src/components/pressable-scale.tsx
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration, easing, pressScale } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Static style for the pressable surface. Function-form styles are not supported. */
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({ style, onPressIn, onPressOut, ...props }: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const config = { duration: duration.press, easing: easing.out };
    return {
      opacity: withTiming(1 - pressed.value * 0.1, config),
      transform: [{ scale: reduceMotion ? 1 : withTiming(1 - pressed.value * (1 - pressScale), config) }],
    };
  });

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        pressed.value = 1;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = 0;
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
```

**(b)** Chip selection cross-fades its background and label colour over
`duration.short` (200ms) with the strong ease-out curve, driven by
`interpolateColor` off a shared value that tracks `selected`. The chip also gains
the same press scale as everything else.

```tsx
// target — src/components/chip-group.tsx (per-chip)
const progress = useSharedValue(selected ? 1 : 0);

useEffect(() => {
  progress.value = withTiming(selected ? 1 : 0, { duration: duration.short, easing: easing.out });
}, [selected, progress]);

const chipStyle = useAnimatedStyle(() => ({
  backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surfaceMuted, colors.accent]),
}));

const labelStyle = useAnimatedStyle(() => ({
  color: interpolateColor(progress.value, [0, 1], [colors.text, colors.accentText]),
}));
```

Because hooks cannot be called in a loop, each chip must be extracted into its
own component (see step 6).

## Repo conventions to follow

- Components live in `src/components/` with kebab-case filenames and a JSDoc
  block above the exported component — see `src/components/chip-group.tsx:22`.
- Motion values come from `@/lib/motion` (plan 001). Never hand-type a duration
  or curve.
- Colours always come from `useTheme()`; never inline a hex value.
- Styles are inline objects, not `StyleSheet.create`.
- Reanimated import shape exemplar: `src/components/otp-input.tsx:4`.

## Steps

1. Create `src/components/pressable-scale.tsx` with exactly the target code
   above, plus a JSDoc block explaining that it is the standard press feedback
   for rows, cards and secondary buttons, that it scales to 0.97 over 160ms with
   the shared ease-out curve, and that the scale is dropped under Reduce Motion.
2. `src/components/country-row.tsx`: import `PressableScale` from
   `@/components/pressable-scale`, swap the `<Pressable>` for `<PressableScale>`,
   and convert its function-form style to a plain object — delete the
   `opacity: pressed ? 0.6 : 1` line, keep every other property identical.
3. `src/components/social-button.tsx`: same swap. Delete
   `opacity: pressed ? 0.7 : 1`, keep `flex: 1`, the border, the background and
   all sizing exactly as they are.
4. `src/app/phone.tsx`: same swap for the country pill at line 36. Delete
   `opacity: pressed ? 0.6 : 1`. Do not touch the `TextInput` below it or the
   divider `<View>`.
5. `src/app/profile/contact.tsx`: same swap for the residence row at line 57.
   Delete `opacity: pressed ? 0.6 : 1`. Do not touch the `TextField`s around it.
6. `src/components/chip-group.tsx`: extract the per-option body of the `.map()`
   into a new local component in the same file, e.g.
   `function Chip<T extends string>({ option, selected, onPress }: …)`, so the
   animation hooks are per-chip. Inside it:
   - use the `progress` / `chipStyle` / `labelStyle` code from the **Target**
     section,
   - render `<PressableScale style={[{ paddingHorizontal: 18, height: 44, justifyContent: 'center', borderRadius: 14, borderCurve: 'continuous' }, chipStyle]}>`,
   - render the label as `<Animated.Text style={[{ fontFamily: font.semibold, fontSize: 15 }, labelStyle]}>`,
   - keep the existing `Haptics.selectionAsync()` call on iOS and the `onChange`
     call exactly as they are today.
7. Leave `ChipGroup`'s outer `<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>` and its props/JSDoc unchanged apart from rendering `<Chip>`.

## Boundaries

- Do NOT touch `src/components/primary-button.tsx`. Its iOS/Android paths render
  native SwiftUI / Jetpack Compose buttons which already have platform press
  feedback; its `opacity: pressed ? 0.85 : 1` is the web-only fallback and is out
  of scope.
- Do NOT change any padding, height, radius, border, colour token or copy — this
  plan changes press/selection motion only.
- Do NOT convert other `Pressable`s (the "Sign up" text link in
  `src/app/index.tsx`, the header buttons in `src/app/country.tsx`, the
  `Pressable` wrapper inside `src/components/otp-input.tsx`): text links and
  header glyphs should not scale, and the OTP wrapper is a focus-catcher, not a
  button.
- Do NOT add dependencies.
- If any cited excerpt does not match what you find, STOP and report drift.

## Verification

- **Mechanical**: `npx tsc --noEmit` → `TypeScript compilation completed`.
  `./node_modules/.bin/eslint src` → no new warnings; in particular no
  `react-hooks/rules-of-hooks` error, which would mean the chip hooks were left
  inside the `.map()` callback.
- **Feel check**: run the app and press-and-hold (don't just tap) each surface:
  - Country row, Google/Apple buttons, the phone-screen country pill, the
    residence row: each should visibly sink slightly and dim while held, then
    return smoothly on release — no blink, no jump.
  - Hold a chip in the wizard's step 3 and confirm the same sink; release it and
    confirm the fill colour and label colour cross-fade over ~200ms instead of
    cutting.
  - Tap two chips in the same group in quick succession: the outgoing chip must
    fade out of the accent colour while the incoming one fades in — neither
    should snap.
  - Scroll the country list while pressing: the row must not stay stuck in the
    pressed state after the scroll steals the gesture.
  - Enable Settings → Accessibility → Motion → Reduce Motion and repeat: surfaces
    must still dim on press but must not scale; chip colours should still
    cross-fade.
- **Done when**: all five call sites use `PressableScale`, no `pressed ?` opacity
  ternary remains in the five files listed in **Steps**
  (`grep -rn "pressed ?" src` should only match
  `src/components/primary-button.tsx`), and `tsc` passes.
