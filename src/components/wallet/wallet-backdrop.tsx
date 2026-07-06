import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WALLET_COLORS } from '@/constants/wallet';

/** The settings rows below the wallet card, each opening the options sheet. */
const SETTINGS_ROWS: readonly { icon: SFSymbol; label: string }[] = [
  { icon: 'square.grid.2x2', label: 'Connections' },
  { icon: 'checkmark.shield', label: 'Backup' },
  { icon: 'checkmark.seal', label: 'Approvals' },
];

/**
 * The static screen behind the sheet: the orange wallet card plus the list of
 * settings rows. Tapping any row opens the morphing sheet. This is plain React
 * Native (not SwiftUI) because it never animates.
 *
 * @param onOpenSheet - Called when any settings row is tapped.
 */
export function WalletBackdrop({ onOpenSheet }: { onOpenSheet: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <SymbolView name="heart.fill" size={26} tintColor="#FFFFFF" />
          <View style={styles.copyAddress}>
            <Text style={styles.copyAddressText}>Copy Address</Text>
            <SymbolView name="doc.on.doc" size={12} tintColor="rgba(255,255,255,0.85)" />
          </View>
        </View>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardName}>BFF</Text>
            <Text style={styles.cardBalance}>0.02 ETH</Text>
          </View>
          <View style={styles.customizePill}>
            <Text style={styles.customizeText}>Customize</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsList}>
        {SETTINGS_ROWS.map(({ icon, label }) => (
          <Pressable key={label} style={styles.settingsRow} onPress={onOpenSheet}>
            <SymbolView name={icon} size={18} tintColor="#3A3A3C" />
            <Text style={styles.settingsLabel}>{label}</Text>
            <View style={styles.rowSpacer} />
            <SymbolView name="chevron.right" size={13} tintColor="#C7C7CC" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WALLET_COLORS.screenBackground,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: WALLET_COLORS.cardOrange,
    padding: 16,
    height: 168,
    justifyContent: 'space-between',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  copyAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  copyAddressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cardBalance: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  customizePill: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  customizeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingsList: {
    marginTop: 28,
    paddingHorizontal: 24,
    gap: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  rowSpacer: {
    flex: 1,
  },
});
