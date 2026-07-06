import { Stack } from 'expo-router';

import { WALLET_COLORS } from '@/constants/wallet';

/**
 * The native header buttons: a close (X) on the left and a gift on the right.
 * These render as real `UIBarButtonItem`s (with the iOS 26 Liquid Glass pill)
 * because they go through `Stack.Toolbar`, not RN views. Must be rendered
 * inside a screen that is a child of a `Stack` navigator.
 *
 * @param onClose - Called when the X is tapped.
 */
export function WalletHeader({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" tintColor={WALLET_COLORS.closeGlyph} onPress={onClose} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        {/* Decorative in this reproduction — wire up to a real flow as needed. */}
        <Stack.Toolbar.Button icon="gift.fill" tintColor={WALLET_COLORS.cardOrange} onPress={() => {}} />
      </Stack.Toolbar>
    </>
  );
}
