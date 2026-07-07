# AGENTS.md

Agent-facing notes for working on this project. See [README.md](README.md)
for the human-facing overview.

## Project structure

```
src/
  app/
    _layout.tsx        # root layout: single screen, no tabs
    index.tsx           # the login screen (pure render)
  components/
    card-stack.tsx       # fanned gold/silver/black card hero (pure render)
    floating-label-field.tsx  # text field with floating label (pure render)
  hooks/
    use-keyboard-shrink.ts   # keyboard-driven hero shrink animation
    use-floating-label.ts    # floating-label float/settle animation
  constants/
    theme.ts             # colors + copy
    animation.ts          # timings, ratios, easings — no magic numbers elsewhere
    cards.ts              # card geometry (size, canvas, fan rotation/offset)
```

Routes live under `src/app/` only — components, hooks, and constants are
never co-located there. Path alias `@/*` maps to `src/*`.

## Where the animation logic lives

**Convention: components render, hooks animate.** Every `Animated.Value` and
every `.interpolate()` call lives in a hook; components only spread the
hook's returned style objects. If you're adding new animated UI here, follow
that split — don't inline `useState(() => new Animated.Value(...))` or
`.interpolate()` calls directly in a component's JSX.

- **`useKeyboardShrink(heroHeight)`** (`src/hooks/use-keyboard-shrink.ts`) —
  listens to `Keyboard` show/hide events and returns two ready-to-use
  `Animated.AnimatedInterpolation` values: `heroHeightAnim` (container height)
  and `cardScaleAnim` (visual scale of the card fan). Animates over the
  *native* event's own `duration` so the shrink stays exactly in sync with
  the real keyboard slide — don't hardcode a duration guess here.

  To reuse this pattern elsewhere: pass any resting height, wrap your
  hero content in `<Animated.View style={{ height: heroHeightAnim }}>` >
  `<Animated.View style={{ transform: [{ scale: cardScaleAnim }] }}>`.

- **`useFloatingLabel(hasValue)`** (`src/hooks/use-floating-label.ts`) —
  drives a single field's label float/settle. Takes `hasValue` (not
  `focused`) as its input specifically to avoid a stale-closure bug: `onBlur`
  needs to decide whether to stay floated based on the field's *content*,
  not its focus state, because `onBlur` fires while the field's focus state
  (in the calling component) is still `true` in that render's closure. If you
  refactor this, keep `onBlur` keyed off content, not focus.

## Conventions

- TypeScript strict, no `any`.
- No magic numbers for anything animation-related (timing, easing, scale/height
  ratios) — add a named constant to `constants/animation.ts` instead.
- Colors always come from `constants/theme.ts` (`ONYX_COLORS`) — check there
  before hardcoding a new `rgba(...)` string; a near-identical one may already
  exist (this repo previously had a drift bug: `card-stack.tsx` hardcoded the
  same rgba the theme already named `visaText`, instead of importing it).
- Hooks named `use*`, components `PascalCase`, handlers `handle*`.

## Pitfalls hit while building this

- **`react-hooks/refs` ESLint rule** (enabled via `app.json`'s
  `experiments.reactCompiler`) forbids `useRef(x).current` reads during
  render — the common `useRef(new Animated.Value(0)).current` idiom fails
  it. Use lazy `useState(() => new Animated.Value(0))` instead; it's a
  singleton across renders just like the ref version, but reading it during
  render is allowed.
- **RN's `transform` array type** wants each array item to carry exactly one
  transform key (`{ translateY }` OR `{ scale }`, never both in one object).
  A hook returning a combined `{ translateY, scale }` object will satisfy
  the *runtime* shape (if you still push them as separate array entries) but
  can easily get the *type annotation* wrong — type it as a union of
  single-key objects, not one object with all keys.
- **CocoaPods `pod install` failing with "incompatible library version" on
  `ffi_c.bundle`**: on this machine, the `ffi` gem's native extension had
  been compiled against macOS's *system* Ruby framework (2.6) instead of the
  active `chruby`/`rbenv` Ruby (3.1.2). Fixed with `gem pristine ffi`
  (recompiles the extension against the currently active Ruby) — not a
  project issue, a pre-existing broken gem on the host.
- **`npx` may be intercepted by a shell hook** in some environments (e.g. a
  token-usage-tracking wrapper) and silently mis-route `npx expo ...` calls.
  If `npx expo <cmd>` fails with a confusing `npm error Missing script`,
  try the binary directly: `node_modules/.bin/expo <cmd>`.
- **Rotated absolutely-positioned views can poke outside their parent's
  layout box** even though the parent itself doesn't clip — the *next*
  ancestor with `overflow: hidden` clips them, which can be surprising if
  that ancestor isn't the one you were styling. The card fan's stage
  (`constants/cards.ts` → `HERO_STAGE`) is sized generously (320×270) purely
  to give the ±18° rotated cards' bounding boxes room; don't shrink it
  without re-checking all three cards render uncropped.
