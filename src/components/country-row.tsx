import { Pressable, Text, View } from 'react-native';

import type { Country } from '@/lib/countries';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

export interface CountryRowProps {
  /** Country to render. */
  country: Country;
  /** Whether this row is the current selection. */
  selected: boolean;
  /** Selection handler. */
  onPress: () => void;
}

/**
 * Single row in the country picker: flag, name, and a trailing radio that
 * fills with the lime `accent` when selected.
 */
export function CountryRow({ country, selected, onPress }: CountryRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        opacity: pressed ? 0.6 : 1,
      })}>
      <Text style={{ fontSize: 24 }}>{country.flag}</Text>
      <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 17, color: colors.text }}>{country.name}</Text>
      <Radio selected={selected} />
    </Pressable>
  );
}

/** Trailing radio indicator: hollow ring, or filled accent dot when selected. */
function Radio({ selected }: { selected: boolean }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: selected ? 0 : 1.5,
        borderColor: colors.divider,
        backgroundColor: selected ? colors.accent : 'transparent',
      }}>
      {selected ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentText }} /> : null}
    </View>
  );
}
