import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';

function AppleLogo() {
  if (Platform.OS === 'ios') {
    return <SymbolView name="apple.logo" size={18} tintColor="#111" style={styles.appleIcon} />;
  }
  // Android: Unicode private-use Apple glyph (renders correctly on Roboto fallback)
  return <Text style={styles.appleIconText}></Text>;
}

function RemindoMark() {
  return (
    <View style={styles.markBox}>
      <Text style={styles.markLetter}>R</Text>
    </View>
  );
}

/** CTA buttons matching the Fuse onboarding reference: white pill + frosted secondary. */
export default function OnboardingActions() {
  const onPrimary = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const onSecondary = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={styles.container}>
      {/* White pill — primary CTA */}
      <Pressable
        onPress={onPrimary}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
      >
        <AppleLogo />
        <Text style={styles.primaryText}>Continue with Apple</Text>
      </Pressable>

      {/* Frosted secondary CTA */}
      <Pressable
        onPress={onSecondary}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Restore from iCloud"
      >
        <RemindoMark />
        <Text style={styles.secondaryText}>Restore from iCloud</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 16,
  },

  // ── Primary ──────────────────────────────────────────────
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
  },
  appleIcon: {
    // SymbolView has no additional style needed — size is set via prop
  },
  appleIconText: {
    fontSize: 18,
    color: '#111',
    lineHeight: 22,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    letterSpacing: -0.1,
  },

  // ── Secondary ─────────────────────────────────────────────
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  markBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markLetter: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },

  // ── Shared ────────────────────────────────────────────────
  pressed: {
    opacity: 0.75,
  },
});
