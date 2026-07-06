import { useCallback, useState } from 'react';

import { DETAIL_SHEET_HEIGHT, OPTIONS_SHEET_HEIGHT } from '@/constants/animation';
import type { DetailKind, SheetView } from '@/constants/wallet';

/**
 * Animation key per pane. Feeding a value that changes on every transition to
 * the SwiftUI `animation` modifier is what triggers the morph, so each view
 * maps to a distinct, stable number.
 */
const MORPH_KEY: Record<SheetView, number> = {
  options: 0,
  privateKey: 1,
  recoveryPhrase: 2,
};

/** State and derived values for the morphing sheet; see {@link useMorphTransition}. */
export interface MorphTransition {
  /** Which pane is currently shown. */
  activeView: SheetView;
  /** The last detail pane opened; stays set while fading back to Options. */
  detailKind: DetailKind;
  /** Whether the Options pane is the active one. */
  isOptions: boolean;
  /** Height (points) of the detent for the active pane. */
  sheetHeight: number;
  /** Value handed to the `animation` modifier; changing it runs the morph. */
  morphKey: number;
  /** Switch to a detail pane (Private Key / Recovery Phrase). */
  showDetail: (kind: DetailKind) => void;
  /** Return to the Options pane. */
  showOptions: () => void;
}

/**
 * Owns the morphing sheet's transition state so the sheet component only
 * renders. A single `activeView` drives both the native detent selection
 * (height) and the pane cross-fade (opacity/blur), keeping the height spring
 * and the fade in one SwiftUI transaction.
 *
 * `detailKind` is tracked separately from `activeView` so the outgoing detail
 * copy stays mounted — and unchanged — while the sheet fades back to Options.
 *
 * @returns The current {@link MorphTransition} state and transition handlers.
 */
export function useMorphTransition(): MorphTransition {
  const [activeView, setActiveView] = useState<SheetView>('options');
  const [detailKind, setDetailKind] = useState<DetailKind>('privateKey');

  const showDetail = useCallback((kind: DetailKind) => {
    setDetailKind(kind);
    setActiveView(kind);
  }, []);

  const showOptions = useCallback(() => {
    setActiveView('options');
  }, []);

  const isOptions = activeView === 'options';

  return {
    activeView,
    detailKind,
    isOptions,
    sheetHeight: isOptions ? OPTIONS_SHEET_HEIGHT : DETAIL_SHEET_HEIGHT,
    morphKey: MORPH_KEY[activeView],
    showDetail,
    showOptions,
  };
}
