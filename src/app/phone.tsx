import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { useFlow } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * Phone entry — "Enter your phone number".
 *
 * A grouped block holds the selected-country pill (tap to re-open the picker)
 * over the dial-code prefix + national number input. "Next" stays disabled
 * until a number is typed, then advances to code verification.
 */
export default function PhoneScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { country, phone, setPhone } = useFlow();

  const canSubmit = phone.trim().length >= 4;

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 44}
      style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 8 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 30, color: colors.text, marginBottom: 24 }}>
        Enter your phone number
      </Text>

      <View style={{ backgroundColor: colors.inputBg, borderRadius: 16, borderCurve: 'continuous', overflow: 'hidden' }}>
        <Pressable
          onPress={() => router.push('/country?from=phone')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
            height: 56,
            opacity: pressed ? 0.6 : 1,
          })}>
          <Text style={{ fontSize: 22 }}>{country.flag}</Text>
          <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.text }}>{country.name}</Text>
          <Image source="sf:arrow.right" tintColor={colors.textMuted} style={{ width: 16, height: 16 }} />
        </Pressable>

        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: 16 }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, height: 56 }}>
          <Text style={{ fontFamily: font.medium, fontSize: 16, color: colors.textMuted }}>{country.dialCode}</Text>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^\d]/g, ''))}
            placeholder="Add your number"
            placeholderTextColor={colors.textSubtle}
            keyboardType="phone-pad"
            autoFocus
            style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.text }}
          />
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ paddingBottom: insets.bottom + 12 }}>
        <PrimaryButton label="Next" disabled={!canSubmit} onPress={() => router.push('/verify')} />
      </View>
    </KeyboardAvoidingView>
  );
}
