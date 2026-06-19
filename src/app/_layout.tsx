import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [loaded] = useFonts({
    'OpenRunde-Regular': require('@/assets/fonts/OpenRunde-Regular.otf'),
    'OpenRunde-Medium': require('@/assets/fonts/OpenRunde-Medium.otf'),
    'OpenRunde-Semibold': require('@/assets/fonts/OpenRunde-Semibold.otf'),
    'OpenRunde-Bold': require('@/assets/fonts/OpenRunde-Bold.otf'),
  });

  if (!loaded) return null; // ponytail: splash stays up until fonts load

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: '#fff' } }} />
    </SafeAreaProvider>
  );
}
