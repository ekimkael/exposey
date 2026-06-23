import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/theme/theme-context';

/**
 * Root layout: registers Open Runde fonts and wires up theming.
 *
 * Rendering is held back (`return null`) until the fonts finish loading, which
 * keeps the splash screen up and avoids a flash of the system font. See
 * `lib/fonts.ts` for the family names these keys map to.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'OpenRunde-Regular': require('@/assets/fonts/OpenRunde-Regular.otf'),
    'OpenRunde-Medium': require('@/assets/fonts/OpenRunde-Medium.otf'),
    'OpenRunde-Semibold': require('@/assets/fonts/OpenRunde-Semibold.otf'),
    'OpenRunde-Bold': require('@/assets/fonts/OpenRunde-Bold.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedStack />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

/**
 * The navigation stack, themed from the active palette. Kept separate so it can
 * consume {@link useTheme} (which must run inside {@link ThemeProvider}).
 */
function ThemedStack() {
  const { colors, scheme } = useTheme();

  return (
    <NavigationThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
        }}>
        {/*
         * Biometric confirm sheet — native iOS form sheet at ~45 % height.
         * Detents: [0.45, 1.0] — confirm state fits at 0.45; user can pull
         * to full screen if needed. headerShown:false because the screen
         * provides its own layout with safe-area insets.
         */}
        <Stack.Screen
          name="confirm"
          options={{
            presentation: 'formSheet',
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.45, 1.0],
            headerShown: false,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}
