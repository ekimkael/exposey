# 004 — Add press feedback to the play button and the pill's tap target

- **Status**: DONE (not exercised on device — see note)
- **Commit**: 626d7a3
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 2 files, ~35 lines

## Problem

Two pressable surfaces acknowledge nothing while the finger is down.

```tsx
// src/components/now-playing-player.tsx:38-49 — current
<Pressable
  onPress={onPlayPause}
  hitSlop={8}
  accessibilityRole="button"
  accessibilityLabel={playing ? 'Pause' : 'Play'}
  style={[styles.circle, { width: play, height: play, borderRadius: play / 2, backgroundColor: '#FFFFFF' }]}>
```

The `style` is a static array — no `pressed` branch, no transform. The only
acknowledgment is the icon swapping on release.

```tsx
// src/components/now-playing-player.tsx:127-139 — current
<GestureDetector gesture={gesture}>
  <View style={styles.pillTarget} accessible accessibilityRole="button" …>
```

The pill's expand target is a plain `View`. Nothing happens until the finger
lifts and the swap begins.

The audit playbook hunts specifically for "pressable elements with no press
feedback", and prescribes `transform: scale(0.97)` with a 160ms ease-out.

## Target

A small reusable Reanimated pressable that scales on press-in and restores on
press-out, and a matching press scale driven from the pill's tap gesture.

```tsx
/* target — new file src/components/press-scale.tsx */
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const PRESS = { duration: 160, easing: Easing.out(Easing.cubic) } as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressScaleProps {
  onPress: () => void;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityLabel?: string;
  children: ReactNode;
}

export function PressScale({
  onPress,
  scaleTo = 0.96,
  style,
  hitSlop,
  accessibilityLabel,
  children,
}: PressScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(scaleTo, PRESS);
      }}
      onPressOut={() => {
        scale.value = withTiming(1, PRESS);
      }}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}
```

For the pill target, the scale is driven from the existing tap gesture rather
than a Pressable, because the target is already wrapped in a `GestureDetector`:

```ts
/* target — src/hooks/use-player-swap.ts */
const pillPress = useSharedValue(1);

const tapPill = Gesture.Tap()
  .onBegin(() => {
    pillPress.value = withTiming(0.98, PRESS);
  })
  .onFinalize(() => {
    pillPress.value = withTiming(1, PRESS);
  })
  .onEnd((_event, success) => {
    if (success) expand();
  });

const pillPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pillPress.value }] }));
```

Scale values: `0.96` for the round play button (a small control tolerates more),
`0.98` for the pill's art+text row (a large surface tolerates less). Both are
inside the playbook's 0.95–0.98 band.

## Repo conventions to follow

- Components live in `src/components/` in kebab-case — see
  `src/components/now-playing-player.tsx`.
- Animated styles come from `useAnimatedStyle` and are passed as the last entry
  of a style array — see `src/components/now-playing-player.tsx:78`.
- Timing configs are module-level `as const` — see
  `src/hooks/use-player-swap.ts:18`.

## Steps

1. Create `src/components/press-scale.tsx` exactly as in Target.
2. In `src/components/now-playing-player.tsx`, import `PressScale` and replace
   the play `Pressable` (lines 38-49) with
   `<PressScale onPress={onPlayPause} scaleTo={0.96} hitSlop={8}
   accessibilityLabel={playing ? 'Pause' : 'Play'} style={[styles.circle, {…}]}>`
   keeping the same `SymbolView` child and the same style object.
3. Remove the now-unused `Pressable` import if nothing else uses it.
4. In `src/hooks/use-player-swap.ts`, add `const PRESS = { duration: 160,
   easing: Easing.out(Easing.cubic) } as const;` next to `OUT`, add the
   `pillPress` shared value, extend `tapPill` with `.onBegin`/`.onFinalize`,
   and export `pillPressStyle` from the hook's return object.
5. In `src/app/index.tsx`, pass `pillPressStyle` to `PillPlayer` as a new
   `pressStyle` prop.
6. In `PillPlayer`, change the `View` with `styles.pillTarget` into an
   `Animated.View` and append `pressStyle` to its style array.

## Boundaries

- Do NOT add press feedback to the AirPlay glyph — it is deliberately
  non-interactive (see the comment at `src/components/now-playing-player.tsx:26`).
- Do NOT add press feedback to the grabber; its tap target is invisible and a
  scaling 20x4 bar reads as a glitch.
- Do NOT change the dock's drag behaviour or any swap timing.
- Do NOT add dependencies — `Animated.createAnimatedComponent` is already
  available from the installed `react-native-reanimated`.
- If the code does not match the excerpts above, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` completes with no errors.
- **Feel check**: on the iOS simulator:
  - Press and hold the play button. It must shrink slightly and stay shrunk
    while held, then restore when released — not flash and snap back.
  - Press and hold the pill's artwork. The art+text must shrink slightly; the
    play button beside it must NOT shrink.
  - Drag off the play button before releasing. It must restore without firing
    play/pause.
  - Confirm the pill press does not delay the expand: releasing must start the
    swap on the same beat as before.
- **Done when**: both surfaces visibly acknowledge the finger before release,
  and the AirPlay glyph and grabber still do not.


## Execution note

Implemented as specified. `PressScale` lives in
`src/components/press-scale.tsx` and is used for the play button (0.96); the
pill's target scales to 0.98 via `pillPressStyle`, driven from the tap
gesture's `onBegin`/`onFinalize`.

**Not exercised on device.** Press feedback only exists while a finger is
down, and a `simctl` screenshot round-trip (~500ms) is slower than the press
itself, so no frame could be captured mid-press. Verified indirectly: taps and
play/pause still fire correctly, so the pressable was not broken.
