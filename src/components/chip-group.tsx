import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PressableScale } from '@/components/pressable-scale';
import { font } from '@/lib/fonts';
import { duration, easing } from '@/lib/motion';
import { useTheme } from '@/theme/theme-context';

/** One selectable chip. */
export interface ChipOption<T extends string> {
  label: string;
  value: T;
}

export interface ChipGroupProps<T extends string> {
  /** Options to render. */
  options: ChipOption<T>[];
  /** Currently selected value, or `null`. */
  value: T | null;
  /** Selection handler. */
  onChange: (value: T) => void;
}

/**
 * Wrapping row of rounded, single-select chips. The selected chip fills with the
 * accent; the rest sit on the muted surface. Cross-platform (pure React Native).
 */
export function ChipGroup<T extends string>({ options, value, onChange }: ChipGroupProps<T>) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

/**
 * A single chip. Its fill and label cross-fade between the muted and accent
 * palettes over {@link duration.short} instead of cutting, and it sinks on press
 * via {@link PressableScale}. Colour-only motion, so it stays intact under
 * Reduce Motion.
 */
function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: duration.short, easing: easing.out });
  }, [selected, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surfaceMuted, colors.accent]),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.text, colors.accentText]),
  }));

  return (
    <PressableScale
      onPress={() => {
        if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
        onPress();
      }}
      style={[
        {
          paddingHorizontal: 18,
          height: 44,
          justifyContent: 'center',
          borderRadius: 14,
          borderCurve: 'continuous',
        },
        chipStyle,
      ]}>
      <Animated.Text style={[{ fontFamily: font.semibold, fontSize: 15 }, labelStyle]}>{label}</Animated.Text>
    </PressableScale>
  );
}
