import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';

type Props = {
  title: string;
  count?: number;
  iconColor: string;
};

/** Utensils / fork-knife icon */
function SectionIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill={color} />
      <Path d="M9 3v6M9 9a3 3 0 0 0 3 3M15 3v18M12 9V3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SectionHeader({ title, count, iconColor }: Props) {
  return (
    <View style={s.row}>
      <View style={s.left}>
        <SectionIcon color={iconColor} />
        <Text style={s.title}>
          {title}
          {count != null ? <Text style={s.count}> ({count})</Text> : null}
        </Text>
      </View>
      <Pressable>
        <Text style={s.viewAll}>View all</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenH,
    marginBottom: SPACING.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: FONT.sectionTitle, fontWeight: '700', color: COLORS.text },
  count: { fontSize: FONT.sectionTitle, fontWeight: '400', color: COLORS.textSecondary },
  viewAll: { fontSize: FONT.viewAll, color: COLORS.viewAll, fontWeight: '500' },
});
