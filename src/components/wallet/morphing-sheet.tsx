import { BottomSheet, Group, Host, ZStack } from "@expo/ui/swift-ui";
import { animation, frame, presentationBackground, presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";

import { DETAIL_SHEET_HEIGHT, MORPH_SPRING, OPTIONS_SHEET_HEIGHT } from "@/constants/animation";
import { FILL_AVAILABLE_WIDTH, WALLET_COLORS } from "@/constants/wallet";
import { useMorphTransition } from "@/hooks/use-morph-transition";

import { DetailPane } from "./detail-pane";
import { OptionsPane } from "./options-pane";

/**
 * The morphing sheet — a native SwiftUI `BottomSheet`. On iOS 26 the system
 * sheet is already a floating inset card, so the sheet *itself* is the
 * morphing card: two fixed detents with a state-driven `selection` make UIKit
 * animate the height, while both panes stay mounted in a `ZStack` and
 * cross-fade (opacity + blur) in the same transaction.
 *
 * All transition state lives in {@link useMorphTransition}; this component
 * only maps that state onto SwiftUI modifiers.
 *
 * @param isPresented - Whether the sheet is open.
 * @param onIsPresentedChange - Called when the sheet opens or closes (e.g. a
 *   swipe-down dismiss), so the parent can keep its state in sync.
 */

interface Props {
	isPresented: boolean;
	onIsPresentedChange: (open: boolean) => void;
}

export function MorphingSheet({ isPresented, onIsPresentedChange }: Props) {
	const { detailKind, isOptions, sheetHeight, morphKey, showDetail, showOptions } = useMorphTransition();

	return (
		<Host style={styles.host}>
			<BottomSheet
				isPresented={isPresented}
				onIsPresentedChange={(open) => {
					onIsPresentedChange(open);
					if (!open) showOptions();
				}}
			>
				<Group
					modifiers={[
						// Two fixed detents; the active one is driven by state, so UIKit
						// animates the height. `onSelectionChange` is required by the
						// modifier but we own the selection, so it is a no-op.
						presentationDetents([{ height: OPTIONS_SHEET_HEIGHT }, { height: DETAIL_SHEET_HEIGHT }], {
							selection: { height: sheetHeight },
							onSelectionChange: () => {},
						}),
						presentationBackground(WALLET_COLORS.sheetSurface),
						presentationDragIndicator("hidden"),
					]}
				>
					<ZStack
						alignment="top"
						modifiers={[
							// Content height mirrors the active detent so the UIKit sheet
							// window and the SwiftUI content stay in lockstep during the
							// morph. `frame` ignores max* once height is set — split calls.
							frame({ height: sheetHeight, alignment: "top" }),
							frame({ maxWidth: FILL_AVAILABLE_WIDTH }),
							animation(MORPH_SPRING, morphKey),
						]}
					>
						<OptionsPane active={isOptions} onSelectDetail={showDetail} onClose={() => onIsPresentedChange(false)} />
						<DetailPane active={!isOptions} kind={detailKind} onClose={showOptions} />
					</ZStack>
				</Group>
			</BottomSheet>
		</Host>
	);
}

const styles = StyleSheet.create({
	// The Host only anchors the SwiftUI sheet; the sheet presents over the
	// whole screen, so the host view itself can be a 1x1 point.
	host: {
		position: "absolute",
		width: 1,
		height: 1,
	},
});
