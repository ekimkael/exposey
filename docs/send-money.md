# Send Money screen

Reproduction of a savings/utility wallet "Send Money" interface. This document
is the entry point for anyone (human or agent) picking up the screen.

## Run it

```bash
npm install
npx expo start          # JS-only features
```

The **native Continue button** and the **header toolbar menu** use `@expo/ui`
and `Stack.Toolbar`, which are **not** available in Expo Go. To see them you
need a custom dev build:

```bash
npx expo run:ios        # or: npx expo run:android
```

Everything else (layout, fonts, keypad, animations, error state) works in Expo
Go and on web.

## Architecture

The route is composition-only; every section is an isolated, presentational
component. State lives in the screen and flows down via props.

```
src/
  app/
    _layout.tsx              Loads Open Runde fonts, defines the Stack
    index.tsx                SendMoneyScreen — composition + state
  components/
    send-money-header.tsx    HeaderPill (nav title) + AnimationMenu (toolbar, iOS)
    recipient-card.tsx       Recipient details block
    amount-display.tsx       Animated $ amount + error feedback + ANIMATION_OPTIONS
    available-balance.tsx    "Available: $…" hint row
    error-banner.tsx         Inline "balance exceeded" banner
    amount-keypad.tsx        Numeric keypad (presentational)
    continue-button.tsx      Native CTA per platform (SwiftUI / Compose / web)
  lib/
    amount.ts                applyKey / splitAmount — pure money-entry logic
    amount.test.ts           assert-based self-check (see "Tests")
    fonts.ts                 Open Runde family-name constants
  theme/
    tokens.ts                Semantic colour palette (single source of truth)
  assets/fonts/              OpenRunde-{Regular,Medium,Semibold,Bold}.otf
```

## State

`SendMoneyScreen` holds exactly two pieces of state:

| State            | Type            | Meaning                                  |
| ---------------- | --------------- | ---------------------------------------- |
| `amount`         | `string`        | Raw typed amount, e.g. `"100.25"`        |
| `animationStyle` | `AnimationStyle`| Entry animation chosen from the menu     |

Derived: `isBalanceExceeded = parseFloat(amount) > AVAILABLE_BALANCE`. When
true, the keypad locks (all keys except backspace) and `AmountDisplay` shows
the error feedback.

## Money entry (`lib/amount.ts`)

The amount is a **raw string**, not a number, so the display matches keystrokes
exactly (`"0."`, trailing dot, etc.) without float rounding.

- `applyKey(value, key)` — applies one press (`0`–`9`, `.`, or `DELETE_KEY`).
  Enforces: single decimal point, max 2 cents digits, no leading zero.
- `splitAmount(value)` — splits into `{ dollars, cents }` for two-tone display.

Edit the rules here, and update `amount.test.ts` in the same change.

## Animations (`amount-display.tsx`)

Built with **Reanimated v4**. Two independent concerns:

1. **Entry animation** — user-selected (`pulse` | `flip` | `fade`):
   - `pulse`: whole amount scales `1 → 1.08 → 1` on each keystroke.
   - `flip`: slot-machine slide, clipped to a fixed-height viewport (remount on `amount`).
   - `fade`: each digit fades in/out independently (remount per character via `key`).
2. **Error feedback** — always on, regardless of the entry animation: dollars
   cross-fade black↔red and the amount shakes when `exceeded` flips to true.

All Reanimated hooks are declared unconditionally before the per-style return
branches, so the rules of hooks are never violated.

To add a new entry animation: extend `AnimationStyle`, add an entry to
`ANIMATION_OPTIONS` (label + SF Symbol), and add a branch in `AmountDisplay`.
The header menu renders itself from `ANIMATION_OPTIONS` — no other change needed.

## Styling conventions

- Colours come from `theme/tokens.ts` — never inline a hex value.
- Fonts: style with `fontFamily: font.*` (NOT `fontWeight`); each Open Runde
  weight is a separate registered family.
- Reanimated styles must use static colour strings (no `PlatformColor`).
- Rounded corners use `borderCurve: 'continuous'`, except capsules
  (`borderRadius: 999`).

## Platform notes

- `AnimationMenu` (`Stack.Toolbar`) is **iOS-only**; it renders nothing on
  Android/web. The nav title pill still shows everywhere.
- `ContinueButton` swaps implementation by `process.env.EXPO_OS`. Native
  variants use the system font; only the web fallback uses Open Runde.
- The back button is intentionally removed (`headerBackVisible: false`).

## Tests

`lib/amount.test.ts` is a dependency-free `assert` self-check. Run it with a
Node that supports TypeScript stripping (Node 24+):

```bash
cd src/lib
sed 's#\./amount#./amount.ts#' amount.test.ts > _amt.test.mts \
  && node --experimental-strip-types _amt.test.mts; rm -f _amt.test.mts
```

It prints `ok` on success.
