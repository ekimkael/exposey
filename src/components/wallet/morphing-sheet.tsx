import { BottomSheet, Group, Host, ZStack } from '@expo/ui/swift-ui';
import {
  animation,
  frame,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  DETAIL_SHEET_HEIGHT,
  FILL_AVAILABLE_WIDTH,
  MORPH_SPRING,
  OPTIONS_SHEET_HEIGHT,
  WALLET_COLORS,
  type DetailKind,
  type SheetView,
} from '@/constants/wallet';

import { DetailPane } from './detail-pane';
import { OptionsPane } from './options-pane';

/** Maps a {@link SheetView} to the animation key that drives the morph. */
const MORPH_INDEX: Record<SheetView, number> = {
  options: 0,
  privateKey: 1,
  recoveryPhrase: 2,
};

/**
 * The morphing sheet — a native SwiftUI `BottomSheet`. On iOS 26 the system
 * sheet is already a floating inset card, so the sheet *itself* is the
 * morphing card: two fixed detents with a state-driven `selection` make UIKit
 * animate the height, while both panes stay mounted in a `ZStack` and
 * cross-fade (opacity + blur) in the same transaction, keyed on the active
 * view's {@link MORPH_INDEX}.
 *
 * @param isPresented - Whether the sheet is open.
 * @param onIsPresentedChange - Called when the sheet opens or closes (e.g. a
 *   swipe-down dismiss), so the parent can keep its state in sync.
 */
export function MorphingSheet({
  isPresented,
  onIsPresentedChange,
}: {
  isPresented: boolean;
  onIsPresentedChange: (open: boolean) => void;
}) {
  const [activeView, setActiveView] = useState<SheetView>('options');

  // The last detail pane stays rendered while fading back to Options, so its
  // text doesn't swap mid-transition. It only ever tracks a detail view.
  const [detailKind, setDetailKind] = useState<DetailKind>('privateKey');

  const showDetail = (kind: DetailKind) => {
    setDetailKind(kind);
    setActiveView(kind);
  };

  const isOptions = activeView === 'options';
  const sheetHeight = isOptions ? OPTIONS_SHEET_HEIGHT : DETAIL_SHEET_HEIGHT;

  return (
    <Host style={styles.host}>
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={open => {
          onIsPresentedChange(open);
          if (!open) setActiveView('options');
        }}>
        <Group
          modifiers={[
            // Two fixed detents; the active one is driven by `activeView`, so
            // UIKit animates the height. `onSelectionChange` is required by
            // the modifier but we own the selection, so it is a no-op.
            presentationDetents(
              [{ height: OPTIONS_SHEET_HEIGHT }, { height: DETAIL_SHEET_HEIGHT }],
              {
                selection: { height: sheetHeight },
                onSelectionChange: () => {},
              }
            ),
            presentationBackground(WALLET_COLORS.sheetSurface),
            presentationDragIndicator('hidden'),
          ]}>
          <ZStack
            alignment="top"
            modifiers={[
              // Content height mirrors the active detent so the UIKit sheet
              // window and the SwiftUI content stay in lockstep during the
              // morph. `frame` ignores max* once height is set — split calls.
              frame({ height: sheetHeight, alignment: 'top' }),
              frame({ maxWidth: FILL_AVAILABLE_WIDTH }),
              animation(MORPH_SPRING, MORPH_INDEX[activeView]),
            ]}>
            <OptionsPane
              active={isOptions}
              onSelectDetail={showDetail}
              onClose={() => onIsPresentedChange(false)}
            />
            <DetailPane
              active={!isOptions}
              kind={detailKind}
              onClose={() => setActiveView('options')}
            />
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
    position: 'absolute',
    width: 1,
    height: 1,
  },
});
