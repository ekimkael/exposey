import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

/** Single-screen app: the Family wallet. Stack hosts its native header. */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          title: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F4F3F6' },
        }}
      />
    </ThemeProvider>
  );
}
