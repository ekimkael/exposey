import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

/**
 * Root layout: registers the Open Runde font weights and defines the
 * navigation stack.
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
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.surface } }} />
    </SafeAreaProvider>
  );
}
