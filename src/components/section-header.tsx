import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS, SPACING, FONT } from "@/utils/trip-tokens";

type Props = {
	title: string;
	count?: number;
	iconColor: string;
	icon?: React.ReactElement;
};

function IconBadge({ color, icon }: { color: string; icon?: React.ReactElement }) {
	return (
		<View style={[s.badge, { backgroundColor: color }]}>
			{icon}
		</View>
	);
}

export default function SectionHeader({ title, count, iconColor, icon }: Props) {
	return (
		<View style={s.row}>
			<View style={s.left}>
				<IconBadge color={iconColor} icon={icon} />
				<Text style={s.title}>
					{title}
					{count != null ? <Text style={s.count}> ({count})</Text> : null}
				</Text>
			</View>
			<Pressable>
				<Text style={s.viewAll}>View all</Text>
			</Pressable>
		</View>
	);
}

const s = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: SPACING.screenH,
		marginBottom: SPACING.sm,
	},
	left: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
	badge: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	title: { fontSize: FONT.sectionTitle, fontWeight: "600", color: COLORS.text },
	count: { fontSize: FONT.sectionTitle, fontWeight: "600", color: COLORS.textSecondary },
	viewAll: { fontSize: FONT.viewAll, color: COLORS.viewAll, fontWeight: "500" },
});
