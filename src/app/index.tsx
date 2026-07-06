import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { MorphingSheet } from '@/components/wallet/morphing-sheet';
import { WalletBackdrop } from '@/components/wallet/wallet-backdrop';
import { WalletHeader } from '@/components/wallet/wallet-header';
import { WALLET_COLORS } from '@/constants/wallet';

/** Shown on non-iOS platforms, where the SwiftUI sheet is unavailable. */
function IosOnlyNotice() {
  return (
    <View style={styles.notice}>
      <Text>This case uses @expo/ui/swift-ui and is iOS-only.</Text>
    </View>
  );
}

/**
 * The single screen of the app: a reproduction of the Family wallet, with a
 * native header, a static backdrop, and the morphing options/detail sheet.
 * The sheet starts open to showcase the morph; the header X and a swipe-down
 * both dismiss it, and any settings row reopens it.
 */
export default function WalletScreen() {
  const [isSheetOpen, setSheetOpen] = useState(true);

  if (Platform.OS !== 'ios') {
    return <IosOnlyNotice />;
  }

  return (
    <View style={styles.screen}>
      <WalletHeader onClose={() => setSheetOpen(false)} />
      <WalletBackdrop onOpenSheet={() => setSheetOpen(true)} />
      <MorphingSheet isPresented={isSheetOpen} onIsPresentedChange={setSheetOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WALLET_COLORS.screenBackground,
  },
  notice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
