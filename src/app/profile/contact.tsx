import { Image } from 'expo-image';
import { router } from 'expo-router';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/pressable-scale';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { WizardProgress } from '@/components/wizard-progress';
import { useFlow } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * Sign-up wizard, step 2 — contact & residence.
 *
 * Email, country of residence (reuses the country picker modal) and city.
 * "Continue" requires a plausible email, a residence country and a city, then
 * advances to the investor-profile step.
 */
export default function ContactStep() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useFlow();

  const emailValid = /^\S+@\S+\.\S+$/.test(profile.email.trim());
  const canSubmit = emailValid && profile.residenceCountry !== null && profile.city.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 44}
      style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 8 }}>
      <ScrollView
        contentContainerStyle={{ gap: 22, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <WizardProgress step={2} total={3} />

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 28, color: colors.text }}>How can we reach you?</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, color: colors.textMuted }}>
            Contact details and where you live.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextField
            icon="envelope"
            placeholder="Email address"
            value={profile.email}
            onChangeText={(email) => setProfile({ email })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <PressableScale
            onPress={() => router.push('/country?from=residence')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.inputBg,
              borderRadius: 14,
              borderCurve: 'continuous',
              paddingHorizontal: 14,
              height: 56,
            }}>
            {profile.residenceCountry ? (
              <>
                <Text style={{ fontSize: 22 }}>{profile.residenceCountry.flag}</Text>
                <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.text }}>
                  {profile.residenceCountry.name}
                </Text>
              </>
            ) : (
              <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.textSubtle }}>
                Country of residence
              </Text>
            )}
            <Image source="sf:chevron.right" tintColor={colors.textMuted} style={{ width: 14, height: 14 }} />
          </PressableScale>

          <TextField
            icon="building.2"
            placeholder="City"
            value={profile.city}
            onChangeText={(city) => setProfile({ city })}
            autoCapitalize="words"
          />
        </View>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 12, paddingTop: 8 }}>
        <PrimaryButton label="Continue" disabled={!canSubmit} onPress={() => router.push('/profile/investor')} />
      </View>
    </KeyboardAvoidingView>
  );
}
