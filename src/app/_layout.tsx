import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FlowProvider } from '@/lib/flow-context';
import { ThemeProvider, useTheme } from '@/theme/theme-context';

/**
 * Root layout: registers Open Runde fonts and wires up theming + flow state.
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
      <FlowProvider>
        <SafeAreaProvider>
          <ThemedStack />
        </SafeAreaProvider>
      </FlowProvider>
    </ThemeProvider>
  );
}

/**
 * The navigation stack, themed from the active palette. Kept separate so it can
 * consume {@link useTheme} (which must run inside {@link ThemeProvider}).
 *
 * Inner screens share a minimal header: transparent shadow, no centre title, a
 * plain "Back" button — the big heading lives in each screen's body. The intro
 * (`index`) is full-bleed and hides the header entirely.
 */
function ThemedStack() {
  const { colors, scheme } = useTheme();

  return (
    <NavigationThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          title: '',
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerBackButtonDisplayMode: 'generic',
          headerStyle: { backgroundColor: colors.background },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen
          name="index"
          options={{
            // Seamless header (no shadow, background-coloured): holds the logo
            // on the left and the theme toolbar menu on the right.
            headerLeft: () => (
              <Image source={require('@/assets/images/logo-octagon.svg')} style={{ width: 34, height: 34 }} />
            ),
          }}
        />
        <Stack.Screen name="country" options={{ presentation: 'modal' }} />
        <Stack.Screen name="home" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
