import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';

/**
 * Props for SectionHeader.
 */
type Props = {
  /** Section label displayed next to the icon badge (e.g. "Restaurants"). */
  title: string;
  /** Optional total count appended in muted text after the title (e.g. "(14)"). */
  count?: number;
  /** Background color of the circular icon badge. */
  iconColor: string;
  /**
   * Icon rendered inside the badge circle.
   * Pass a sized SVG element (13×13) with fill="#fff".
   * See `src/components/section-icons.tsx` for ready-made options.
   */
  icon?: React.ReactElement;
  /** Called when the user taps "View all". Wire up navigation here. */
  onViewAllPress?: () => void;
};

/** Colored circular badge that wraps a white icon element. */
function IconBadge({ color, icon }: { color: string; icon?: React.ReactElement }) {
  return (
    <View style={[s.badge, { backgroundColor: color }]}>
      {icon}
    </View>
  );
}

export default function SectionHeader({ title, count, iconColor, icon, onViewAllPress }: Props) {
  return (
    <View style={s.row}>
      <View style={s.left}>
        <IconBadge color={iconColor} icon={icon} />
        <Text style={s.title}>
          {title}
          {count != null ? <Text style={s.count}> ({count})</Text> : null}
        </Text>
      </View>
      <Pressable
        onPress={onViewAllPress}
        accessibilityLabel={`View all ${title}`}
        accessibilityRole="button"
      >
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
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FONT.sectionTitle, fontWeight: '600', color: COLORS.text },
  count: { fontSize: FONT.sectionTitle, fontWeight: '600', color: COLORS.textSecondary },
  viewAll: { fontSize: FONT.viewAll, color: COLORS.viewAll, fontWeight: '500' },
});
