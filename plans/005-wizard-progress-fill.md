# 005 — Fill the newly-completed wizard segment instead of teleporting it

- **Status**: DONE
- **Commit**: 424bbc5
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 file (~30 lines changed)
- **Depends on**: plan 001 (motion tokens)

## Problem

The three-step sign-up wizard renders its progress bar as static coloured
segments. Each step is a separate route (`src/app/profile/identity.tsx`,
`contact.tsx`, `investor.tsx`), so `WizardProgress` re-mounts per screen and the
newly-earned segment is *already* accent-coloured the moment the screen appears.
The user never sees their progress advance — the strongest bit of feedback the
wizard has to offer is thrown away.

```tsx
// src/components/wizard-progress.tsx:22 — current
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: i < step ? colors.accent : colors.divider,
            }}
          />
        ))}
      </View>
```

## Target

On mount, every segment before the current one is already accent (they were
earned on previous screens). The segment for the **current** step — index
`step - 1` — starts at `colors.divider` and cross-fades to `colors.accent` after
the navigation push has settled.

| Segment index | Start colour | End colour | Animation |
| --- | --- | --- | --- |
| `< step - 1` | `colors.accent` | `colors.accent` | none (already earned) |
| `=== step - 1` | `colors.divider` | `colors.accent` | `withDelay(250, withTiming(1, { duration: duration.medium, easing: easing.out }))` |
| `> step - 1` | `colors.divider` | `colors.divider` | none |

Exact values: delay `250` ms (long enough for the stack push to settle so the
fill is seen, not missed mid-transition), duration `duration.medium` = `260` ms,
curve `easing.out` = `Easing.bezier(0.23, 1, 0.32, 1)`.

```tsx
// target — src/components/wizard-progress.tsx (per segment)
function Segment({ state }: { state: 'earned' | 'filling' | 'empty' }) {
  const { colors } = useTheme();
  const progress = useSharedValue(state === 'earned' ? 1 : 0);

  useEffect(() => {
    if (state !== 'filling') return;
    progress.value = withDelay(250, withTiming(1, { duration: duration.medium, easing: easing.out }));
  }, [state, progress]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.divider, colors.accent]),
  }));

  return <Animated.View style={[{ flex: 1, height: 5, borderRadius: 3 }, style]} />;
}
```

This animates colour only — no layout property is touched, so nothing re-flows.

**Explicitly out of scope**: a left-anchored `scaleX` "sweep" fill. React Native
has no `transform-origin`, so a left-anchored sweep needs a measured width and a
compensating `translateX`; it is not worth the complexity for a 5pt-tall bar. Do
not attempt it.

## Repo conventions to follow

- Motion values come from `@/lib/motion` (plan 001).
- Colours always come from `useTheme()` — never inline a hex.
- Small presentational sub-components live in the same file below the main
  export, e.g. `Radio` in `src/components/country-row.tsx:41`. Imitate that
  placement and its one-line JSDoc.
- Reanimated import shape exemplar: `src/components/otp-input.tsx:4`.

## Steps

1. In `src/components/wizard-progress.tsx`, add imports:
   `import { useEffect } from 'react';` and
   `import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';`
   and `import { duration, easing } from '@/lib/motion';`.
2. Add the `Segment` component from the **Target** section below `WizardProgress`,
   with a one-line JSDoc describing the three states.
3. In `WizardProgress`, replace the inline `<View>` inside the `.map()` with
   `<Segment key={i} state={i < step - 1 ? 'earned' : i === step - 1 ? 'filling' : 'empty'} />`.
4. Leave the `gap: 6` row wrapper, the `Step X of N` caption `<Text>` and the
   component's props/JSDoc untouched, apart from noting in the JSDoc that the
   current step's segment fills in on mount.

## Boundaries

- Do NOT animate the `Step X of N` caption.
- Do NOT change the bar height, radius, gap, or the colours used.
- Do NOT touch the three wizard screens — this plan is confined to
  `src/components/wizard-progress.tsx`.
- Do NOT add a reduced-motion branch here: this animation is a colour
  cross-fade with no movement, which is exactly what reduced motion is meant to
  preserve.
- Do NOT add dependencies.
- If the excerpt at `src/components/wizard-progress.tsx:22` does not match, STOP
  and report drift.

## Verification

- **Mechanical**: `npx tsc --noEmit` → `TypeScript compilation completed`.
  `./node_modules/.bin/eslint src` → no new warnings, and specifically no
  `react-hooks/rules-of-hooks` error (hooks must live in `Segment`, not in the
  `.map()` callback).
- **Feel check**: run the app, complete phone + code verification (code
  `428913`) to enter the wizard, then:
  - On step 1, the first segment should start grey and fill to lime shortly after
    the screen settles — you must actually see it change.
  - Advance to step 2: segment 1 is already lime on arrival, segment 2 fills.
  - Advance to step 3: segments 1–2 already lime, segment 3 fills.
  - Go back (native back gesture) and forward again; the fill should replay
    without flicker and without any segment briefly showing the wrong colour.
  - Confirm the bar never shifts position or changes size while filling — only
    the colour moves.
- **Done when**: each wizard step visibly fills its own segment, `tsc` passes,
  and `git diff --stat` shows only `src/components/wizard-progress.tsx` changed.
