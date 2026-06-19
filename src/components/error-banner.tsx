import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * Inline error banner shown above the keypad when the entered amount exceeds
 * the available balance. The caller is responsible for conditional rendering.
 *
 * @param message - Human-readable error text.
 */
export function ErrorBanner({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.dangerSoft,
        borderRadius: 12,
        borderCurve: 'continuous',
      }}>
      <Image source="sf:exclamationmark.circle.fill" tintColor={colors.danger} style={{ width: 16, height: 16 }} />
      <Text style={{ color: colors.danger, fontSize: 13, fontFamily: font.medium }}>{message}</Text>
    </View>
  );
}
