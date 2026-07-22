import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root layout: gesture + safe-area providers, a light status bar, and a
 * header-less Stack. The dark `contentStyle` background only ever shows as a
 * flash behind the full-screen gradient during navigation.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A1310' } }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
