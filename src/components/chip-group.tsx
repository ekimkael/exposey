import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';

import { font } from '@/lib/fonts';
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
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
              onChange(option.value);
            }}
            style={{
              paddingHorizontal: 18,
              height: 44,
              justifyContent: 'center',
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: selected ? colors.accent : colors.surfaceMuted,
            }}>
            <Text
              style={{
                fontFamily: font.semibold,
                fontSize: 15,
                color: selected ? colors.accentText : colors.text,
              }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
