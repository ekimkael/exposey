import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { SparkleButton } from './sparkle-button';

function AppleLogo() {
  if (Platform.OS === 'ios') {
    return <SymbolView name="apple.logo" size={24} tintColor="#111" />;
  }
  return <Text style={styles.appleIconText}></Text>;
}

function RemindoMark() {
  return (
    <View style={styles.markBox}>
      <Text style={styles.markLetter}>R</Text>
    </View>
  );
}

/** CTA buttons: white pill primary + sparkle-border secondary. */
export default function OnboardingActions() {
  const onPrimary = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  return (
    <View style={styles.container}>
      {/* White pill — primary */}
      <Pressable
        onPress={onPrimary}
        style={({ pressed }) => [styles.primary, pressed && { opacity: 0.75 }]}
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
      >
        <AppleLogo />
        <Text style={styles.primaryText}>Continue with Apple</Text>
      </Pressable>

      {/* Sparkle border — secondary */}
      <SparkleButton
        label="Restore from iCloud"
        leftSlot={<RemindoMark />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 16,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
  },
  appleIconText: {
    fontSize: 24,
    color: '#111',
    lineHeight: 28,
  },
  primaryText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    letterSpacing: -0.1,
  },
  markBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
});
