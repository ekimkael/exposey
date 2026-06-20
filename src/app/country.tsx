import { Image } from "expo-image";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { CountryRow } from "@/components/country-row";
import { TextField } from "@/components/text-field";
import { COUNTRIES } from "@/lib/countries";
import { useFlow } from "@/lib/flow-context";
import { font } from "@/lib/fonts";
import { useTheme } from "@/theme/theme-context";

/**
 * Country picker — "Select your country", presented as a modal.
 *
 * A search field filters the list; tapping a row updates the shared flow state
 * (which drives the phone prefix). Behaviour of the "Next" action depends on
 * where the modal was opened from (`from` param):
 *
 * - `phone` — opened to change the country mid-form, so it just dismisses back.
 * - otherwise (onboarding / login) — it advances into phone entry.
 */
export default function CountryScreen() {
	const { colors } = useTheme();
	const { country, setCountry, profile, setProfile } = useFlow();
	const { from } = useLocalSearchParams<{ from?: string }>();
	const [query, setQuery] = useState("");

	// `residence` reuses this picker to set the profile's residence country.
	const isResidence = from === "residence";
	const selectedCode = isResidence ? profile.residenceCountry?.code : country.code;

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		return q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
	}, [query]);

	const handleSelect = (item: (typeof COUNTRIES)[number]) =>
		isResidence ? setProfile({ residenceCountry: item }) : setCountry(item);

	const handleNext = () => {
		// Dismiss the modal first; only the onboarding entry continues to phone.
		router.back();
		if (from !== "phone" && !isResidence) router.push("/phone");
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<Stack.Screen
				options={{
					headerLeft: () => (
						<Pressable onPress={() => router.back()} hitSlop={12}>
							<Image source="sf:xmark" tintColor={colors.textMuted} style={{ width: 17, height: 17 }} />
						</Pressable>
					),
					headerRight: () => (
						<Pressable onPress={handleNext} hitSlop={12}>
							<Image source="sf:arrow.right" tintColor={colors.accent} style={{ width: 22, height: 22 }} />
						</Pressable>
					),
				}}
			/>
			<FlatList
				data={results}
				keyExtractor={(item) => item.code}
				contentInsetAdjustmentBehavior="automatic"
				keyboardDismissMode="on-drag"
				contentContainerStyle={{ paddingHorizontal: 24 }}
				ListHeaderComponent={
					<View style={{ gap: 18, paddingBottom: 8 }}>
						<View style={{ gap: 6 }}>
							<Text style={{ fontFamily: font.bold, fontSize: 30, color: colors.text }}>Select your country</Text>
							<Text style={{ fontFamily: font.regular, fontSize: 15, color: colors.textMuted }}>We will provide the most relevant info.</Text>
						</View>
						<TextField icon="magnifyingglass" placeholder="Search" value={query} onChangeText={setQuery} autoCapitalize="none" />
					</View>
				}
				renderItem={({ item }) => <CountryRow country={item} selected={item.code === selectedCode} onPress={() => handleSelect(item)} />}
				ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.divider }} />}
			/>
		</View>
	);
}
