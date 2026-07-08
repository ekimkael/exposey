# AGENTS.md — Magpie hero animation

Notes for an AI agent picking up this branch: where things live, how to
reuse the animation elsewhere, and what actually went wrong while building
it.

## Structure

```
src/constants/animation.ts     — every magic number/color/geometry value
src/hooks/use-hoarder-cycle.ts — orchestration: the playCycle timeline,
                                  typewriter, shared values, animated styles
src/components/hoarder-hero.tsx — pure render: composes JSX from the hook's
                                   output, no timing logic of its own
src/app/index.tsx              — mounts <HoarderHero /> as the home screen
src/app/_layout.tsx            — loads the Bricolage Grotesque font,
                                  renders the splash overlay, then <Slot />
```

There is no tab bar — `_layout.tsx` renders `<Slot />` directly.
`src/components/app-tabs.*` was deleted; if you're adding more routes,
you'll need your own navigation.

## Conventions

- Functional components, kebab-case filenames, path aliases (`@/*`) over
  relative imports — matches the rest of the repo.
- Animation timing values live in `HERO_TIMING` (constants/animation.ts),
  not inline — if you're tuning pacing, that's the one place to look.
- The orchestration hook (`useHoarderCycle`) is a plain async
  `while (alive.current)` loop driving Reanimated shared values via
  `.value = withTiming(...)`, not a `withRepeat`/`withSequence` chain for
  the whole timeline. This was a deliberate choice for readability (the
  cycle reads top-to-bottom like a script) over "pure" Reanimated
  choreography — reasonable for a one-off hero animation, but if you're
  extending this into something more complex, consider whether the
  imperative-script approach still holds up.

## Reusing this animation elsewhere

1. Copy `constants/animation.ts` and `hooks/use-hoarder-cycle.ts`.
2. Adjust `HEADLINE`, `SUBLINE`, `CARD_COLORS`, `ORBIT_ICONS` to your content.
3. Call `useHoarderCycle()` in your own component and wire its return value
   (`iconStyle`, `ringStyle`, `orbitGroupStyle`, `orbit`, `cardProgress`,
   `text`, `caret`) into your own JSX — see `hoarder-hero.tsx` for the
   exact wiring (which style goes on which `Animated.View`, and why the
   rings/cards/icon are wrapped in a fixed-size `iconCluster` box rather
   than living directly in a flexible container).

## Pitfalls

- **Cards are z-order occlusion, not a shrink effect.** The reference video
  shows full-size cards sliding behind the icon (which is opaque and
  renders after them in the tree) — not cards shrinking into a point. Easy
  to misread from a quick glance at the source video; verify with a
  frame-by-frame extraction before assuming the simpler (wrong) mechanic.
- **`position: 'absolute'` children need a fixed-size anchor.** When the
  icon's rings/cards were anchored directly inside a `flex: 1` container
  (to vertically center the whole hero block), their absolute offsets
  became relative to that now-much-taller box instead of the icon itself —
  cards appeared to vanish far above the icon instead of behind it. Fix:
  wrap everything that needs absolute positioning in a fixed-size box
  (`iconCluster`), and let *that* box be the thing a flexible parent
  centers.
- **Loop restarts must erase the previous line first.** Without an
  `isFirst` check erasing the subline before retyping the headline, every
  loop iteration after the first jump-cuts the text instead of animating
  the transition.
- **Custom fonts need a native prebuild, not just a JS rebuild.**
  Installing `@expo-google-fonts/*` adds the `expo-font` config plugin to
  `app.json` automatically — the font files only get embedded into the
  native project after `expo prebuild --clean -p ios` + `pod install`, not
  from `expo run:ios` alone if the plugin is new.
- **`pod install` fails with a Unicode encoding error** ("Unicode
  Normalization not appropriate for ASCII-8BIT") unless
  `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` is set for that shell — CocoaPods
  needs a UTF-8 locale and won't tell you clearly why it's crashing
  otherwise.
- **`@expo/ui` and `expo-glass-effect` can't be fully removed** even though
  nothing in this app imports them — `expo-router` depends on them
  transitively. Removing them from `package.json` is still correct (it
  stops us from pinning a redundant direct dependency), but don't expect
  `node_modules` to shrink.
