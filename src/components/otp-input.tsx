import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { font } from '@/lib/fonts';
import { duration, easing, spring } from '@/lib/motion';
import { useTheme } from '@/theme/theme-context';

export interface OtpInputProps {
  /** Current code (digits only). */
  value: string;
  /** Called with the sanitised digits on every change. */
  onChangeText: (value: string) => void;
  /** Number of cells. */
  length?: number;
  /** Renders cells in the error palette and shakes the row when it turns true. */
  error?: boolean;
  /**
   * Failed-submit counter. Increment it on every rejected attempt so the shake
   * replays even when `error` was already true — otherwise re-submitting the
   * same wrong code gives the user no feedback at all.
   */
  attempt?: number;
}

/**
 * Segmented one-time-code input. A single hidden {@link TextInput} captures the
 * keyboard while `length` cells render the digits — tapping anywhere refocuses
 * it. On `error` the row shakes once (with a haptic on iOS) and the cells turn
 * red, mirroring the "Incorrect verification code" state.
 */
export function OtpInput({ value, onChangeText, length = 4, error = false, attempt = 0 }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const shake = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  // Re-runs on every `attempt`, not just when `error` flips, so a repeated wrong
  // submit still gives feedback. The error haptic always fires; the shake is
  // skipped under Reduce Motion so the feedback survives without the movement.
  useEffect(() => {
    if (!error) return;
    if (process.env.EXPO_OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (reduceMotion) return;
    shake.value = withSequence(
      withTiming(-8, { duration: 50, easing: easing.out }),
      withTiming(8, { duration: 50, easing: easing.out }),
      withTiming(-6, { duration: 50, easing: easing.out }),
      withTiming(6, { duration: 50, easing: easing.out }),
      withSpring(0, spring.press),
    );
  }, [error, attempt, reduceMotion, shake]);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const handleChange = (text: string) => onChangeText(text.replace(/\D/g, '').slice(0, length));

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[{ flexDirection: 'row', gap: 8 }, rowStyle]}>
        {Array.from({ length }).map((_, i) => (
          <Cell key={i} char={value[i] ?? ''} error={error} />
        ))}
      </Animated.View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus
        // Visually hidden but still focusable / typeable.
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
    </Pressable>
  );
}

/**
 * One OTP slot. The glyph pops in when a digit lands and fades out fast on
 * delete; the cell itself never moves, so it stays still inside the row's error
 * shake. The scale is dropped under Reduce Motion, leaving the fade.
 */
function Cell({ char, error }: { char: string; error: boolean }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const filled = char !== '';
  const landed = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    landed.value = filled ? 1 : 0;
  }, [filled, landed]);

  const glyphStyle = useAnimatedStyle(() => ({
    opacity: withTiming(landed.value, {
      duration: landed.value === 1 ? duration.press : 100,
      easing: easing.out,
    }),
    transform: [{ scale: reduceMotion ? 1 : withSpring(0.9 + landed.value * 0.1, spring.press) }],
  }));

  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        borderRadius: 14,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: error ? colors.dangerSoft : colors.inputBg,
        borderWidth: filled || error ? 1.5 : 0,
        borderColor: error ? colors.danger : colors.accent,
      }}>
      <Animated.Text
        style={[
          {
            fontFamily: font.semibold,
            fontSize: 20,
            fontVariant: ['tabular-nums'],
            color: error ? colors.danger : colors.text,
          },
          glyphStyle,
        ]}>
        {char}
      </Animated.Text>
    </View>
  );
}
