/**
 * @file _layout.tsx
 * @description Root navigator. Uses a `Stack` (required for shared-element
 * transitions) with the header hidden globally; individual screens opt in
 * to a header via `<Stack.Screen options={{ headerShown: true }} />`.
 */
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Blue shrink-fade overlay that plays once on cold launch */}
      <AnimatedSplashOverlay />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="beach" />
        <Stack.Screen name="explore" />
      </Stack>
    </ThemeProvider>
  );
}
