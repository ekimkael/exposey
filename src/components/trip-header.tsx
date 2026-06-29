import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

function MapPin() {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12">
      <Path
        d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5 1.5 1.5 0 0 1 5 6.5z"
        fill={COLORS.brand}
      />
    </Svg>
  );
}

export default function TripHeader() {
  return (
    <View style={s.container}>
      {/* Brand row — pin + brand name only */}
      <View style={s.brandRow}>
        <MapPin />
        <Text style={s.brand}>{TRIP.brand}</Text>
      </View>

      {/* Title + flag badge on same row */}
      <View style={s.titleRow}>
        <View style={s.titleBlock}>
          <Text style={s.title}>{TRIP.title}</Text>
          <Text style={s.subtitle}>{TRIP.subtitle}</Text>
        </View>
        <View style={s.flagBadge}>
          <Image
            source={require('../../assets/images/flag-argentina.svg')}
            style={s.flagImage}
            contentFit="contain"
          />
          <Text style={s.flagCode}>{TRIP.flagCode}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={s.description}>{TRIP.description}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: SPACING.screenH, paddingTop: SPACING.lg },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  brand: {
    fontSize: FONT.brand,
    fontWeight: '700',
    color: COLORS.brand,
    letterSpacing: FONT.brandLetterSpacing,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleBlock: { flex: 1, marginRight: SPACING.sm },
  title: {
    fontSize: FONT.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.tight,
  },
  subtitle: {
    fontSize: FONT.subtitle,
    color: COLORS.textSecondary,
  },
  flagBadge: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  flagImage: {
    width: 36,
    height: 24,
    borderRadius: 3,
  },
  flagCode: { fontSize: FONT.flagLabel, fontWeight: '600', color: COLORS.text },
  description: {
    fontSize: FONT.body,
    lineHeight: FONT.bodyLineHeight,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
});
