import { Image } from 'expo-image';
import { TextInput, View, type TextInputProps } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

export interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  /** Leading SF Symbol (iOS). Omitted on other platforms where it renders blank. */
  icon?: SFSymbol;
}

/**
 * Rounded text input with an optional leading SF Symbol, matching the login
 * form fields. Wraps a React Native {@link TextInput} so all of its props
 * (`secureTextEntry`, `keyboardType`, `value`, `onChangeText`, …) pass through.
 *
 * The icon uses `expo-image` with an `sf:` source per project convention; it
 * only resolves on iOS.
 */
export function TextField({ icon, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.inputBg,
        borderRadius: 14,
        borderCurve: 'continuous',
        paddingHorizontal: 14,
        height: 52,
      }}>
      {icon ? <Image source={`sf:${icon}`} tintColor={colors.textSubtle} style={{ width: 18, height: 18 }} /> : null}
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.textSubtle}
        style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.text }}
      />
    </View>
  );
}
