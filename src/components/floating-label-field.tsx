import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ONYX_COLORS } from '@/constants/theme';
import { useFloatingLabel } from '@/hooks/use-floating-label';

interface FloatingLabelFieldProps
  extends Pick<
    TextInputProps,
    'value' | 'onChangeText' | 'textContentType' | 'autoComplete' | 'keyboardType' | 'returnKeyType' | 'onSubmitEditing'
  > {
  label: string;
  secureTextEntry?: boolean;
}

/**
 * Text field with an animated floating label (see {@link useFloatingLabel})
 * and, for `secureTextEntry` fields, a native SF Symbol eye toggle.
 */
export function FloatingLabelField({ label, secureTextEntry, value, ...inputProps }: FloatingLabelFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);
  const { labelStyle, onFocus, onBlur } = useFloatingLabel(!!value);

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <TextInput
        style={styles.input}
        value={value}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={hidden}
        placeholderTextColor="transparent"
        cursorColor={ONYX_COLORS.fieldText}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        {...inputProps}
      />
      {secureTextEntry && (
        <Pressable hitSlop={12} onPress={() => setHidden((v) => !v)} style={styles.eye}>
          <SymbolView name={hidden ? 'eye' : 'eye.slash'} size={18} tintColor={ONYX_COLORS.fieldLabel} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 58,
    borderRadius: 14,
    backgroundColor: ONYX_COLORS.fieldBackground,
    borderWidth: 1,
    borderColor: ONYX_COLORS.fieldBorder,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fieldFocused: {
    borderColor: ONYX_COLORS.fieldBorderFocused,
  },
  label: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    color: ONYX_COLORS.fieldLabel,
    transformOrigin: 'left',
  },
  input: {
    fontSize: 16,
    color: ONYX_COLORS.fieldText,
    paddingTop: 10,
    paddingRight: 28,
  },
  eye: {
    position: 'absolute',
    right: 16,
    top: 20,
  },
});
