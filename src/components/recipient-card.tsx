import { Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { colors } from '@/theme/tokens';

export interface Recipient {
  /** Full name of the person receiving the transfer. */
  name: string;
  /** Bank / institution the account belongs to. */
  bank: string;
  /** Destination account number. */
  accountNumber: string;
}

/**
 * Read-only summary of the transfer recipient.
 *
 * Renders as a light-grey block containing column labels and an inner white
 * card with the recipient's details.
 */
export function RecipientCard({ recipient }: { recipient: Recipient }) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 16,
        padding: 8,
        gap: 8,
        backgroundColor: colors.surfaceMuted,
        borderRadius: 20,
        borderCurve: 'continuous',
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: font.regular }}>Recipient Name/Bank</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: font.regular }}>Bank Account</Text>
      </View>

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
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 16, fontFamily: font.semibold, color: colors.text }}>{recipient.name}</Text>
          <Text style={{ fontSize: 14, fontFamily: font.regular, color: colors.textMuted }}>{recipient.bank}</Text>
        </View>
        <Text selectable style={{ fontSize: 15, fontFamily: font.regular, color: colors.textSubtle, fontVariant: ['tabular-nums'] }}>
          {recipient.accountNumber}
        </Text>
      </View>
    </View>
  );
}
