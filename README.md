# Featured — music UI

An Expo (SDK 56) reproduction of a Dribbble-style **music / playlist** app: a
snapping vertical feed of cards, each with a looping video preview that plays
while centred, and a card→detail **Apple Zoom** transition. Built with native
iOS patterns (native stack header, SF Symbols, `@expo/ui`) and Reanimated.

> Target platform is **iOS** (the reference is an iPhone). It runs on Android
> and web too, with the iOS-only flourishes (SF Symbols, Apple Zoom) degrading
> gracefully — see [Platform notes](#platform-notes).

---

## Features

| Area | What happens |
| --- | --- |
| **Snapping feed** ([`index.tsx`](src/app/index.tsx)) | `FlatList` with `snapToInterval`; the centred card scales up while neighbours fade/shrink (scroll-driven Reanimated). |
| **Autoplay preview** ([`playlist-card.tsx`](src/components/playlist-card.tsx)) | Only the centred (`active`) card plays its muted, looping `expo-video` clip; the rest pause, so one clip runs at a time. |
| **Poster fallback** | A still frame (`expo-image`) covers the surface until the first video frame is `readyToPlay`, so a card is never blank while buffering. |
| **Native header** | The feed header is the native stack header: hamburger + native category menu (`Stack.Toolbar.Menu`) on the left, grid/search on the right. |
| **Press + zoom** | Pressing a card scales it down, then it zooms into the detail via `Link.AppleZoom` → `Link.AppleZoomTarget`. |
| **Detail hero** ([`playlist-hero.tsx`](src/components/playlist-hero.tsx)) | A tall preview with the centred identity (avatar + “+” badge, author, title, stats, blurb) that reveals on entry; transport controls along the bottom. |
| **Sticky header + status bar** ([`[id].tsx`](src/app/[id].tsx)) | The native header starts transparent over the hero and turns solid + titled once scrolled past it; the status bar flips light→dark to stay legible. |

---

## Project structure

```
src/
  app/                       # Routes (expo-router). Nothing but screens here.
    _layout.tsx              # Root stack + providers (gesture handler, safe area)
    index.tsx                # Featured feed: snapping list + active-card tracking
    [id].tsx                 # Detail: composes the hero + tracklist + sticky header
  components/                # Reusable UI. Atoms first, then composites.
    icon.tsx                 # SF Symbol via expo-image (`sf:` source)
    round-icon-button.tsx    # Atom: small circular icon button
    play-button.tsx          # Atom: large white play/pause button (spring press)
    stat-badge.tsx           # Atom: icon + label (play count, duration)
    transport-controls.tsx   # Composite: side buttons around the play button
    track-row.tsx            # One tracklist row (with staggered reveal)
    playlist-card.tsx        # Feed card (composes the atoms above)
    playlist-hero.tsx        # Detail hero (preview + identity + controls)
  constants/
    playlists.ts             # Palette, types, mock data, `findPlaylist`
    layout.ts                # Named layout + motion constants (no magic numbers)
```

**Conventions** (please keep them):
- Routes live in `src/app` and contain *only* screens — never co-locate
  components, types, or helpers there (an expo-router anti-pattern).
- Reusable UI lives in `src/components`, kebab-case filenames, one component per
  file. Build small atoms and compose them.
- Structural numbers (ratios, gaps, radii, control sizes, animation timings)
  belong in [`constants/layout.ts`](src/constants/layout.ts). Inline only the
  purely typographic values (font size, letter spacing).
- Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`. Prefer them.

---

## How the key pieces work

### Feed snapping & active card
[`index.tsx`](src/app/index.tsx) measures the area below the header with
`onLayout`, sizes each card to `layout.feed.cardHeightRatio` of it, and sets
`snapToInterval = cardHeight + gap`. Two signals drive the cards:
- `scrollY` (a shared value updated by `useAnimatedScrollHandler`) is passed to
  every card for the scroll-driven scale/opacity.
- `onViewableItemsChanged` sets `activeId`; the matching card autoplays.

### Card → detail zoom
The card is wrapped in `Link.Trigger withAppleZoom`; the detail wraps its hero
in `Link.AppleZoomTarget`. On press, the card runs a spring scale-down
(`pressProgress`), then the native zoom transition takes over. The detail is
the dynamic route `app/[id].tsx`, keyed by `playlist.id`.

### Detail sticky header & status bar
The hero is `heroHeightRatio` of the screen. A scroll handler flips a
`headerSolid` flag once scrolled past `stickyTriggerRatio` of the hero; that
flag toggles the native header (`headerTransparent` / title / tint) and the
`StatusBar` style (`light` over the hero, `dark` over the solid header).

### Playback robustness
Both the card and the hero own their `useVideoPlayer`, autoplay muted+looping,
and render a poster (`playlist.poster`) until `status === 'readyToPlay'`. Clips
are streamed at 360p for fast buffering.

---

## Data & assets

Everything renders from mock data in
[`constants/playlists.ts`](src/constants/playlists.ts) — no backend. Each
`Playlist` carries a remote `video`, a matching `poster` still, and an `avatar`.

- **Preview clips & posters**: [Mixkit](https://mixkit.co) (free license, no
  attribution required), streamed at runtime.
- **Avatars**: [pravatar](https://pravatar.cc).
- **Tracklist**: a shared `SAMPLE_TRACKS` list (UI demo only).

To ship offline, replace the remote URLs with bundled assets under
`assets/` and `require()` them.

---

## Running

`@expo/ui` and `expo-video` are native modules, so a **dev/native build** is
required (not Expo Go for production; Expo Go works for development):

```bash
npm install
npx expo run:ios      # or: npx expo run:android
# during development you can also:
npx expo start        # then open in Expo Go / a dev client
```

Type-check and lint:

```bash
npx tsc --noEmit
npx expo lint
```

---

## Customizing

- **Add a playlist**: append to `PLAYLISTS` in
  [`constants/playlists.ts`](src/constants/playlists.ts) with a `video`,
  `poster`, `avatar`, and a `theme` (`darkCard` or `amberCard`).
- **Retune sizing/feel**: edit [`constants/layout.ts`](src/constants/layout.ts)
  (`heroHeightRatio`, `cardHeightRatio`, `stickyTriggerRatio`, control sizes,
  animation timings) — changes propagate everywhere.
- **Swap colours**: `palette` (page chrome) and the `darkCard` / `amberCard`
  `CardTheme`s live in `constants/playlists.ts`.

---

## Platform notes

- **SF Symbols** ([`icon.tsx`](src/components/icon.tsx)) render on iOS via
  `expo-image`'s `sf:` source. On Android they won't draw — add Material vector
  drawables there if Android parity is needed.
- **Apple Zoom** (`Link.AppleZoom`) is iOS 18+. On other platforms the `Link`
  still navigates to the detail, just without the zoom.
- **Native category menu** uses `Stack.Toolbar` (iOS). The category state still
  works cross-platform; only the native menu chrome is iOS-specific.
