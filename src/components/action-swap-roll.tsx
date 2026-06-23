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

const IDLE_LABEL = 'Send';
const LOADING_LABEL = 'Processing…';

/** Duration of the idle label rolling out (upward). */
const EXIT_MS = 180;
/** Duration of the loading content rolling in (from below). */
const ENTRY_MS = 200;
/**
 * Delay before the spinner starts rotating — waits for the swap animation to
 * fully settle so the ring doesn't spin before it's fully visible.
 */
const SPIN_START_DELAY_MS = EXIT_MS + ENTRY_MS;

/**
 * Height of the roll viewport. Must be tall enough to contain the text line
 * height AND the spinner ring diameter without clipping.
 * ponytail: single source for track + slot heights — change here only.
 */
const TRACK_HEIGHT = 24;

interface ActionSwapRollProps {
  /** Called immediately when the user taps (before the animation completes). */
  onPress?: () => void;
  /** When true, the button is dimmed and non-interactive. */
  disabled?: boolean;
}

/**
 * Primary CTA button with a slot-machine "roll" swap animation.
 *
 * **On press:**
 * 1. The idle label ("Send") rolls upward out of view (`FadeOutUp`).
 * 2. The loading row ("Processing…" + spinner ring) rolls up into view from
 *    below (`FadeInUp`), entering after the exit finishes.
 * 3. The spinner ring starts rotating only after the entry animation completes.
 *
 * The animation is clipped inside an `overflow: hidden` track so it never
 * bleeds outside the button pill. The slot uses `position: absolute` with
 * `left: 0 / right: 0` so the content stays centred even during Reanimated's
 * exit animations (which detach the element from the flex flow).
 *
 * **Reset:** the parent screen remounts this component via `key={buttonKey}`
 * when the confirm sheet is dismissed — that is the only way to reset the
 * loading state back to idle.
 */
export function ActionSwapRoll({ onPress, disabled }: ActionSwapRollProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const spinnerRotation = useSharedValue(0);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  const handlePress = () => {
    if (loading || disabled) return;
    setLoading(true);
    spinnerRotation.value = withDelay(
      SPIN_START_DELAY_MS,
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
        {
          backgroundColor: colors.text,
          opacity: loading || disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      {/* overflow:hidden clips the roll to the pill bounds. */}
      <View style={styles.track}>
        {/* Idle state: label rolls out upward on press. */}
        {!loading && (
          <Animated.View exiting={FadeOutUp.duration(EXIT_MS)} style={styles.slot}>
            <Text style={[styles.labelText, { color: colors.background }]}>{IDLE_LABEL}</Text>
          </Animated.View>
        )}

        {/* Loading state: spinner + label roll in from below after exit completes. */}
        {loading && (
          <Animated.View
            entering={FadeInUp.delay(EXIT_MS).duration(ENTRY_MS)}
            style={[styles.slot, styles.loadingRow]}>
            <Animated.View style={[spinnerStyle, styles.spinnerRing, { borderColor: colors.background, borderTopColor: 'transparent' }]} />
            <Text style={[styles.labelText, { color: colors.background }]}>{LOADING_LABEL}</Text>
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
  },
  track: {
    height: TRACK_HEIGHT,
    overflow: 'hidden',
  },
  slot: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  labelText: {
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
