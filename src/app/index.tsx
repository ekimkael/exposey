/**
 * Main screen — Gatesware "One Week Retreat" trip detail.
 * Composes all trip sections and passes TRIP data down as props.
 * @module app/index
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TripHeader from '@/components/trip-header';
import TripStats from '@/components/trip-stats';
import SectionHeader from '@/components/section-header';
import RestaurantCard from '@/components/restaurant-card';
import CircularAvatarRow from '@/components/circular-avatar-row';
import { KitchenIcon, CarIcon, HomeIcon } from '@/components/section-icons';
import { COLORS, SPACING } from '@/utils/trip-tokens';
import { TRIP } from '@/utils/trip-mock';
import type { StatIconKey } from '@/utils/trip-mock';

// Cast needed because `as const` narrows iconKey to string literals
// but the ICONS map requires the StatIconKey union explicitly.
const stats = TRIP.stats as unknown as { label: string; count: number; iconKey: StatIconKey }[];

export default function TripDetailScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <TripHeader
          brand={TRIP.brand}
          title={TRIP.title}
          subtitle={TRIP.subtitle}
          flagCode={TRIP.flagCode}
          description={TRIP.description}
        />

        <TripStats stats={stats} />

        <SectionHeader
          title="Restaurants"
          count={TRIP.restaurantsTotalCount}
          iconColor={COLORS.brandIcon}
          icon={<KitchenIcon />}
        />
        <View style={s.carouselWrap}>
          <RestaurantCard />
        </View>

        <SectionHeader
          title="Places to Visit"
          count={TRIP.placesTotalCount}
          iconColor={COLORS.brand}
          icon={<CarIcon />}
        />
        <CircularAvatarRow items={TRIP.places} showStatus grid />

        <SectionHeader
          title="Hotels"
          count={TRIP.hotelsTotalCount}
          iconColor={COLORS.hotelIcon}
          icon={<HomeIcon />}
        />
        <CircularAvatarRow items={TRIP.hotels} grid />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.surface },
  scroll:       { flex: 1, backgroundColor: COLORS.surface },
  content:      { paddingBottom: SPACING.xl },
  carouselWrap: { marginBottom: SPACING.lg },
});
