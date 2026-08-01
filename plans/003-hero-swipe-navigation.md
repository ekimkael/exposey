# 003 — Swipe the hero left/right to change entry

- **Status**: DONE
- **Commit**: eb8b547
- **Severity**: N/A (new feature, not a defect)
- **Category**: 8 — Missed opportunities
- **Estimated scope**: 2 files changed, 1 file added, ~120 lines

## Problem

The hero photo is inert. The only way to change entry is the filmstrip at the
bottom of the screen, which means a thumb reaching 700pt down the screen to
change a picture that fills the top half. A horizontal swipe on the hero is the
gesture every photo viewer on the platform answers to, and here it does nothing.

```tsx
// src/app/index.tsx:32-37 — current, a static Image
<Image
  source={entry.scene}
  style={[styles.hero, { width: width - LAYOUT.heroInset * 2 }]}
  contentFit="cover"
  transition={0}
/>
```

## Target

The hero becomes a horizontally paged list. Swiping it left/right moves to the
next/previous entry, the filmstrip follows, and the date updates — with the two
lists staying in sync no matter which one the user drives.

### Approach: a paged ScrollView, not a Pan gesture

Use `Animated.ScrollView` with `pagingEnabled`, driven by `useScrollOffset` —
the exact pattern `src/components/coverflow-strip.tsx` already uses. **Do not
use `Gesture.Pan()` from react-native-gesture-handler.** Three reasons, and the
executor must not "improve" on this:

1. `GestureHandlerRootView` is not mounted anywhere in `src/`. A Pan gesture
   would need that wiring added at the root first, and would fail silently
   without it.
2. Native paging gives velocity-aware page changes, rubber-banding at the first
   and last entry, and mid-flight interruptibility **for free**. Hand-rolling
   those on a Pan gesture is where this feature would actually go wrong — a
   hard stop at the bounds instead of rising friction is a motion defect in its
   own right.
3. It mirrors the pattern already proven in this repo, so the two lists behave
   identically under the finger.

### The sync protocol — this is the hard part

Two scrollable lists now both want to own "which entry is selected". Without a
protocol they fight: the strip scrolls the hero, whose scroll event scrolls the
strip, which scrolls the hero.

`selected` in `src/app/index.tsx` stays the single source of truth. The rule:

> **A list never programmatically scrolls while the user is dragging it.**

Implement with an `activeSource` ref in `src/app/index.tsx`:

```tsx
// target — src/app/index.tsx
const activeSource = useRef<'hero' | 'strip' | null>(null);

const handleSelect = useCallback((index: number, source: 'hero' | 'strip') => {
  activeSource.current = source;
  setSelected(index);
}, []);
```

Each list receives `selectedIndex` and scrolls to it in a `useEffect`, skipping
when it is itself the active source:

```tsx
// target — inside each list component
useEffect(() => {
  if (isActiveSource) return;
  scrollRef.current?.scrollTo({ x: selectedIndex * PAGE, animated: !reduceMotion });
}, [selectedIndex, isActiveSource, reduceMotion, scrollRef]);
```

This converges rather than looping: a programmatic scroll fires scroll events,
the receiving list computes the *same* index, `setSelected` is called with an
unchanged value, React bails out, no further scroll. The existing
`useAnimatedReaction` in `coverflow-strip.tsx:71-79` already guards on
`index !== previous`, so it will not even fire.

### Geometry — the hero visual must not change

The hero is currently `width - 100` wide with `aspectRatio: 0.688`, centred,
`marginTop: 20`, `borderRadius: 20`. Paging requires the *scroller* to be
full-screen-width so pages snap by `width`, with the image centred inside each
page at its current size. In RN, `aspectRatio` is width ÷ height, so:

```tsx
const heroWidth = width - LAYOUT.heroInset * 2;   // 302pt on a 402pt screen
const heroHeight = heroWidth / LAYOUT.heroAspect; // 439pt
```

The ScrollView takes `{ height: heroHeight, marginTop: LAYOUT.gap }`; each page
is a `width`-wide `View` with `alignItems: 'center'` holding the image at
`heroWidth`. Rendered size, position and radius are unchanged.

### Bounds, velocity, interruptibility

All three come from `pagingEnabled` + iOS's default `bounces`. Do not add
`decelerationRate`, a snap interval, or a distance threshold — `pagingEnabled`
already advances on a fast flick and rubber-bands past the ends.

### Reduced motion

The swipe itself is direct manipulation and stays. Only the *programmatic*
sync scroll is synthetic motion, so pass `animated: !reduceMotion` as shown
above — the position still updates, it just does not glide. Read the flag with
`useReducedMotion()` from `react-native-reanimated`, matching
`src/hooks/use-coverflow-transform.ts:46`.

### Accessibility

A swipe-only affordance is invisible and unreachable by VoiceOver. Give the
hero pager adjustable semantics so it can be driven without the gesture:

```tsx
accessible
accessibilityRole="adjustable"
accessibilityLabel={`Reading entry, ${entry.date}`}
accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
onAccessibilityAction={(e) => {
  const delta = e.nativeEvent.actionName === 'increment' ? 1 : -1;
  const next = Math.min(Math.max(selected + delta, 0), READING_LOG.length - 1);
  handleSelect(next, 'strip'); // 'strip' so the hero scrolls itself to match
}}
```

## Angles this introduces that are easy to miss

Flagging these explicitly because getting the gesture working is the easy half:

1. **It overrides a documented decision.** `README.md` and the JSDoc at
   `src/app/index.tsx:11-17` both state the hero swap is a deliberate hard cut
   (`transition={0}`) because the reference recording shows no blend. A pager
   inherently animates the transition — the swipe *is* the animation. This
   feature knowingly diverges from the reference. Step 6 updates both docs;
   do not skip it.
2. **The strip's follow-scroll uses the platform curve.** When the hero drives,
   the strip is moved with `scrollTo({ animated: true })`, which uses
   UIScrollView's canned easing rather than the strip's own momentum physics —
   the LOW finding already recorded in `plans/README.md`. Swiping the hero will
   make that inconsistency more visible than tapping a thumbnail does.
3. **Both lists render all 14 entries.** Acceptable — expo-image decodes to
   display size, and the strip already does this — but the hero decodes at
   302×439 rather than 85×85. If memory becomes a problem, switch the hero to
   `FlatList` with `windowSize={3}`; do not do this pre-emptively.
4. **The system back-swipe is not a conflict here.** The hero is inset 50pt
   from each screen edge, clear of the ~20pt edge-gesture zone. This is only
   true because of `LAYOUT.heroInset`; if the hero ever goes full-bleed, revisit.

## Repo conventions to follow

- Files and directories in **kebab-case**; components PascalCase, hooks `use*`,
  handlers `handle*`.
- Routes live in `src/app/` **exclusively** — the new pager component goes in
  `src/components/`, never in `src/app/`.
- Path alias `@/*` → `src/*`. Prefer it over relative imports.
- All layout/motion values come from `@/constants/theme` and
  `@/constants/animation`. Do not inline a number that belongs there.
- Exemplar to imitate for the whole component shape — scroll ref, offset,
  reaction, JSDoc register: `src/components/coverflow-strip.tsx:61-105`.
- JSDoc on exported components explaining *why*, not what.

## Steps

1. Create `src/components/hero-pager.tsx` exporting `HeroPager`, props
   `{ entries: readonly ReadingEntry[]; selectedIndex: number; onSelect: (index: number) => void; onDragStart: () => void }`.
   Build it as an `Animated.ScrollView` with `horizontal`, `pagingEnabled`,
   `showsHorizontalScrollIndicator={false}`, a `useAnimatedRef`, and
   `useScrollOffset`. Report index changes with `useAnimatedReaction` on
   `Math.round(scrollX.value / width)`, guarded by `index !== previous` and
   in-range, calling `runOnJS(onSelect)`. Wire `onScrollBeginDrag={onDragStart}`.
   Add the `useEffect` sync and the accessibility props from **Target**.

2. In `src/constants/theme.ts`, nothing to add — `heroInset`, `heroAspect`,
   `heroRadius` and `gap` already exist. Use them.

3. In `src/app/index.tsx`, add the `activeSource` ref and change `handleSelect`
   to take a source, per **Target**.

4. In `src/app/index.tsx`, replace the static `<Image>` (lines 32-37) with
   `<HeroPager entries={READING_LOG} selectedIndex={selected} onSelect={…} onDragStart={…} />`.
   Move the `borderRadius`/`aspectRatio` styling into the pager's page item so
   the rendered image is byte-identical; delete the now-unused `hero` style
   entry only if nothing else references it.

5. In `src/components/coverflow-strip.tsx`, add a `selectedIndex: number` prop
   and an `isActive` boolean (or accept an `activeSource` value), plus the same
   guarded `useEffect` sync so the strip follows when the hero drives. Wire
   `onScrollBeginDrag` to report itself as the active source. Do not otherwise
   touch the strip's transform, constants, or `snapToInterval`.

6. Update the docs to reflect the divergence:
   - `README.md` → in **Known limitations**, replace the "hero updates
     immediately" bullet's framing with a note that the hero is now swipeable
     and that this intentionally departs from the reference's hard cut.
   - The JSDoc at `src/app/index.tsx:11-17` → drop the "hard cut" claim.
   - `AGENTS.md` → under "Where the animation lives", note the second
     scroll-linked surface and the `activeSource` sync rule.

## Boundaries

- Do NOT add `react-native-gesture-handler` usage or `GestureHandlerRootView`.
  The whole point of the ScrollView approach is avoiding that wiring.
- Do NOT change any calibrated constant: `ITEM`, `STRIDE`, `STEP_DEG`,
  `RADIUS`, `PERSPECTIVE`, `MAX_STEPS`, `FADE_FROM`, or any `LAYOUT` value.
  They are measured off a reference recording and documented in `README.md`.
- Do NOT alter the coverflow transform in `src/hooks/use-coverflow-transform.ts`.
- Do NOT change the hero's rendered size, position, corner radius or
  `contentFit`. Only its container changes.
- Do NOT add a crossfade, scale, or parallax to the hero pages. Paging
  translation only — extra motion on a 302×439pt surface reads as heavy.
- Do NOT add dependencies.
- If the code you find does not match the excerpts above (drift since commit
  `eb8b547`), STOP and report rather than improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit` and `npx expo lint` — both must be clean.

- **Geometry regression** — the hero and strip must not move. With the app
  freshly launched (entry 0):
  ```bash
  xcrun simctl io booted screenshot /tmp/after.png
  magick /tmp/after.png -colorspace gray -crop 1206x340+0+1985 +repage -compress none pgm:- > /tmp/c.pgm
  awk 'NR==1{next} NR==2{W=$1;H=$2;next} NR==3{next}
  {for(i=1;i<=NF;i++)v[n++]=$i}
  END{ inb=0
    for(x=0;x<W;x++){ on=0
      for(y=0;y<H;y++){ if(v[y*W+x]>30){ on=1; break } }
      if(on && !inb){ s=x; inb=1 } else if(!on && inb){ printf "w=%.1fpt x=%+.1fpt\n",(x-s)/3.0,((s+x-1)/2-603)/3; inb=0 }
    }
  }' /tmp/c.pgm
  ```
  Must still print exactly:
  ```
  w=85.0pt x=+0.0pt
  w=73.7pt x=+95.7pt
  w=46.7pt x=+165.8pt
  ```

- **Feel check** — the sync protocol is what breaks, so test it deliberately:
  1. Swipe the hero left. The strip advances one entry and the date updates.
  2. Scroll the strip. The hero follows to the matching photo.
  3. **Fling the strip fast across many entries.** The hero must land on the
     same entry the strip settles on — no drift, no oscillation, no ping-pong
     between the two lists. This is the failure mode the protocol exists for.
  4. Start dragging the hero and, without releasing, observe the strip: it must
     not jitter or fight the drag.
  5. At entry 0, swipe right: the page rubber-bands and springs back — it must
     not hard-stop.
  6. At the last entry, swipe left: same rubber-band.
  7. Swipe the hero rapidly several times in a row. Each swipe retargets from
     the current position; nothing restarts from zero.

- **Reduced motion**: enable Simulator → Settings → Accessibility → Motion →
  Reduce Motion, then fully relaunch (`xcrun simctl terminate booted
  net.digitalekim.papyrus && xcrun simctl launch booted net.digitalekim.papyrus`
  — the setting is read at app start). Swiping the hero must still work; the
  strip should jump to the new entry rather than glide.

- **VoiceOver**: enable it, focus the hero, and swipe up/down. The entry must
  change and the new date must be announced.

- **Done when**: `tsc` and lint are clean, the three strip measurements are
  unchanged, a fast strip fling and a hero swipe both settle on the same entry
  every time, both bounds rubber-band, and the docs in step 6 no longer claim
  the hero swap is a hard cut.
