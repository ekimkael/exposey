# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Case: Family wallet morphing sheet

Reproduction of the Family wallet "morphing bottom sheet": a single white
card anchored at the bottom that springs between three states — **Options**,
**Private Key** and **Secret Recovery Phrase** — while the outgoing and
incoming content cross-fade with a slight blur.

**How it works** — a native SwiftUI `BottomSheet` (`@expo/ui/swift-ui`); on
iOS 26 the system sheet is already a floating inset card, so the sheet itself
is the morphing card. Two fixed `presentationDetents` with a state-driven
`selection` make UIKit animate the height, while both content panes stay
mounted in a `ZStack` and cross-fade (`opacity` + `blur`) via
`animation(Animation.spring(...), stateIdx)` in the same commit.

The screen header (X, gift) is a native `Stack` header driven by
`Stack.Toolbar.Button`, so the buttons are real UIBarButtonItems (with the
iOS 26 Liquid Glass background) rather than RN views. The app is a single
screen: the root `_layout.tsx` is a `Stack` and the wallet is `index.tsx`.

**Run it**: `npx expo run:ios` — the app opens straight onto the wallet.

**Platforms**: iOS only (`@expo/ui/swift-ui`). Android would need a parallel
`@expo/ui/jetpack-compose` implementation; the screen shows a fallback there.

**Known gaps vs the reference**: system font instead of Family's custom
rounded typeface on the RN backdrop; SF Symbols approximate the original
icons; card heights are fixed constants measured from the video.

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
