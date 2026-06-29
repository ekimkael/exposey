import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';

const { width: W } = Dimensions.get('window');
const CARD_W = W - SPACING.screenH * 2;

type Item = typeof TRIP.restaurants[number];

function GradientOverlay() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="card-grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.4" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#card-grad)" />
    </Svg>
  );
}

function Card({ item }: { item: Item }) {
  return (
    <View style={s.card}>
      <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <GradientOverlay />
      <View style={s.overlay}>
        <Text style={s.venueName}>{item.name}</Text>
        <Text style={s.address}>New venue, US/9210</Text>
      </View>
    </View>
  );
}

export default function RestaurantCard() {
  const [active, setActive] = useState(0);
  const items = TRIP.restaurants;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0] != null) setActive(viewableItems[0].index ?? 0);
  });
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View>
      <FlatList
        data={items as unknown as Item[]}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <Card item={item} />}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToOffsets={items.map((_, i) => i * (CARD_W + SPACING.md))}
        decelerationRate="fast"
        contentContainerStyle={s.list}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
      <View style={s.dotsRow}>
        {items.map((_, i) => (
          <View key={i} style={[s.dot, i === active && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: SPACING.screenH, gap: SPACING.md },
  card: {
    width: CARD_W,
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
  address: { fontSize: FONT.cardAddress, color: 'rgba(255,255,255,0.8)' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.statBorder },
  dotActive: { backgroundColor: COLORS.text, width: 16 },
});
