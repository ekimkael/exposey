import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { OnboardingSlide } from "@/utils/data";
import { COLORS, FONT_SIZE } from "@/utils/tokens";

export interface SlideHeadingProps {
	/** Changing this key unmounts the old text (FadeOut) and mounts the new one (FadeIn). */
	page: number;
	slide: OnboardingSlide;
}

/** Title + subtitle block with FadeIn on enter and FadeOut on exit. */
export function SlideHeading({ page, slide }: SlideHeadingProps) {
	return (
		<View style={styles.clip}>
			<Animated.View key={page} entering={FadeIn.duration(800)} exiting={FadeOut.duration(350)} style={styles.content}>
				<Text style={styles.title}>{slide.title}</Text>
				<Text style={styles.subtitle}>{slide.subtitle}</Text>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	clip: { overflow: "hidden" },
	content: { paddingHorizontal: 28, gap: 10 },
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.heading,
		fontWeight: "700",
		letterSpacing: -0.6,
	},
	subtitle: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.subtitle,
		lineHeight: 26,
	},
});
