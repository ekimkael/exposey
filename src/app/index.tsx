/**
 * Gatesware trip detail screen — One Week Retreat at Supra Falls.
 * @module app/index
 */
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TripHeader from "@/components/trip-header";
import TripStats from "@/components/trip-stats";
import SectionHeader from "@/components/section-header";
import RestaurantCard from "@/components/restaurant-card";
import CircularAvatarRow from "@/components/circular-avatar-row";
import { COLORS, SPACING } from "@/utils/trip-tokens";
import { TRIP } from "@/utils/trip-mock";

export default function TripDetailScreen() {
	return (
		<SafeAreaView style={s.safe} edges={["top"]}>
			<ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
				{/* Header: brand, title, flag, description */}
				<TripHeader />

				{/* Stats: hotels, cars, restaurants, attractions */}
				<TripStats />

				{/* Version A: Restaurants — large photo card */}
				<SectionHeader title="Restaurants" iconColor={COLORS.brandIcon} />
				<View style={s.cardWrap}>
					<RestaurantCard />
				</View>

				{/* Version B: Places To Visit */}
				<SectionHeader title="Places To Visit" count={TRIP.places.length + 10} iconColor={COLORS.brand} />
				<CircularAvatarRow items={TRIP.places} showStatus />

				{/* Version B: Hotels */}
				<SectionHeader title="Hotels" count={TRIP.hotels.length + 3} iconColor={COLORS.hotelIcon} />
				<CircularAvatarRow items={TRIP.hotels} />
			</ScrollView>
		</SafeAreaView>
	);
}

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: COLORS.surface },
	scroll: { flex: 1, backgroundColor: COLORS.surface },
	content: { paddingBottom: SPACING.xl },
	cardWrap: { marginBottom: SPACING.lg },
});
