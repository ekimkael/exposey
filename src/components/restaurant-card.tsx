import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

export default function RestaurantCard() {
  const { name, address, imageUrl } = TRIP.featuredRestaurant;
  return (
    <View style={s.container}>
      <View style={s.card}>
        <Image source={{ uri: imageUrl }} style={s.image} contentFit="cover" />
        {/* Overlay */}
        <View style={s.overlay}>
          <Text style={s.venueName}>{name}</Text>
          <Text style={s.address}>{address}</Text>
        </View>
      </View>
      {/* Pagination dots */}
      <View style={s.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: SPACING.screenH, marginBottom: SPACING.lg },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 220,
  },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardOverlay,
    padding: SPACING.md,
  },
  venueName: {
    fontSize: FONT.cardVenue,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  address: { fontSize: FONT.cardAddress, color: 'rgba(255,255,255,0.8)' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.statBorder,
  },
  dotActive: { backgroundColor: COLORS.text, width: 16 },
});
