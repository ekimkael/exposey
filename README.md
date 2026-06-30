# Gatesware — Trip Detail Screen

A React Native / Expo implementation of the **Gatesware "One Week Retreat"** trip detail UI.
Features a trip header, stats grid, restaurant carousel, and Instagram-style story viewer for places and hotels.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Expo 56 / React Native 0.85.3 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (single screen, `src/app/index.tsx`) |
| Icons | `react-native-svg` (Tabler filled icon set) |
| Images | `expo-image` (supports local SVG assets) |
| Safe area | `react-native-safe-area-context` |

---

## Project structure

```
src/
├── app/
│   ├── _layout.tsx              # Root layout — just <Slot />, no tabs
│   └── index.tsx                # Main screen: composes all sections, passes TRIP data as props
│
├── components/
│   ├── trip-header.tsx          # Brand row, title, flag badge, description
│   ├── trip-stats.tsx           # 4-column stat grid (Hotels / Cars / Restaurants / Attractions)
│   ├── section-header.tsx       # Reusable icon badge + title + count + "View all"
│   ├── section-icons.tsx        # Badge icons (KitchenIcon, CarIcon, HomeIcon) — white Tabler SVGs
│   ├── restaurant-card.tsx      # Horizontal paged carousel with gradient overlay + dots
│   ├── circular-avatar-row.tsx  # Avatar grid/scroll with optional story rings
│   ├── story-ring.tsx           # SVG ring indicator — segmented, gradient or grey
│   └── story-viewer.tsx         # Full-screen story modal with progress bars + tap navigation
│
└── utils/
    ├── trip-tokens.ts           # Design tokens: COLORS, SPACING, FONT, RING
    └── trip-mock.ts             # Static TRIP data — replace with API response keeping same shape
```

---

## Design token system

All visual values live in `src/utils/trip-tokens.ts`.

```ts
COLORS.brand       // #E8472A — orange-red (brand, Places icon)
COLORS.brandIcon   // #F5A623 — yellow-orange (Restaurants icon)
COLORS.hotelIcon   // #4A90E2 — blue (Hotels icon)

SPACING.screenH    // 20 — horizontal screen padding used by all sections
RING.stroke        // 2.5dp — story ring stroke width
RING.segmentGap    // 3dp  — gap between arc segments
```

**To add a color:** add a key to `COLORS` in `trip-tokens.ts`, then reference it as `COLORS.myKey`.
Do **not** hardcode hex values in components.

---

## Adding a new section

1. **Add items to `TRIP`** in `src/utils/trip-mock.ts`:
   ```ts
   mySection: [
     { id: 's1', name: 'Example', imageUrl: '...', stories: makeStories('s1', 3) },
   ],
   mySectionTotalCount: 12,
   ```

2. **Add an icon** to `src/components/section-icons.tsx`:
   ```tsx
   export function MyIcon() {
     return <Svg width={13} height={13} viewBox="0 0 24 24" fill="#fff">...</Svg>;
   }
   ```

3. **Compose in `index.tsx`**:
   ```tsx
   <SectionHeader
     title="My Section"
     count={TRIP.mySectionTotalCount}
     iconColor={COLORS.someColor}
     icon={<MyIcon />}
   />
   <CircularAvatarRow items={TRIP.mySection} showStatus grid />
   ```

That's it — no other files need to change.

---

## How stories work (end-to-end)

```
User taps avatar (CircularAvatarRow)
  → openViewer(index) sets activeViewerIndex
  → buildViewerItems(item) maps StorySlide[] → StoryViewerItem[]
  → StoryViewer renders as a full-screen Modal

Inside StoryViewer:
  → Each slide drives one ProgressBar (Animated.timing over STORY_DURATION = 4000 ms)
  → Progress pauses while image loads (imageLoading=true blocks timer + animation)
  → Timer fires advance() → next slide, or onClose() at the end
  → Tap left half → goBack(), tap right half → goForward()
  → ✕ Pressable → onClose()

Ring indicator (StoryRing):
  → segments = item.stories.length (one arc per slide)
  → viewed=false → gradient arcs; viewed=true → solid grey ring
  → closeViewer() marks the index as viewed in viewedIndices Set
```

---

## Running locally

```bash
npm install
npx expo start          # Expo Go / dev build
npx expo run:ios        # Native iOS build
npx expo run:android    # Native Android build
```

---

## Replacing mock data with an API

`src/utils/trip-mock.ts` exports a single `TRIP` constant.
To connect a real API:

1. Fetch your data and shape it to match the `TRIP` object structure.
2. Pass it into `index.tsx` the same way `TRIP` is used now.
3. The components only consume typed props — no changes needed inside them.

Key fields to preserve:
- `restaurants[].address` — shown in the carousel card overlay
- `places[].stories` / `hotels[].stories` — `Array<{ id, imageUrl }>` per item
- `placesTotalCount`, `restaurantsTotalCount`, `hotelsTotalCount` — shown in section headers

---

## Known limitations / next steps

- `SectionHeader.onViewAllPress` accepts a handler but navigation is not wired up yet.
- The flag image is hardcoded to `assets/images/flag-argentina.svg` in `TripHeader`. Pass it as a prop when supporting multiple destinations.
- `restaurants` items use `picsum.photos` seeds — swap for real CDN URLs.
