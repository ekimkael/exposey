# rn.ui — Expo UI Showcase

A collection of native UI patterns built with Expo 56 and React Native 0.85 (New Architecture).

## Screens

### Onboarding carousel (`/onboarding`)

A 4-slide fullscreen carousel reproducing an iOS onboarding pattern. Navigate to it via `router.push('/onboarding')` or directly in dev tools.

**Key techniques:**
- `experimental_backgroundImage` CSS gradient (New Architecture only) for the teal-to-aqua background
- `Animated.ScrollView` with `pagingEnabled` + `useAnimatedScrollHandler` from Reanimated v4
- Animated pill-shaped dot indicators driven by scroll position via `interpolate`
- `SymbolView` (expo-symbols) for SF Symbols inside the phone mockup and badges
- Haptic feedback on page transitions (`expo-haptics`)
- iOS lock-screen phone mockup with stacked translucent cards — pure RN Views, no images

**Route structure:**
```
src/app/
  _layout.tsx          Root Stack (headerShown: false for all screens)
  (tabs)/
    _layout.tsx        NativeTabs — Home + Explore
    index.tsx
    explore.tsx
  onboarding/
    index.tsx          Carousel screen
```

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
