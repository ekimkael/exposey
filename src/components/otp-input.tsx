import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { font } from '@/lib/fonts';
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
}

/**
 * Segmented one-time-code input. A single hidden {@link TextInput} captures the
 * keyboard while `length` cells render the digits — tapping anywhere refocuses
 * it. On `error` the row shakes once (with a haptic on iOS) and the cells turn
 * red, mirroring the "Incorrect verification code" state.
 */
export function OtpInput({ value, onChangeText, length = 4, error = false }: OtpInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const shake = useSharedValue(0);

  // Shake + haptic whenever we enter the error state.
  useEffect(() => {
    if (!error) return;
    if (process.env.EXPO_OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, shake]);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const handleChange = (text: string) => onChangeText(text.replace(/\D/g, '').slice(0, length));

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[{ flexDirection: 'row', gap: 8 }, rowStyle]}>
        {Array.from({ length }).map((_, i) => {
          const char = value[i] ?? '';
          const filled = char !== '';
          return (
            <View
              key={i}
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
                style={{
                  fontFamily: font.semibold,
                  fontSize: 20,
                  fontVariant: ['tabular-nums'],
                  color: error ? colors.danger : colors.text,
                }}>
                {char}
              </Animated.Text>
            </View>
          );
        })}
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
