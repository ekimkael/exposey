import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Root layout. The Featured screen draws its own header, so the native stack
 * header is hidden and each screen owns its safe-area handling.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: '#FFFFFF' } }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
