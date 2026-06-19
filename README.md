# rn.ui

A collection of mobile UI reproductions built with **Expo SDK 56**.

## How this repo works

| Branch | Purpose |
|--------|---------|
| `main` | Untouched Expo template — the baseline |
| `feat/<name>` | One UI reproduction per branch |

To start a new reproduction: branch off `main`, keep it isolated.

## Screens

| Branch | Screen | Native features |
|--------|--------|----------------|
| `feat/send-money-screen` | Send Money (wallet transfer) | SwiftUI/Compose button, iOS toolbar menu |

Full architecture notes: [docs/send-money.md](docs/send-money.md)

## Tech stack

| | |
|--|--|
| Runtime | Expo SDK 56, React Native 0.85.3 |
| Navigation | expo-router 56.2.11 (file-based) |
| Animations | React Native Reanimated v4 |
| Native UI | `@expo/ui` — SwiftUI Host/Button (iOS), Jetpack Compose (Android) |
| Typography | [Open Runde](https://github.com/aurelijusb/open-runde) — open-source SF Pro Rounded alternative |
| Haptics | expo-haptics |
| Theming | React context — light / dark / system |

## Run

```bash
npm install
npx expo start        # Expo Go — works for layout, fonts, keypad, animations
```

Two features require a custom dev build (not available in Expo Go):

- **Native Continue button** — SwiftUI `borderedProminent` (iOS) / Compose `Button` (Android)
- **Header toolbar menu** — `Stack.Toolbar` with animation + theme pickers (iOS)

```bash
npx expo run:ios      # or: npx expo run:android
```

## Theming

Light, dark, and system modes are supported. The active mode is picked from the header menu (iOS) and is **in-memory only** — it resets on each launch. To persist it, add storage in `src/theme/theme-context.tsx`.

## Adding a new screen

1. `git checkout -b feat/<screen-name> main`
2. Replace `src/app/index.tsx` with the reproduction
3. Add components under `src/components/`, pure logic under `src/lib/`
4. Document it in `docs/<screen-name>.md` and add a row to the table above
