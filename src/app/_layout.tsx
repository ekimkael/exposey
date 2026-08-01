import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { COLORS } from '@/constants/theme';

/**
 * Root layout. The app is a single dark screen with no chrome, so the native
 * header is disabled and the stack background is set to match the screen —
 * without it, a light flash shows through during navigation transitions.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
    </>
  );
}
