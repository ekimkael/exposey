import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * "Available: $500.65" hint shown under the amount, with a credit-card icon.
 *
 * @param amount - Available balance in the account's major unit (dollars).
 */
export function AvailableBalance({ amount }: { amount: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Image source="sf:creditcard" tintColor={colors.textMuted} style={{ width: 18, height: 14 }} />
      <Text style={{ color: colors.textMuted, fontSize: 15, fontFamily: font.regular }}>
        Available: <Text style={{ color: colors.text, fontFamily: font.bold }}>${amount.toFixed(2)}</Text>
      </Text>
    </View>
  );
}
