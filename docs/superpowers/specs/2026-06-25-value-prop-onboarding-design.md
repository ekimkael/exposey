# Remindo Value-Prop Onboarding Screen

**Date:** 2026-06-25  
**Reference:** Fuse "Intro Value Prop Cycle Animation" video

## What

A single onboarding/landing screen with a vertical slot-machine value-prop cycle, white→blue gradient, logo, headline, and two CTA buttons. Reproduces the Fuse fintech animation rebrand for Remindo (productivity).

## Layout (top → bottom)

1. **Cycling words** — vertical loop of 5 words; center word is bold + colored icon, neighbors faded. Reanimated drives the scroll.
2. **Gradient fill** — white → `#208AEF` (existing Remindo splash blue) covering bottom half.
3. **Logo mark** — small rounded-square SVG (generated inline).
4. **Headline** — "Your day, organised"
5. **Subtitle** — "Plan, remind and share — synced across all your devices."
6. **Primary button** — native `@expo/ui` Button, "Continue with Apple" + apple.logo SF Symbol, white pill.
7. **Secondary button** — `@expo/ui` Button with expo-glass-effect, "Restore from iCloud" + icloud SF Symbol, frosted pill.

## Value-prop words

| Word | Icon colour |
|------|-------------|
| Plan | Blue `#208AEF` |
| Remind | Amber `#F5A623` |
| Focus | Purple `#8B5CF6` |
| Share | Green `#34C759` |
| Sync | Cyan `#5AC8FA` |

## Tech

- **Cycling list + gradient** → React Native + Reanimated 4 (cross-platform, pixel control)
- **Buttons** → native `@expo/ui` Button (SwiftUI / Jetpack Compose host)
- **Haptics** → expo-haptics on press; no navigation
- **Icons** → expo-symbols (SF Symbols on iOS, Material Icons on Android) inside SVG-drawn colored blobs
- **Assets** → all SVG, generated inline — no image downloads

## Files

```
src/app/index.tsx              ← screen (replaces main's template)
src/components/cycling-words.tsx
src/components/onboarding-actions.tsx
src/utils/tokens.ts            ← updated colour tokens
```

## Non-goals

- No navigation / auth wiring
- No web platform
- No extra dependencies
