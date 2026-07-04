import { Stack } from 'expo-router';

/** Screen-gray header that blends with the wallet backdrop, no title/shadow. */
export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        title: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#F4F3F6' },
      }}
    />
  );
}
