# rn.ui — Mindfulness Morph

A React Native / Expo demo exploring **native-quality transitions** and **Apple-Intelligence-style UI** without third-party graphics libraries (no Skia, no Lottie).

## What it does

| Screen | Description |
|--------|-------------|
| **Home** (`/`) | Dark canvas · ambient SVG halo · animated glow pill button |
| **Beach** (`/beach`) | Full-screen aerial beach photo · transparent native back button |

Tapping **"Be here now"** triggers:
- **iOS 18+** → `Link.AppleZoom` native zoom transition (the pill morphs into the beach photo)
- **All OS** → `sharedTransitionTag="beach-morph"` shared-element fallback (react-native-reanimated)

---

## Tech choices

### Animated glow border — no Skia
`GlowButton` approximates the **Apple Intelligence** conic-gradient border using `react-native-svg`:
- A `LinearGradient` with its `x1/y1/x2/y2` endpoints rotated every frame via `useAnimatedProps`
- Three `Rect` stroke layers (wide halo → mid ring → crisp border) at increasing opacities
- Zero extra dependencies — everything runs on the SVG renderer bundled with Expo

### Navigation
`Stack` (not `NativeTabs`) is required for shared-element transitions. The root layout registers three routes: `index`, `beach`, `explore`.

### Splash overlay
`AnimatedSplashOverlay` plays a one-shot shrink-and-fade keyframe on cold launch, then removes itself from the React tree. The web variant is a no-op stub (`animated-icon.web.tsx`).

---

## Project structure

```
src/
├── app/
│   ├── _layout.tsx        # Root Stack navigator + splash overlay
│   ├── index.tsx          # Home / mindfulness screen
│   ├── beach.tsx          # Beach destination screen
│   └── explore.tsx        # Stock Expo explore screen (boilerplate)
├── components/
│   ├── glow-button.tsx    # Apple-Intelligence animated glow pill
│   └── animated-icon.tsx  # AnimatedSplashOverlay (+ .web.tsx stub)
└── constants/
    └── theme.ts           # Design tokens (colors, spacing)
```

---

## Getting started

```bash
npm install
npx expo start
```

Press **i** for iOS simulator, **a** for Android, or scan the QR code with Expo Go.

> **Note:** `Link.AppleZoom` / `Link.AppleZoomTarget` requires a **development build** (not Expo Go) and **iOS 18+** for the native zoom. The `sharedTransitionTag` fallback works everywhere.

---

## Picking up as an agent

Key invariants to preserve:

1. **`Stack` at root** — do not switch to `NativeTabs`; shared-element transitions require a Stack navigator.
2. **`sharedTransitionTag="beach-morph"`** — must match on both `GlowButton`'s internal `Animated.View` (home) and the root `Animated.View` on beach. Changing one requires changing the other.
3. **`Link.AppleZoom` wraps `GlowButton` directly** — `Link.AppleZoom` propagates `onPress` to its child; inserting a non-pressable wrapper between them breaks navigation.
4. **No Skia** — the glow effect is pure SVG. Do not introduce `@shopify/react-native-skia` unless the user explicitly asks.
5. **`GlowButton` is a `Pressable`** — it must remain the direct child of `Link.AppleZoom` so the zoom gesture is handled correctly.

### Colour palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0B0B0F` | Home screen |
| Beach bg | `#0D3326` | Beach screen (shows while image loads) |
| Glow gradient | `#BF5AF2 → #5AC8FA → #FFF → #FF2D55` | Border animation |
| Subtitle | `rgba(255,255,255,0.45)` | Home subtitle |

### Tweaking the glow button

All constants live at the top of [`src/components/glow-button.tsx`](src/components/glow-button.tsx):

```ts
const COLORS = ['#BF5AF2', '#5AC8FA', '#FFFFFF', '#FF2D55', '#BF5AF2'];
const SPEED  = 2400; // ms per revolution — lower = faster
const BORDER = 3;    // stroke width in px
const WIDTH  = 180;
const HEIGHT = 52;
```
