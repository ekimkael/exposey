# 006 — Give OTP digits a landing animation

- **Status**: DONE
- **Commit**: 424bbc5
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 file (~35 lines changed)
- **Depends on**: plan 001 (motion tokens). Overlaps `src/components/otp-input.tsx`
  with plan 003 — **run plan 003 first**, then this one.

## Problem

Entering a verification code is the most tactile moment of the flow: six taps,
six pieces of feedback. Today each digit simply appears, and the cell's accent
border snaps on in the same frame, with no transition:

```tsx
// src/components/otp-input.tsx:55 — current
            <View
              key={i}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: 14,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: error ? colors.dangerSoft : colors.inputBg,
                borderWidth: filled || error ? 1.5 : 0,
                borderColor: error ? colors.danger : colors.accent,
              }}>
              <Animated.Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: 20,
                  fontVariant: ['tabular-nums'],
                  color: error ? colors.danger : colors.text,
                }}>
                {char}
              </Animated.Text>
            </View>
```

Note `Animated.Text` is already used here but carries no animated style — the
component is animation-ready and simply isn't animating.

## Target

When a digit lands in a cell, the glyph pops in: scale `0.9 → 1` with opacity
`0 → 1`. Deleting a digit is the inverse and must be instant-feeling, not a slow
fade out.

| Trigger | Property | From | To | Animation |
| --- | --- | --- | --- | --- |
| Digit entered | `opacity` | `0` | `1` | `withTiming(1, { duration: duration.press, easing: easing.out })` |
| Digit entered | `scale` | `0.9` | `1` | `withSpring(1, spring.press)` |
| Digit deleted | `opacity` | `1` | `0` | `withTiming(0, { duration: 100, easing: easing.out })` |

Exact values: `duration.press` = `160`ms, `spring.press` =
`{ duration: 260, dampingRatio: 0.9 }` (high damping — a landing digit should
settle, not wobble), `easing.out` = `Easing.bezier(0.23, 1, 0.32, 1)`. The
delete fade is a deliberately shorter `100`ms so backspacing feels immediate.

Scale starts at `0.9`, **never** `0`.

Under reduced motion, keep the opacity fade and pin the scale to `1`.

```tsx
// target — src/components/otp-input.tsx (per cell)
function Cell({ char, error }: { char: string; error: boolean }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const filled = char !== '';
  const landed = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    landed.value = filled ? 1 : 0;
  }, [filled, landed]);

  const glyphStyle = useAnimatedStyle(() => ({
    opacity: withTiming(landed.value, {
      duration: landed.value === 1 ? duration.press : 100,
      easing: easing.out,
    }),
    transform: [
      { scale: reduceMotion ? 1 : withSpring(0.9 + landed.value * 0.1, spring.press) },
    ],
  }));

  // …render the existing cell View, with <Animated.Text style={[baseTextStyle, glyphStyle]}>
}
```

Because hooks cannot run inside the existing `.map()` callback, the cell body
must be extracted into its own component (step 2).

## Repo conventions to follow

- Motion values come from `@/lib/motion` (plan 001).
- Colours always come from `useTheme()`.
- Sub-components live below the main export in the same file — exemplar:
  `Radio` in `src/components/country-row.tsx:41`.
- Reanimated import shape exemplar: `src/components/otp-input.tsx:4`.

## Steps

1. Extend the Reanimated import in `src/components/otp-input.tsx` to include
   `useReducedMotion`, `withSpring` and (if plan 003 has not already added it)
   whatever else the target code needs; add
   `import { duration, easing, spring } from '@/lib/motion';` if plan 003 did not
   already add it.
2. Extract the per-cell JSX from inside the `.map()` into a `Cell` component
   placed below `OtpInput`, taking `{ char, error }` as props, using the target
   code above. Keep every existing style property (`flex: 1`, `aspectRatio: 1`,
   `borderRadius: 14`, `borderCurve: 'continuous'`, the error colours, the
   `borderWidth: filled || error ? 1.5 : 0` rule and the text's
   `fontVariant: ['tabular-nums']`) byte-for-byte identical.
3. Replace the `.map()` body with
   `<Cell key={i} char={value[i] ?? ''} error={error} />`.
4. Give `Cell` a one-line JSDoc: one OTP slot; the glyph pops in when a digit
   lands and fades out fast on delete.

## Boundaries

- Do NOT animate the cell's border or background — only the glyph. Animating the
  border alongside the shake from plan 003 would double up on error feedback.
- Do NOT change the shake `useEffect` (that is plan 003's territory), the hidden
  `TextInput`, the `handleChange` sanitiser, or the `length` prop plumbing.
- Do NOT change cell sizing, radius, gap or colours.
- Do NOT add dependencies.
- If plan 003 has not been applied yet, STOP: applying this first will create a
  conflicting edit in the same file.

## Verification

- **Mechanical**: `npx tsc --noEmit` → `TypeScript compilation completed`.
  `./node_modules/.bin/eslint src` → no new warnings, and no
  `react-hooks/rules-of-hooks` error.
- **Feel check**: run the app, reach the verification screen, and using the
  on-screen keypad:
  - Type digits one at a time — each glyph should grow slightly into place rather
    than blink on. The pop must be subtle; if it reads as bouncy, the spring is
    wrong.
  - Hold backspace and delete several digits quickly — glyphs should disappear
    promptly with no lingering ghost, and no cell should be left half-faded.
  - Type a wrong full code and press Next: the shake (plan 003) and the digit
    animations must not fight each other — the row shakes as one unit while the
    glyphs stay put inside their cells.
  - Enable Settings → Accessibility → Motion → Reduce Motion and retype: digits
    should still fade in but not scale.
- **Done when**: digits animate on entry and exit as specified, the shake still
  behaves per plan 003, `tsc` passes, and `git diff --stat` shows only
  `src/components/otp-input.tsx` changed.
