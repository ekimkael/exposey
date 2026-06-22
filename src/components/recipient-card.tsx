import { Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

export interface Recipient {
  /** Full name of the person receiving the transfer. */
  name: string;
  /** Phone number associated with the recipient. */
  phone: string;
}

/**
 * Read-only summary of the transfer recipient.
 *
 * Renders as a light-grey block containing an inner white card with the
 * recipient's name and phone number.
 */
export function RecipientCard({ recipient }: { recipient: Recipient }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 16,
        padding: 8,
        backgroundColor: colors.surfaceMuted,
        borderRadius: 20,
        borderCurve: 'continuous',
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 14,
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderCurve: 'continuous',
        }}>
        <Text style={{ fontSize: 16, fontFamily: font.semibold, color: colors.text }}>{recipient.name}</Text>
        <Text selectable style={{ fontSize: 15, fontFamily: font.regular, color: colors.textMuted, fontVariant: ['tabular-nums'] }}>
          {recipient.phone}
        </Text>
      </View>
    </View>
  );
}
