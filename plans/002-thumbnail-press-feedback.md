# 002 — Add press feedback to the coverflow thumbnails

- **Status**: DONE
- **Commit**: 7aa01fc
- **Severity**: MEDIUM
- **Category**: 3 — Physicality & origin
- **Estimated scope**: 1 file, ~20 lines

## Problem

Thumbnails in the strip are tappable — tapping one scrolls it to centre — but
the press produces no visual acknowledgement whatsoever. No opacity change, no
scale, no ripple. The finger goes down on a photo and nothing happens until the
strip starts moving.

```tsx
// src/components/coverflow-strip.tsx:66-72 — current
return (
  <Animated.View style={[styles.slot, animatedStyle]}>
    <Pressable onPress={handlePress} accessibilityRole="imagebutton">
      <Image source={scene} style={styles.thumbnail} contentFit="cover" transition={0} />
    </Pressable>
  </Animated.View>
);
```

`Pressable` here is used purely as a tap target — it is given no `style`
callback, no `android_ripple`, and no pressed-state handling.

## Target

A subtle scale-down on press, released back to rest. Values are fixed:

| Property | Value |
| --- | --- |
| Pressed scale | `0.97` |
| Duration (both directions) | `160ms` |
| Easing | `cubic-bezier(0.23, 1, 0.32, 1)` |

The scale must live on a **separate inner `Animated.View`**, not be merged into
the existing coverflow `transform` array — that array is rebuilt every scroll
frame by the geometry worklet, and press state is independent of scroll
position. Nesting keeps the two concerns from fighting.

The press animation is driven by a shared value so it runs on the UI thread,
matching how the rest of this component animates. Do not use `Pressable`'s
`style={({ pressed }) => …}` callback — that re-renders on the JS thread.

```tsx
// target — src/components/coverflow-strip.tsx
const pressed = useSharedValue(0);

const pressStyle = useAnimatedStyle(() => ({
  transform: [{ scale: 1 - pressed.value * PRESS_SCALE_DROP }],
}));

// …

return (
  <Animated.View style={[styles.slot, animatedStyle]}>
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = withTiming(1, PRESS_TIMING);
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, PRESS_TIMING);
      }}
      accessibilityRole="imagebutton"
    >
      <Animated.View style={pressStyle}>
        <Image source={scene} style={styles.thumbnail} contentFit="cover" transition={0} />
      </Animated.View>
    </Pressable>
  </Animated.View>
);
```

New constants, placed with the others at the top of the file:

```tsx
/** Press feedback: 0.97 scale, subtle enough to acknowledge without bouncing. */
const PRESS_SCALE_DROP = 0.03;
/** Strong ease-out — the response should be quickest where the eye is watching. */
const PRESS_TIMING = { duration: 160, easing: Easing.bezier(0.23, 1, 0.32, 1) };
```

## Repo conventions to follow

- **Motion constants are module-level `SCREAMING_SNAKE` consts at the top of
  `src/components/coverflow-strip.tsx`, each with a JSDoc block explaining
  *why*.** Exemplar, `coverflow-strip.tsx:15-20`:

  ```tsx
  /** Thumbnail edge length. */
  const ITEM = 85;
  /** Scroll distance between two entries. */
  const STRIDE = 102;
  /** Cylinder arc consumed by one entry. */
  const STEP_DEG = 30.5;
  ```

- All animation in this file runs on the UI thread via `useAnimatedStyle` and
  shared values — exemplar at `coverflow-strip.tsx:46`. Follow that; do not
  introduce JS-thread `useState` for press state.

- Imports come from `react-native-reanimated` in the single block at
  `coverflow-strip.tsx:4-11`, alphabetically ordered.

## Steps

1. In `src/components/coverflow-strip.tsx`, add `Easing`, `useSharedValue`, and
   `withTiming` to the `react-native-reanimated` import block (lines 4-11).
   Note `Easing` is a value export, not a type — it goes with the others, and
   alphabetical order puts it first in the list.

2. Add `PRESS_SCALE_DROP` and `PRESS_TIMING` with their JSDoc after the
   `STRIP_HEIGHT` declaration (currently line 36).

3. Inside `function Thumbnail`, after the existing `useAnimatedStyle` call, add
   the `pressed` shared value and the `pressStyle` animated style exactly as
   shown in **Target**.

4. Replace the returned JSX with the **Target** version: add `onPressIn` /
   `onPressOut` to the `Pressable`, and wrap the `<Image>` in
   `<Animated.View style={pressStyle}>`.

## Boundaries

- Do NOT merge the press scale into the geometry `transform` array in the
  existing `animatedStyle` (line 51-61). It must stay on its own nested view.
- Do NOT change any calibrated geometry constant: `ITEM`, `STRIDE`, `STEP_DEG`,
  `RADIUS`, `PERSPECTIVE`, `MAX_STEPS`, `FADE_FROM`. They were measured off a
  reference video and are documented in `README.md`.
- Do NOT add an opacity change on press — scale only. Two simultaneous feedback
  channels on an 85pt thumbnail reads as heavy.
- Do NOT add `android_ripple`; the visual language here is iOS-first and a
  ripple would not match.
- Do NOT change `styles.thumbnail`, including its `borderRadius: 10`.
- Do NOT add dependencies.
- If the code you find does not match the excerpt above (drift since commit
  `7aa01fc`), STOP and report rather than improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` — must print no errors.

- **Feel check**:
  1. Launch: `npm run ios`.
  2. Press and hold a thumbnail. It must visibly shrink slightly and **stay**
     shrunk while held — confirming `onPressIn`/`onPressOut` are wired, not a
     one-shot on `onPress`.
  3. Release. It returns to full size, and the strip scrolls that entry to centre.
  4. The scale must be subtle — at 85pt, a 0.97 scale is a ~2.5pt inset. If it
     reads as a "pop" or a bounce, the wrong value or a spring was used.
  5. Press a thumbnail and drag off it before releasing: it must return to full
     size (`onPressOut` fires) and must NOT scroll.
  6. Press feedback must not disturb the coverflow geometry — while holding a
     thumbnail, the trapezoid perspective of its neighbours is unchanged.

- **Frame check** (the press is too fast to judge by eye):
  ```bash
  xcrun simctl io booted recordVideo --codec h264 /tmp/press.mp4 &
  # tap a thumbnail, then stop the recording with kill -INT on the pid
  ffmpeg -i /tmp/press.mp4 -vf "fps=60,crop=1206:340:0:1985,scale=440:-1" /tmp/pf/f_%03d.png
  ```
  Step the frames across the press: the scale must change over roughly 10 frames
  at 60fps (160ms), easing out — large change early, settling late. A linear ramp
  or an instant jump means the easing was not applied.

- **Done when**: `tsc` is clean, holding a thumbnail holds it scaled, releasing
  restores it, dragging off cancels both the scale and the scroll, and the
  frame trace shows a ~160ms eased-out ramp rather than a step.
