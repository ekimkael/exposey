# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Case: Family wallet morphing sheet

A faithful reproduction of the [Family](https://family.co) wallet's "morphing
bottom sheet": one white card anchored at the bottom that springs between
three states — **Options**, **Private Key** and **Secret Recovery Phrase** —
while the outgoing and incoming content cross-fade with a slight blur. Built
with native SwiftUI views through [`@expo/ui`](https://docs.expo.dev/versions/latest/sdk/ui/),
not JS-driven animation.

|                    | Reference video                              | This case                                    |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| Sheet              | Morphing bottom sheet                        | Native SwiftUI `BottomSheet` with two detents |
| Header buttons     | Bare X / gift                                | Native `Stack.Toolbar` (iOS 26 Liquid Glass) |
| Animation          | Height morph + content cross-fade            | UIKit detent spring + SwiftUI opacity/blur   |

### Run it

```bash
npx expo run:ios      # opens straight onto the wallet
```

Requires a native build (the case uses native modules from `@expo/ui`). Expo
Go will not work. Target is the **iOS 26 simulator** — see platform notes below.

### How it works

- **The sheet is the morphing card.** On iOS 26 the system sheet is already a
  floating inset card, so instead of drawing our own card we let the sheet be
  it. Two fixed `presentationDetents` (`OPTIONS_SHEET_HEIGHT`,
  `DETAIL_SHEET_HEIGHT`) with a state-driven `selection` make UIKit animate the
  height natively.
- **Both panes stay mounted.** `OptionsPane` and `DetailPane` live together in
  a `ZStack`. Only their `opacity`/`blur`/`zIndex` change, driven by the
  `active` flag, so switching panes cross-fades instead of remounting. The
  whole thing is keyed on `animation(MORPH_SPRING, MORPH_INDEX[activeView])`,
  so the height change and the cross-fade run in one SwiftUI transaction.
- **Native header.** The X (dismiss) and gift buttons go through
  `Stack.Toolbar.Button`, so they are real `UIBarButtonItem`s with the iOS 26
  Liquid Glass pill. The in-sheet X (`CloseButton`) is matched to them with a
  circular `glassEffect` and the same gray.
- **Single screen.** Root `_layout.tsx` is a `Stack` (which hosts the native
  header) and the wallet is its `index.tsx`.

### File map

Everything for the case lives in these files (start at `src/app/index.tsx`):

| File                                         | Responsibility                                              |
| -------------------------------------------- | ----------------------------------------------------------- |
| `src/app/_layout.tsx`                        | Root `Stack` that hosts the native header                   |
| `src/app/index.tsx`                          | `WalletScreen` — composes header + backdrop + sheet         |
| `src/constants/wallet.ts`                    | Colors, spring, heights, types, and copy (all data + JSDoc) |
| `src/components/wallet/wallet-header.tsx`    | `Stack.Toolbar` X / gift buttons                            |
| `src/components/wallet/wallet-backdrop.tsx`  | Static orange card + settings rows (plain RN)               |
| `src/components/wallet/morphing-sheet.tsx`   | `BottomSheet` + morph state (`activeView`, `detailKind`)    |
| `src/components/wallet/options-pane.tsx`     | Compact first state (title + option rows)                   |
| `src/components/wallet/detail-pane.tsx`      | Tall detail state (shared by both detail views)             |
| `src/components/wallet/option-row.tsx`       | One row in the Options pane                                  |
| `src/components/wallet/close-button.tsx`     | In-sheet Liquid Glass X                                      |

### State model

`MorphingSheet` owns two pieces of state:

- `activeView: SheetView` — `'options' | 'privateKey' | 'recoveryPhrase'`,
  which pane is shown. Drives both the detent selection and the cross-fade.
- `detailKind: DetailKind` — the last detail pane opened. Kept separate so the
  detail copy doesn't swap while the sheet is fading *back* to Options.

`WalletScreen` owns `isSheetOpen`. The header X and swipe-down close it; any
settings row reopens it.

### Extending

- **New detail pane** → add an entry to `DETAIL_COPY` / `DETAIL_HERO_ICON` in
  `src/constants/wallet.ts`, extend the `SheetView` union, add a row in
  `OptionsPane`, and a `MORPH_INDEX`.
- **Different heights / colors / timing** → all live as named constants in
  `src/constants/wallet.ts`; nothing is hard-coded in the components.

### Platform notes & known gaps

- **iOS only.** `@expo/ui/swift-ui` is iOS-only; `WalletScreen` renders an
  `IosOnlyNotice` elsewhere. An Android port would need a parallel
  `@expo/ui/jetpack-compose` implementation.
- **iOS 26+ for the glass.** The Liquid Glass treatment (`glassEffect`, the
  toolbar button pills) is gated behind iOS 26 in `@expo/ui`; on older
  versions it falls back to bare glyphs / the classic toolbar style.
- **Gaps vs the reference:** system rounded font instead of Family's custom
  typeface; SF Symbols approximate the original icons; sheet heights are fixed
  constants measured from the video (swap for `onGeometryChange` sizing if the
  content ever becomes dynamic).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
