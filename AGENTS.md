# AGENTS.md — Family wallet morphing sheet

Deep guide for an AI agent (or engineer) picking up this case. For the
human-facing overview see [README.md](README.md#case-family-wallet-morphing-sheet).

## What this is

A single-screen reproduction of the Family wallet's morphing bottom sheet,
built with **native SwiftUI views via `@expo/ui/swift-ui`** — not
Reanimated, not JS animation. The sheet springs between an **Options** pane
and two **detail** panes (Private Key / Recovery Phrase) while the panes
cross-fade.

## Where the animation logic lives

Read these three, in order:

1. **`src/hooks/use-morph-transition.ts`** — the brain. Owns `activeView` and
   `detailKind`, exposes `showDetail` / `showOptions`, and derives
   `sheetHeight` + `morphKey`. All transition logic is here; no rendering.
2. **`src/constants/animation.ts`** — the tunables: `MORPH_SPRING`, the two
   detent heights, and the detail content height. Change motion here.
3. **`src/components/wallet/morphing-sheet.tsx`** — the view. Maps the hook's
   state onto SwiftUI modifiers (`presentationDetents`, `animation`, `frame`).
   Pure render.

Everything else (`options-pane`, `detail-pane`, `option-row`, `close-button`,
`wallet-header`, `wallet-backdrop`) is presentational.

## How the morph actually works (mechanics + order)

1. A tap calls `showDetail(kind)` (or `showOptions()`), flipping `activeView`
   in the hook. **One state change** drives the whole transition.
2. That state feeds two things inside `morphing-sheet.tsx`, evaluated in the
   same React render → same SwiftUI transaction:
   - `presentationDetents(..., { selection: { height: sheetHeight } })` — UIKit
     springs the **sheet window height** between the two detents.
   - `animation(MORPH_SPRING, morphKey)` on the `ZStack` — because `morphKey`
     changed, SwiftUI animates every `opacity` / `blur` / `zIndex` inside,
     which is how the two panes **cross-fade**.
3. Both panes are always mounted (in the `ZStack`). The inactive one is
   `opacity 0` + `blur 6` + `disabled` (no hit-testing). Nothing remounts, so
   there's no flash and the outgoing text stays put while it fades.
4. `detailKind` is deliberately **not** reset when returning to Options — the
   detail copy must stay rendered and unchanged while the sheet shrinks back.

There is no per-frame JS. The React layer only picks the target detent; UIKit
and SwiftUI interpolate on the UI thread. This is why the "run animations on
the UI thread" concern is satisfied by construction.

## Conventions

- **Files:** kebab-case. Components PascalCase, hooks `use*`, handlers `handle*`
  / `show*`. One component per file.
- **Imports:** `@/*` → `src/*` (see `tsconfig.json`).
- **No magic values:** colors/copy in `constants/wallet.ts`, motion/size in
  `constants/animation.ts`. `FILL_AVAILABLE_WIDTH` is the stand-in for
  SwiftUI's `.infinity` maxWidth (the `@expo/ui` `frame` modifier takes a
  number).
- **TypeScript strict**, zero `any`.

## Pitfalls found while building this

- **`frame` ignores `max*` once `width`/`height` is set.** To get a fixed
  height *and* fill-width you must call `frame` twice — see the split calls in
  `option-row.tsx`, `detail-pane.tsx`, `morphing-sheet.tsx`.
- **The sheet has no visible "card" of its own to animate.** On iOS 26 the
  system sheet is already a floating inset card, so we animate the *sheet's*
  detent height instead of drawing and animating a custom card. Trying to draw
  a custom card inside a full-screen modal loses the native height spring.
- **Liquid Glass is iOS 26+.** `glassEffect` and the `Stack.Toolbar` button
  pills are gated behind iOS 26 in `@expo/ui`; older versions fall back to
  bare glyphs. The in-sheet X (`close-button.tsx`) is matched to the native
  header X by using the same gray + a circular `glassEffect`.
- **`presentationDetents` selection needs an `onSelectionChange`.** We own the
  selection via state, so it's a required no-op.
- **Fast Refresh resets navigation** when the route tree changes; relaunch the
  app after structural route edits rather than trusting hot reload.

## Reusing the morph in another project

The pattern is portable to any `@expo/ui/swift-ui` app:

1. Copy `use-morph-transition.ts` and `constants/animation.ts`. Generalize
   `SheetView` / `MORPH_KEY` to your set of panes.
2. Present a `BottomSheet` with `presentationDetents([...], { selection })`
   bound to the hook's `sheetHeight`.
3. Put your panes in a `ZStack`, toggling `opacity` / `blur` / `zIndex` /
   `disabled` on `active`, and wrap with `animation(SPRING, morphKey)`.

The only hard requirement is that the height selection and the pane opacity
change happen in the **same render** so they share one animation transaction.

## Validate after changes

```bash
npx tsc --noEmit && npx expo lint      # must be clean
npx expo run:ios                       # then compare against the reference
```

The app opens straight onto the wallet with the sheet open. Tap a settings row
to open, tap an option to morph to detail, tap X / Cancel to morph back.
