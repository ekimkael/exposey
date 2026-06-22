import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

const LABEL = 'Continue';
const STAGGER_MS = 28;
const LETTER_EXIT_MS = 160;
// Spinner enters once the last letter has fully exited.
const SPINNER_DELAY_MS = LABEL.length * STAGGER_MS + LETTER_EXIT_MS;

/**
 * "Continue" CTA with an action-swap-cascade press animation.
 *
 * On press: each letter of the label exits upward in a left-to-right cascade.
 * Once the last letter clears, a spinner slides in from below and spins
 * continuously to signal that the action is in progress.
 */
export function ActionSwapCascade({ onPress }: { onPress?: () => void }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const rotation = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    if (loading) return;
    setLoading(true);
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.text, opacity: pressed && !loading ? 0.85 : 1 },
      ]}>
      <View style={styles.inner}>
        {!loading &&
          LABEL.split('').map((char, i) => (
            <Animated.Text
              key={i}
              exiting={FadeOutUp.delay(i * STAGGER_MS).duration(LETTER_EXIT_MS)}
              style={[styles.letter, { color: colors.background }]}>
              {char}
            </Animated.Text>
          ))}

        {loading && (
          <Animated.View
            entering={FadeInUp.delay(SPINNER_DELAY_MS).duration(180)}
            style={spinStyle}>
            <View
              style={[
                styles.spinnerRing,
                { borderColor: colors.background, borderTopColor: 'transparent' },
              ]}
            />
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
  letter: {
    fontSize: 16,
    fontFamily: font.semibold,
  },
  spinnerRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
  },
});
