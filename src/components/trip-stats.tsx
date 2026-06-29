import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

function HotelIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V12h6v10" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="7" cy="17" r="2" stroke={COLORS.textMuted} strokeWidth={1.8} />
      <Circle cx="17" cy="17" r="2" stroke={COLORS.textMuted} strokeWidth={1.8} />
    </Svg>
  );
}

function RestaurantIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="6" y1="1" x2="6" y2="4" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="10" y1="1" x2="10" y2="4" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="14" y1="1" x2="14" y2="4" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function AttractionIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke={COLORS.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ICONS: Record<string, () => JSX.Element> = {
  hotel: HotelIcon,
  car: CarIcon,
  restaurant: RestaurantIcon,
  attraction: AttractionIcon,
};

export default function TripStats() {
  return (
    <View style={s.container}>
      <Text style={s.heading}>Trip includes</Text>
      <View style={s.row}>
        {TRIP.stats.map((stat) => {
          const Icon = ICONS[stat.iconKey];
          if (!Icon) return null;
          return (
            <View key={stat.iconKey} style={s.cell}>
              <Icon />
              <Text style={s.count}>
                {String(stat.count).padStart(2, '0')}
              </Text>
              <Text style={s.label}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: SPACING.screenH, marginBottom: SPACING.lg },
  heading: {
    fontSize: FONT.sectionTitle,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  cell: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.statBorder,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    gap: 2,
    backgroundColor: COLORS.surface,
  },
  count: { fontSize: FONT.statNumber, fontWeight: '700', color: COLORS.text },
  label: { fontSize: FONT.statLabel, color: COLORS.textMuted },
});
