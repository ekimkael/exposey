import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/** Root layout: single screen (the login screen), no tab/stack chrome. */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
