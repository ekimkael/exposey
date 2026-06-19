# Send Money — rn.ui

A faithful reproduction of a mobile wallet "Send Money" screen (peer-to-peer transfer).

## About the project

**rn.ui** is a collection of mobile UI reproductions built with Expo SDK 56.

| Branch | Content |
|--------|---------|
| `main` | Blank Expo 56 template — the baseline |
| `feat/<name>` | One screen reproduction per branch |

This branch (`feat/send-money-screen`) contains the Send Money screen reproduction.

## What was reproduced

A money transfer screen with:

- **Recipient card** — name, bank, account number
- **Amount input** — custom numeric keypad, two-tone display (dollars / cents)
- **3 entry animations** switchable from the menu: Scale Pulse, Flip (slot machine), Fade
- **Error feedback** — red color + shake + haptic when amount exceeds available balance, keypad locked
- **Available balance** — displayed with a credit card icon
- **Native Continue button** — SwiftUI `borderedProminent` on iOS, Jetpack Compose `Button` on Android
- **iOS toolbar menu** — animation picker + theme picker in the navigation bar
- **Light / dark / system theme** — follows the OS or forced from the menu

## Tech stack

| | |
|--|--|
| Runtime | Expo SDK 56, React Native 0.85.3 |
| Navigation | expo-router 56.2.11 |
| Animations | React Native Reanimated v4 |
| Native UI | `@expo/ui` — SwiftUI (iOS), Jetpack Compose (Android) |
| Typography | Open Runde (open-source SF Pro Rounded alternative) |
| Haptics | expo-haptics |
| Theming | React context — light / dark / system |

## Prerequisites

- Node.js ≥ 18
- npm or yarn
- [Expo Go](https://expo.dev/go) (iOS / Android) for JS-only mode
- Xcode (iOS simulator) or Android Studio for the native dev build

## Run locally

### 1. Clone and install

```bash
git clone https://github.com/ekimkael/rn.ui.git
cd rn.ui
git checkout feat/send-money-screen
npm install
```

### 2. Start (Expo Go — recommended to start)

```bash
npx expo start
```

Scan the QR code with the Expo Go app. All JS features are available: layout, fonts, keypad, animations, error feedback, themes.

### 3. Dev build — for native features

The native Continue button and the iOS toolbar menu require a **custom dev build** (not available in Expo Go):

```bash
npx expo run:ios        # iOS simulator
npx expo run:android    # Android emulator
```

> Xcode must be installed for `run:ios`, Android Studio for `run:android`.

### 4. Web

```bash
npx expo start --web
```

The Continue button falls back to a RN `Pressable`. The iOS toolbar menu does not appear.

## Run tests

`lib/amount.test.ts` is a dependency-free assert self-check. Requires Node 24+ (native type stripping):

```bash
cd src/lib
sed 's#\./amount#./amount.ts#' amount.test.ts > _amt.test.mts \
  && node --experimental-strip-types _amt.test.mts; rm -f _amt.test.mts
```

Prints `ok` on success.

## Lint

```bash
npm run lint
```

---

## Architecture

The route is composition-only; every section is an isolated, presentational component. State lives in the screen and flows down via props.

```
src/
  app/
    _layout.tsx              Loads Open Runde fonts, defines the Stack + ThemeProvider
    index.tsx                SendMoneyScreen — composition + state
  components/
    send-money-header.tsx    HeaderPill (nav title) + HeaderMenu (animation + theme pickers, iOS)
    recipient-card.tsx       Recipient details block
    amount-display.tsx       Animated amount + error feedback + ANIMATION_OPTIONS
    available-balance.tsx    "Available: $…" hint row
    error-banner.tsx         Inline "balance exceeded" banner
    amount-keypad.tsx        Numeric keypad (presentational)
    continue-button.tsx      Native CTA per platform (SwiftUI / Compose / web)
  lib/
    amount.ts                applyKey / splitAmount — pure money-entry logic
    amount.test.ts           Assert self-check (see "Run tests")
    fonts.ts                 Open Runde family-name constants
  theme/
    tokens.ts                Light + dark colour palettes (ThemeColors)
    theme-context.tsx        ThemeProvider + useTheme()
  assets/fonts/              OpenRunde-{Regular,Medium,Semibold,Bold}.otf
```

## State

`SendMoneyScreen` holds exactly two pieces of state:

| State | Type | Meaning |
|-------|------|---------|
| `amount` | `string` | Raw typed amount, starts at `"0"` |
| `animationStyle` | `AnimationStyle` | Entry animation chosen from the menu |

Theme preference (`system`/`light`/`dark`) lives in `ThemeProvider`, not in the screen.

Derived: `isBalanceExceeded = parseFloat(amount) > AVAILABLE_BALANCE`. When true, the keypad locks (except backspace) and `AmountDisplay` triggers the error feedback.

## Money entry (`lib/amount.ts`)

The amount is a **raw string**, not a number — the display matches keystrokes exactly (`"0."`, trailing dot, etc.) without float rounding.

- `applyKey(value, key)` — applies one press (`0`–`9`, `.`, or `DELETE_KEY`). Rules: single decimal point, max 2 cents digits, no leading zero.
- `splitAmount(value)` — splits into `{ dollars, cents }` for the two-tone display.

## Animations (`amount-display.tsx`)

Built with **Reanimated v4**. Two independent concerns:

1. **Entry animation** — user-selected (`pulse` | `flip` | `fade`):
   - `pulse`: the whole amount scales `1 → 1.08 → 1` on each keystroke.
   - `flip`: slot-machine slide, clipped inside a fixed-height viewport (remount on `amount`).
   - `fade`: each digit fades in/out independently (remount per character via `key`).
2. **Error feedback** — always on, independent of the entry animation: when `exceeded` flips to true the dollars cross-fade black↔red, the amount shakes, and a haptic buzz fires (native only).

All Reanimated hooks are declared unconditionally before the per-style branches, so the rules of hooks are never violated.

To add an animation: extend `AnimationStyle`, add an entry to `ANIMATION_OPTIONS` (label + SF Symbol), and add a branch in `AmountDisplay`. The header menu renders itself from `ANIMATION_OPTIONS` — no other change needed.

## Theming (`theme/`)

Light, dark, and system modes are supported.

- `tokens.ts` exports two palettes (`lightColors`, `darkColors`) sharing the `ThemeColors` keys. Never import a palette directly.
- `theme-context.tsx` provides `ThemeProvider` and the `useTheme()` hook, returning `{ colors, mode, setMode, scheme }`. `mode` is the user preference (`system | light | dark`); `scheme` is the resolved `light | dark`.
- The navigation bar and status bar follow `scheme` (see `ThemedStack` in `_layout.tsx`).
- Preference is **in-memory only** — not persisted across launches. To persist, add storage in `ThemeProvider`.

To add a colour: add the key to `ThemeColors` and to BOTH palettes.

## Styling conventions

- Colours come from `useTheme().colors` — never inline a hex value.
- Fonts: style with `fontFamily: font.*` (NOT `fontWeight`); each Open Runde weight is a separate registered family.
- Reanimated styles must use static hex strings (no `PlatformColor`); palette values are plain strings so they work inside worklets.
- Rounded corners use `borderCurve: 'continuous'`, except capsules (`borderRadius: 999`).

## Platform notes

- `HeaderMenu` (`Stack.Toolbar`) is **iOS-only**; it renders nothing on Android/web. The nav title pill shows everywhere.
- `ContinueButton` switches implementation via `process.env.EXPO_OS` (Metro build-time constant). Native variants use the system font; only the web fallback uses Open Runde.
- The back button is intentionally removed (`headerBackVisible: false`).
- `@expo/ui` imports are lazy `require()` inside `if` blocks: `@expo/ui/swift-ui` is a native iOS module that would throw at load time on Android if imported at the top level.
