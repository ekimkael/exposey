import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { FIELD_LABEL_ANIM_MS, ONYX_COLORS } from '@/constants/onyx';

interface FloatingLabelFieldProps extends Pick<TextInputProps, 'value' | 'onChangeText' | 'textContentType' | 'autoComplete' | 'keyboardType' | 'returnKeyType' | 'onSubmitEditing'> {
  label: string;
  secureTextEntry?: boolean;
}

export function FloatingLabelField({ label, secureTextEntry, value, ...inputProps }: FloatingLabelFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);
  const active = focused || !!value;
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  function animateTo(toValue: number) {
    Animated.timing(anim, { toValue, duration: FIELD_LABEL_ANIM_MS, useNativeDriver: true }).start();
  }

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Animated.Text
        style={[
          styles.label,
          {
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -11] }) },
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] }) },
            ],
          },
        ]}>
        {label}
      </Animated.Text>
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
          animateTo(1);
        }}
        onBlur={() => {
          setFocused(false);
          animateTo(value ? 1 : 0);
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
    fontSize: 15,
    color: ONYX_COLORS.fieldLabel,
    transformOrigin: 'left',
  },
  input: {
    fontSize: 15,
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
