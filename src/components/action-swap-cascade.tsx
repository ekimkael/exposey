import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

const LABEL = 'Continue';
const LOADING_TEXT = 'Sending...';
const STAGGER_MS = 28;
const LETTER_EXIT_MS = 160;
// New content enters once the last letter has fully exited.
const SWAP_DELAY_MS = LABEL.length * STAGGER_MS + LETTER_EXIT_MS;
const ENTRY_DURATION_MS = 220;
// Spin starts only after the new content has fully settled.
const SPIN_START_MS = SWAP_DELAY_MS + ENTRY_DURATION_MS;

/**
 * "Continue" CTA with an action-swap-cascade press animation.
 *
 * On press: each letter exits upward in a left-to-right cascade. Once
 * the last letter clears, [icon + "Sending..."] slides in as a unit.
 * Only after that entry animation completes does the icon start spinning.
 */
export function ActionSwapCascade({ onPress, disabled }: { onPress?: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const rotation = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    if (loading || disabled) return;
    setLoading(true);
    // Spin starts only after the swap + entry animation has completed.
    rotation.value = withDelay(
      SPIN_START_MS,
      withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false),
    );
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.text, opacity: loading || disabled ? 0.45 : pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.inner}>
        {/* Idle state: letters exit one by one upward */}
        {!loading &&
          LABEL.split('').map((char, i) => (
            <Animated.Text
              key={i}
              exiting={FadeOutUp.delay(i * STAGGER_MS).duration(LETTER_EXIT_MS)}
              style={[styles.letter, { color: colors.background }]}>
              {char}
            </Animated.Text>
          ))}

        {/* Loading state: icon + text enter as one unit, then icon spins */}
        {loading && (
          <Animated.View
            entering={FadeInUp.delay(SWAP_DELAY_MS).duration(ENTRY_DURATION_MS)}
            style={styles.loadingRow}>
            <Animated.View style={spinStyle}>
              <View
                style={[
                  styles.spinnerRing,
                  { borderColor: colors.background, borderTopColor: 'transparent' },
                ]}
              />
            </Animated.View>
            <Text style={[styles.letter, { color: colors.background }]}>{LOADING_TEXT}</Text>
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingHorizontal: 48,
    paddingVertical: 16,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  letter: {
    fontSize: 16,
    fontFamily: font.semibold,
  },
  spinnerRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
  },
});
