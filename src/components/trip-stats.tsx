import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

function HotelIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.textMuted}>
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.793 8.707h-3a1.5 1.5 0 0 0 -1.5 1.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5 -1.5v-3a1.5 1.5 0 0 0 -1.5 -1.5" />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.textMuted}>
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M14 5a1 1 0 0 1 .694 .28l.087 .095l3.699 4.625h.52a3 3 0 0 1 2.995 2.824l.005 .176v4a1 1 0 0 1 -1 1h-1.171a3.001 3.001 0 0 1 -5.658 0h-4.342a3.001 3.001 0 0 1 -5.658 0h-1.171a1 1 0 0 1 -1 -1v-6l.007 -.117l.008 -.056l.017 -.078l.012 -.036l.014 -.05l2.014 -5.034a1 1 0 0 1 .928 -.629zm-7 11a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m10 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m-6 -9h-5.324l-1.2 3h6.524zm2.52 0h-.52v3h2.92z" />
    </Svg>
  );
}

function RestaurantIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.textMuted}>
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M18.94 2.002l.1 -.001l.096 .008l.095 .018l.094 .027l.092 .037l.086 .045l.08 .052l.076 .06l.076 .074l.06 .072l.03 .04l.051 .084l.043 .088l.034 .091l.025 .094l.02 .15l.002 18.059a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1v-1h-4a1 1 0 0 1 -1 -.994c-.033 -5.323 .97 -8.482 5.005 -12.434l.317 -.307l.072 -.06l.04 -.03l.084 -.051l.088 -.043l.091 -.034l.094 -.025zm-7.94 .998a1 1 0 0 1 1 1v3a4 4 0 0 1 -3 3.874v10.126a1 1 0 0 1 -2 0v-10.126a4 4 0 0 1 -3 -3.874v-3a1 1 0 1 1 2 0v3a2 2 0 0 0 1 1.732v-4.732a1 1 0 1 1 2 0l.001 4.732a2 2 0 0 0 .999 -1.732v-3a1 1 0 0 1 1 -1" />
    </Svg>
  );
}

function AttractionIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={COLORS.textMuted}>
      <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <Path d="M15 19v1a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-1zm-10 -1c-.89 0 -1.337 -1.077 -.707 -1.707l2.855 -2.857l-1.464 -.487a1 1 0 0 1 -.472 -1.565l.08 -.091l3.019 -3.02l-.758 -.379a1 1 0 0 1 -.343 -1.507l.083 -.094l4 -4a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 -.26 1.601l-.759 .379l3.02 3.02a1 1 0 0 1 -.279 1.61l-.113 .046l-1.465 .487l2.856 2.857c.603 .602 .22 1.614 -.593 1.701l-.114 .006z" />
    </Svg>
  );
}

const ICONS: Record<string, () => React.ReactElement> = {
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
