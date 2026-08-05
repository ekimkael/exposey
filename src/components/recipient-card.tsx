import { Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/animated-pressable';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

export interface Recipient {
  name: string;
  phone: string;
}

export function RecipientCard({ recipient, onChangePress }: { recipient: Recipient; onChangePress?: () => void }) {
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
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 16, fontFamily: font.semibold, color: colors.text }}>{recipient.name}</Text>
          <Text style={{ fontSize: 14, fontFamily: font.regular, color: colors.textMuted }}>{recipient.phone}</Text>
        </View>
        <AnimatedPressable onPress={onChangePress} pressedOpacity={0.5}>
          <Text style={{ fontSize: 14, fontFamily: font.medium, color: colors.accent }}>Change</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}
