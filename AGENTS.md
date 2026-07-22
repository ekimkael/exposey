# AGENTS.md — Baobab

Agent-facing guide to this repo: structure, where the animation lives, the
conventions, how to reuse the motion, and the build pitfalls.

## Structure

```
src/
  app/                     # expo-router routes ONLY (no components/utils here)
    _layout.tsx            # providers + header-less Stack
    index.tsx              # the onboarding screen (renders; no animation math)
  components/
    baobab-logo.tsx        # brand mark (single react-native-svg <Path>)
    onboarding-cards.tsx   # the 4 content cards + the shelf (renders only)
  constants/
    motion.ts              # ALL easings, durations, travel, bob & stagger params
    theme.ts               # screen palette + background gradient
  hooks/
    use-entrance-reveal.ts # header item: fade + slide-up on mount
    use-float-reveal.ts    # card: staggered entrance + perpetual idle bob
    use-press-scale.ts     # button: ease-out press feedback
assets/images/baobab-icon.png   # app icon (raster of the logo path)
```

## Where the animation lives

**All motion is in `src/hooks/*` and parameterised by `src/constants/motion.ts`.**
Components (`index.tsx`, `onboarding-cards.tsx`) only render — they call a hook
and spread the returned animated style onto an `Animated.View`. No component
contains raw timings or transform math.

Motion runs entirely on the UI thread via Reanimated worklets (`useAnimatedStyle`,
`withTiming`, `withRepeat`) — there is no per-frame `setState`.

Three animations:

1. **Header entrance** — `useEntranceReveal(delay)`: opacity 0→1 + `translateY`
   `Motion.travel.header`→0, strong ease-out, staggered by the `RevealDelay` map
   in `index.tsx`.
2. **Card entrance + float** — `useFloatReveal(index)`: same entrance (travel
   `Motion.travel.card`, staggered by `Motion.card.*`), plus a perpetual,
   per-card de-phased vertical bob (`Motion.bob.*`, `EASE_SINE`). `enter` and
   `bob` are separate shared values summed in the transform so the loop never
   fights the entrance.
3. **Button press** — `usePressScale()`: scale 1→`Motion.pressScale` on press-in,
   back on release, both ease-out.

All three branch on `useReducedMotion()`: under Reduce Motion, entrances fade
without travel and the bob never starts (a paused bob would freeze off-centre).

## Conventions

- **TypeScript strict, zero `any`.** Props and returns typed. Animated styles
  are `AnimatedStyle<ViewStyle>`.
- Files/dirs **kebab-case**; components **PascalCase**; hooks **`use*`**;
  handlers **`handle*`**.
- Path alias **`@/*` → `src/*`** (see tsconfig). Prefer it over relative imports.
- Routes live in `app/` **only**; components/hooks/constants elsewhere.
- Every rendered string is wrapped in `<Text>`.
- Animation values are **named tokens** in `constants/`, never inline magic
  numbers. One-off decorative colours may stay in a component's `StyleSheet`
  (the StyleSheet is the local style layer); shared brand colours live in
  `theme.ts`.

## Reusing the animation elsewhere

The hooks are self-contained. To lift, say, the card float into another Expo +
Reanimated project: copy `src/hooks/use-float-reveal.ts` and the `Motion`/`EASE_*`
exports it uses from `src/constants/motion.ts`. It depends only on
`react-native-reanimated` (v4) and `react-native`. Wrap any view:

```tsx
function Card({ index }: { index: number }) {
  const style = useFloatReveal(index);
  return <Animated.View style={style}>{/* … */}</Animated.View>;
}
```

## Pitfalls

Recorded so they don't bite again (native iOS build on this repo):

1. **CocoaPods `Unicode Normalization … ASCII-8BIT`** under a non-UTF-8 locale.
   Prefix pod / `expo run:ios` with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.
2. **`ExpoModulesWorklets` version mismatch** after an `npm install` that
   re-resolves `expo-modules-core`. If a partial `pod install` aborts here, a
   new native module can end up in the codegen `RCTThirdPartyComponentsProvider`
   but NOT in the link flags → `NSClassFromString` returns nil → **SIGABRT on
   launch**. Fix: `rm ios/Podfile.lock && pod install`, then rebuild.
3. **`expo-linear-gradient` renders at zero size under Fabric** when styled with
   inset-only (`StyleSheet.absoluteFillObject`). Give it explicit `width`/`height`
   (see `photoFill` in `onboarding-cards.tsx`).
4. **react-native-svg `<Circle>` double-registers under the New Arch** ("two
   views with the same name RNSVGCircle"). Use `<Path>` and draw circles as arc
   sub-paths (see `baobab-logo.tsx`).
5. **Changing/removing `ios.icon` leaves `ASSETCATALOG_COMPILER_APPICON_NAME`
   stale** in the pbxproj → old home-screen icon persists. Repoint it to
   `AppIcon`, rebuild, uninstall+install, `simctl spawn booted killall SpringBoard`.
