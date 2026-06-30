import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import type { ViewToken } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.screenH * 2;

type RestaurantItem = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
};

/** Transparent-to-black gradient layered above the card photo. */
function CardGradient() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="card-grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.4" stopColor="#000" stopOpacity="0" />
          <Stop offset="1"   stopColor="#000" stopOpacity="0.85" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#card-grad)" />
    </Svg>
  );
}

/** Single restaurant card rendered inside the carousel. */
function RestaurantCardItem({ item }: { item: RestaurantItem }) {
  return (
    <View style={s.card}>
      <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <CardGradient />
      <View style={s.overlay}>
        <Text style={s.venueName}>{item.name}</Text>
        <Text style={s.address}>{item.address}</Text>
      </View>
    </View>
  );
}

/**
 * Horizontal paged carousel of restaurant cards with pagination dots.
 * Snap points are computed from `CARD_WIDTH + gap` so each swipe lands
 * exactly on the next card regardless of screen size.
 */
export default function RestaurantCard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const restaurants = TRIP.restaurants as unknown as RestaurantItem[];

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (first != null) setActiveIndex(first.index ?? 0);
  });

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const snapOffsets = restaurants.map((_, i) => i * (CARD_WIDTH + SPACING.md));

  return (
    <View>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RestaurantCardItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        decelerationRate="fast"
        contentContainerStyle={s.list}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
      <View style={s.dotsRow}>
        {restaurants.map((_, i) => (
          <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: SPACING.screenH, gap: SPACING.md },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.iconBg,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  venueName: { fontSize: FONT.cardVenue, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  address:   { fontSize: FONT.cardAddress, color: 'rgba(255,255,255,0.8)' },
  dotsRow:   { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.sm },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.statBorder },
  dotActive: { backgroundColor: COLORS.text, width: 16 },
});
