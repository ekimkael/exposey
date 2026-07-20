# Turaco — notes for AI agents

Single-screen demo (Expo Router, SDK 56) reproducing a "Connect Your
Spotify" onboarding with a gesture-driven rotary wheel of artist cards.

## Structure

```
src/
  app/_layout.tsx        Stack + GestureHandlerRootView + light status bar
  app/index.tsx          The screen: header, title, wheel, CTA (render only)
  components/
    artist-marquee.tsx   Wheel viewport: WheelCard math, EdgeBlur, Ruler
    artist-card.tsx      One sticker card + its SVG art variants
    spotify-mark.tsx     Spotify glyph (react-native-svg path)
  hooks/
    use-wheel-gesture.ts Pan → progress shared value + detent snap
  constants/
    artists.ts           Card data (colors sampled from the reference)
    wheel.ts             All geometry/motion constants — tune here
    theme.ts             Screen palette
```

## Animation mechanics

- `useWheelGesture` owns a `progress` shared value (arc distance, pt).
  Pan follows the finger 1:1; on release the momentum is projected
  (`velocity × FLING_PROJECTION`) and `withSpring` locks onto the
  nearest `PITCH` multiple (detent snap). All worklets, UI thread.
- Each `WheelCard` maps its slot's arc distance to an angle
  `θ = d / WHEEL_RADIUS`, then: `translateY = R·sin θ`,
  `translateX = −R·(1−cos θ)` (arc curls left), `rotate = θ` (cards sit
  radially, like sun rays / rotary-dial numbers) plus a static per-card
  sticker tilt. Cards with `|θ| > 90°` are culled via opacity.
- The ring holds each artist twice (`SLOT_COUNT = 16`) so any spin wraps
  seamlessly (slot i and i+8 are identical).
- Edge treatment: `BlurView` masked by a vertical `LinearGradient`
  (progressive blur, no hard edge) + a short black fade.

## Reusing the wheel elsewhere

Copy `use-wheel-gesture.ts`, `constants/wheel.ts`, and the `WheelCard`
math from `artist-marquee.tsx`; replace `ArtistCard` with any content of
fixed `CARD_WIDTH`/`CARD_HEIGHT`. Requires `react-native-reanimated`,
`react-native-gesture-handler` (with `GestureHandlerRootView` at the
root) and, for the edge treatment only, `expo-blur`,
`expo-linear-gradient`, `@react-native-masked-view/masked-view`.

## Pitfalls hit during development

- `adjustsFontSizeToFit` collapses to `minimumFontScale` inside
  Reanimated-animated views — use fixed per-item font sizes instead
  (`Artist.nameSize`).
- After adding `GestureHandlerRootView`, hot reload can white-screen
  Expo Go; cold-restart the app (`simctl terminate` + reopen).
- Animate only `transform`/`opacity`; the blur overlays are static.
- `boxShadow` (CSS string) is used, not the legacy `shadow*` props.
