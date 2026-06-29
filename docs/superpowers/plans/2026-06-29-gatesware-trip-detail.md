# Gatesware Trip Detail Screen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the Gatesware "One Week Retreat" trip detail UI (designs A + B) as the app's index screen.

**Architecture:** Static mock data in `src/utils/trip-mock.ts`; design tokens in `src/utils/trip-tokens.ts`; five focused components in `src/components/`; `src/app/index.tsx` becomes a `ScrollView` that composes them. No navigation, no state, no network calls.

**Tech Stack:** React Native, Expo 56, `expo-image`, `react-native-svg`, `@expo/ui` (ScrollView/List primitives), `expo-symbols` (SF Symbols on iOS), `react-native-safe-area-context`.

## Global Constraints

- All file names: `kebab-case`
- Components live in `src/components/` (no sub-folders)
- Data + tokens live in `src/utils/`
- No new npm dependencies — use what's already installed
- Placeholder images: `https://picsum.photos/seed/<name>/<w>/<h>` (reproducible)
- Colors, spacing, font sizes must come from `src/utils/trip-tokens.ts`
- JSDoc only where the *why* is non-obvious
- Target: iOS + Android (graceful SF Symbols fallback on Android via `expo-symbols`)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/utils/trip-tokens.ts` | Create | Color palette, spacing, typography constants |
| `src/utils/trip-mock.ts` | Create | Static trip data (stats, restaurants, places, hotels) |
| `src/components/trip-header.tsx` | Create | Brand row, title, subtitle, flag badge, description |
| `src/components/trip-stats.tsx` | Create | 4-column stat boxes with SVG icons |
| `src/components/section-header.tsx` | Create | Reusable colored icon + title + count + "View all" |
| `src/components/restaurant-card.tsx` | Create | Large photo card (version A) with overlay info + pagination dots |
| `src/components/circular-avatar-row.tsx` | Create | Horizontal scroll of circular avatars + label (version B) |
| `src/app/index.tsx` | Modify | Replace onboarding with ScrollView composing all components |

---

## Task 1: Design tokens

**Files:**
- Create: `src/utils/trip-tokens.ts`

**Interfaces:**
- Produces: `COLORS`, `SPACING`, `FONT` — plain objects exported as named exports

- [ ] **Step 1: Create the file**

```typescript
// src/utils/trip-tokens.ts

export const COLORS = {
  brand: '#E8472A',          // GATESWARE orange-red
  brandIcon: '#F5A623',      // yellow-orange section icons
  white: '#FFFFFF',
  background: '#F7F7F7',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  viewAll: '#E8472A',
  statBorder: '#EBEBEB',
  cardOverlay: 'rgba(0,0,0,0.38)',
  iconBg: '#F0F0F0',
  flagBg: '#F0F0F0',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  screenH: 20,   // horizontal screen padding
} as const;

export const FONT = {
  brand: 11,
  statNumber: 18,
  statLabel: 11,
  sectionTitle: 17,
  cardVenue: 15,
  cardAddress: 12,
  title: 24,
  subtitle: 16,
  body: 14,
  avatarLabel: 11,
  viewAll: 13,
  flagLabel: 12,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/trip-tokens.ts
git commit -m "feat: add trip design tokens"
```

---

## Task 2: Mock data

**Files:**
- Create: `src/utils/trip-mock.ts`

**Interfaces:**
- Produces: `TRIP` object with shape:
  ```typescript
  {
    title: string;
    subtitle: string;
    brand: string;
    flag: string;       // emoji
    flagCode: string;
    description: string;
    stats: Array<{ label: string; count: number; iconKey: string }>;
    restaurants: Array<{ id: string; name: string; imageUrl: string }>;
    places: Array<{ id: string; name: string; imageUrl: string }>;
    hotels: Array<{ id: string; name: string; imageUrl: string }>;
    featuredRestaurant: {
      name: string; address: string; imageUrl: string;
    };
  }
  ```

- [ ] **Step 1: Create the file**

```typescript
// src/utils/trip-mock.ts

const picsum = (seed: string, w = 80, h = 80) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const TRIP = {
  brand: 'GATESWARE',
  title: 'One Week Retreat',
  subtitle: 'At Supra Falls',
  flag: '🇦🇷',
  flagCode: 'ARG',
  description:
    'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry\'s Standard Dummy.',
  stats: [
    { label: 'Hotels',      count: 5,  iconKey: 'hotel' },
    { label: 'Cars',        count: 4,  iconKey: 'car' },
    { label: 'Restaurants', count: 3,  iconKey: 'restaurant' },
    { label: 'Attractions', count: 15, iconKey: 'attraction' },
  ],
  featuredRestaurant: {
    name: 'St. Iniesta Drawn ↗',
    address: 'New venue, US/9210',
    imageUrl: picsum('supra-rest', 400, 260),
  },
  restaurants: [
    { id: 'r1', name: 'Kareems',  imageUrl: picsum('kareems',  80, 80) },
    { id: 'r2', name: 'Maverciks', imageUrl: picsum('maverciks', 80, 80) },
    { id: 'r3', name: 'Longbros', imageUrl: picsum('longbros', 80, 80) },
    { id: 'r4', name: 'Supabowl', imageUrl: picsum('supabowl', 80, 80) },
  ],
  places: [
    { id: 'p1', name: 'Old saman Towers', imageUrl: picsum('oldtowers',  80, 80) },
    { id: 'p2', name: 'tenets sea',        imageUrl: picsum('tenetssea',  80, 80) },
    { id: 'p3', name: 'Newgate beach',     imageUrl: picsum('newgate',    80, 80) },
    { id: 'p4', name: 'Bus underway',      imageUrl: picsum('busunderway', 80, 80) },
  ],
  hotels: [
    { id: 'h1', name: 'Hyatt',    imageUrl: picsum('hyatt',   80, 80) },
    { id: 'h2', name: 'Novotel',  imageUrl: picsum('novotel', 80, 80) },
    { id: 'h3', name: 'Corona',   imageUrl: picsum('corona',  80, 80) },
    { id: 'h4', name: 'Mapleway', imageUrl: picsum('mapleway', 80, 80) },
  ],
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/trip-mock.ts
git commit -m "feat: add trip mock data"
```

---

## Task 3: TripHeader component

**Files:**
- Create: `src/components/trip-header.tsx`

**Interfaces:**
- Consumes: `TRIP.brand`, `TRIP.title`, `TRIP.subtitle`, `TRIP.flag`, `TRIP.flagCode`, `TRIP.description` from `src/utils/trip-mock.ts`; `COLORS`, `SPACING`, `FONT` from `src/utils/trip-tokens.ts`
- Produces: `export default function TripHeader()` — no props, self-contained

- [ ] **Step 1: Create the component**

```tsx
// src/components/trip-header.tsx
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

/** Map pin SVG inline — avoids external icon dep */
function MapPin() {
  const Svg = require('react-native-svg').Svg;
  const Path = require('react-native-svg').Path;
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12">
      <Path
        d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5 1.5 1.5 0 0 1 5 6.5z"
        fill={COLORS.brand}
      />
    </Svg>
  );
}

export default function TripHeader() {
  return (
    <View style={s.container}>
      {/* Brand row */}
      <View style={s.brandRow}>
        <View style={s.brandLeft}>
          <MapPin />
          <Text style={s.brand}>{TRIP.brand}</Text>
        </View>
        <View style={s.flagBadge}>
          <Text style={s.flagEmoji}>{TRIP.flag}</Text>
          <Text style={s.flagCode}>{TRIP.flagCode}</Text>
        </View>
      </View>

      {/* Title + subtitle */}
      <Text style={s.title}>{TRIP.title}</Text>
      <Text style={s.subtitle}>{TRIP.subtitle}</Text>

      {/* Description */}
      <Text style={s.description}>{TRIP.description}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: SPACING.screenH, paddingTop: SPACING.lg },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  brand: {
    fontSize: FONT.brand,
    fontWeight: '700',
    color: COLORS.brand,
    letterSpacing: 1.2,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.flagBg,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  flagEmoji: { fontSize: 18 },
  flagCode: { fontSize: FONT.flagLabel, fontWeight: '600', color: COLORS.text },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT.subtitle,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT.body,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/trip-header.tsx
git commit -m "feat: add TripHeader component"
```

---

## Task 4: TripStats component

**Files:**
- Create: `src/components/trip-stats.tsx`

**Interfaces:**
- Consumes: `TRIP.stats` from `src/utils/trip-mock.ts`; tokens
- Produces: `export default function TripStats()` — no props

SVG icons are inline components (hotel=house, car=car, restaurant=fork+knife, attraction=tree/star).

- [ ] **Step 1: Create the component**

```tsx
// src/components/trip-stats.tsx
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

function HotelIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V12h6v10" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="7" cy="17" r="2" stroke={COLORS.textMuted} strokeWidth={1.8} />
      <Circle cx="17" cy="17" r="2" stroke={COLORS.textMuted} strokeWidth={1.8} />
    </Svg>
  );
}

function RestaurantIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="6" y1="1" x2="6" y2="4" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="10" y1="1" x2="10" y2="4" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="14" y1="1" x2="14" y2="4" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function AttractionIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ICONS: Record<string, () => JSX.Element> = {
  hotel: HotelIcon,
  car: CarIcon,
  restaurant: RestaurantIcon,
  attraction: AttractionIcon,
};

export default function TripStats() {
  return (
    <View style={s.container}>
      <Text style={s.heading}>Trip includes</Text>
      <View style={s.row}>
        {TRIP.stats.map((stat) => {
          const Icon = ICONS[stat.iconKey];
          return (
            <View key={stat.iconKey} style={s.cell}>
              <Icon />
              <Text style={s.count}>
                {String(stat.count).padStart(2, '0')}
              </Text>
              <Text style={s.label}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: SPACING.screenH, marginBottom: SPACING.lg },
  heading: {
    fontSize: FONT.sectionTitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  cell: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.statBorder,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    gap: 2,
    backgroundColor: COLORS.surface,
  },
  count: { fontSize: FONT.statNumber, fontWeight: '700', color: COLORS.text },
  label: { fontSize: FONT.statLabel, color: COLORS.textMuted },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/trip-stats.tsx
git commit -m "feat: add TripStats component with inline SVG icons"
```

---

## Task 5: SectionHeader component

**Files:**
- Create: `src/components/section-header.tsx`

**Interfaces:**
- Produces: `export default function SectionHeader(props: { title: string; count?: number; iconColor: string; })` 

- [ ] **Step 1: Create the component**

```tsx
// src/components/section-header.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';

type Props = {
  title: string;
  count?: number;
  iconColor: string;
};

/** Utensils / fork-knife icon */
function SectionIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill={color} />
      <Path d="M9 3v6M9 9a3 3 0 0 0 3 3M15 3v18M12 9V3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SectionHeader({ title, count, iconColor }: Props) {
  return (
    <View style={s.row}>
      <View style={s.left}>
        <SectionIcon color={iconColor} />
        <Text style={s.title}>
          {title}
          {count != null ? <Text style={s.count}> ({count})</Text> : null}
        </Text>
      </View>
      <TouchableOpacity>
        <Text style={s.viewAll}>View all</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenH,
    marginBottom: SPACING.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: FONT.sectionTitle, fontWeight: '700', color: COLORS.text },
  count: { fontSize: FONT.sectionTitle, fontWeight: '400', color: COLORS.textSecondary },
  viewAll: { fontSize: FONT.viewAll, color: COLORS.viewAll, fontWeight: '500' },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/section-header.tsx
git commit -m "feat: add reusable SectionHeader component"
```

---

## Task 6: RestaurantCard component (version A)

**Files:**
- Create: `src/components/restaurant-card.tsx`

**Interfaces:**
- Consumes: `TRIP.featuredRestaurant` from `src/utils/trip-mock.ts`; tokens; `expo-image`
- Produces: `export default function RestaurantCard()` — no props

- [ ] **Step 1: Create the component**

```tsx
// src/components/restaurant-card.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

export default function RestaurantCard() {
  const { name, address, imageUrl } = TRIP.featuredRestaurant;
  return (
    <View style={s.container}>
      <View style={s.card}>
        <Image source={{ uri: imageUrl }} style={s.image} contentFit="cover" />
        {/* Overlay */}
        <View style={s.overlay}>
          <Text style={s.venueName}>{name}</Text>
          <Text style={s.address}>{address}</Text>
        </View>
      </View>
      {/* Pagination dots */}
      <View style={s.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: SPACING.screenH, marginBottom: SPACING.lg },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 220,
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardOverlay,
    padding: SPACING.md,
  },
  venueName: {
    fontSize: FONT.cardVenue,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  address: { fontSize: FONT.cardAddress, color: 'rgba(255,255,255,0.8)' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.statBorder,
  },
  dotActive: { backgroundColor: COLORS.text, width: 16 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/restaurant-card.tsx
git commit -m "feat: add RestaurantCard component (version A large photo)"
```

---

## Task 7: CircularAvatarRow component (version B)

**Files:**
- Create: `src/components/circular-avatar-row.tsx`

**Interfaces:**
- Produces: `export default function CircularAvatarRow(props: { items: Array<{ id: string; name: string; imageUrl: string }> })` 

- [ ] **Step 1: Create the component**

```tsx
// src/components/circular-avatar-row.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';

type Item = { id: string; name: string; imageUrl: string };
type Props = { items: readonly Item[] };

export default function CircularAvatarRow({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.content}
    >
      {items.map((item) => (
        <View key={item.id} style={s.item}>
          <Image
            source={{ uri: item.imageUrl }}
            style={s.avatar}
            contentFit="cover"
          />
          <Text style={s.label} numberOfLines={2}>{item.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.screenH,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  item: { alignItems: 'center', width: 64 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.iconBg,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT.avatarLabel,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/circular-avatar-row.tsx
git commit -m "feat: add CircularAvatarRow component (version B)"
```

---

## Task 8: Compose index.tsx

**Files:**
- Modify: `src/app/index.tsx`

**Interfaces:**
- Consumes: all 5 components + `TRIP` data + `COLORS` tokens
- The `SafeAreaView` wraps a `ScrollView`; no state, no hooks

- [ ] **Step 1: Replace index.tsx**

```tsx
/**
 * Gatesware trip detail screen — One Week Retreat at Supra Falls.
 * @module app/index
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TripHeader from '@/components/trip-header';
import TripStats from '@/components/trip-stats';
import SectionHeader from '@/components/section-header';
import RestaurantCard from '@/components/restaurant-card';
import CircularAvatarRow from '@/components/circular-avatar-row';
import { COLORS, SPACING } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

export default function TripDetailScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: brand, title, flag, description */}
        <TripHeader />

        {/* Stats: hotels, cars, restaurants, attractions */}
        <TripStats />

        {/* Version A: Restaurants — large photo card */}
        <SectionHeader
          title="Restaurants"
          iconColor="#F5A623"
        />
        <View style={s.cardWrap}>
          <RestaurantCard />
        </View>

        {/* Version B: Restaurants — circular avatars */}
        <SectionHeader
          title="Restaurants"
          count={TRIP.restaurants.length + 3}
          iconColor="#F5A623"
        />
        <CircularAvatarRow items={TRIP.restaurants} />

        {/* Version B: Places To Visit */}
        <SectionHeader
          title="Places To Visit"
          count={TRIP.places.length + 10}
          iconColor="#E8472A"
        />
        <CircularAvatarRow items={TRIP.places} />

        {/* Version B: Hotels */}
        <SectionHeader
          title="Hotels"
          count={TRIP.hotels.length + 3}
          iconColor="#4A90E2"
        />
        <CircularAvatarRow items={TRIP.hotels} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, backgroundColor: COLORS.surface },
  content: { paddingBottom: SPACING.xl },
  cardWrap: { marginBottom: SPACING.lg },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/index.tsx
git commit -m "feat: compose Gatesware trip detail screen on index"
```

---

## Task 9: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add Gatesware section to README**

Append to `README.md`:

```markdown
## Screens

### Gatesware — Trip Detail (`feat/gatesware-trip-detail`)

Reproduces the Gatesware "One Week Retreat" UI (designs A + B).

**Components:**
- `trip-header` — brand row, title, flag badge, description
- `trip-stats` — 4-column stat grid with inline SVG icons
- `section-header` — reusable colored icon + title + count + "View all"
- `restaurant-card` — large photo card with overlay (version A)
- `circular-avatar-row` — horizontal scroll of circular avatars (version B)

**Utils:**
- `src/utils/trip-tokens.ts` — color palette, spacing, typography
- `src/utils/trip-mock.ts` — static trip data
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Gatesware trip detail screen to README"
```
