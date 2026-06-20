import { router } from 'expo-router';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/chip-group';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { WizardProgress } from '@/components/wizard-progress';
import { useFlow, type Gender } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** Oldest sensible default shown before the user picks a birth date. */
const DEFAULT_BIRTH_DATE = new Date(2000, 0, 1);

const GENDERS: { label: string; value: Gender }[] = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
];

/**
 * Sign-up wizard, step 1 — identity.
 *
 * First/last name, date of birth (native picker) and gender. "Continue" stays
 * disabled until all are provided, then advances to the contact step.
 */
export default function IdentityStep() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useFlow();

  const canSubmit =
    profile.firstName.trim().length > 0 &&
    profile.lastName.trim().length > 0 &&
    profile.birthDate !== null &&
    profile.gender !== null;

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top + 44}
      style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 8 }}>
      <ScrollView
        contentContainerStyle={{ gap: 22, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <WizardProgress step={1} total={3} />

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 28, color: colors.text }}>Tell us about yourself</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, color: colors.textMuted }}>
            We&apos;ll use this to set up your account.
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextField
            icon="person"
            placeholder="First name"
            value={profile.firstName}
            onChangeText={(firstName) => setProfile({ firstName })}
            autoCapitalize="words"
            autoComplete="given-name"
          />
          <TextField
            icon="person"
            placeholder="Last name"
            value={profile.lastName}
            onChangeText={(lastName) => setProfile({ lastName })}
            autoCapitalize="words"
            autoComplete="family-name"
          />
          <BirthDateRow value={profile.birthDate} onChange={(birthDate) => setProfile({ birthDate })} />
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 16, color: colors.text }}>Gender</Text>
          <ChipGroup options={GENDERS} value={profile.gender} onChange={(gender) => setProfile({ gender })} />
        </View>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 12, paddingTop: 8 }}>
        <PrimaryButton label="Continue" disabled={!canSubmit} onPress={() => router.push('/profile/contact')} />
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * Date-of-birth row: a label on the left and the platform date picker on the
 * right. iOS uses the native SwiftUI `DatePicker`; other platforms get a plain
 * read-out (kept simple — this reproduction targets iOS).
 */
function BirthDateRow({ value, onChange }: { value: Date | null; onChange: (date: Date) => void }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.inputBg,
        borderRadius: 14,
        borderCurve: 'continuous',
        paddingHorizontal: 14,
        height: 56,
      }}>
      <Text style={{ fontFamily: font.medium, fontSize: 16, color: colors.textSubtle }}>Date of birth</Text>
      {process.env.EXPO_OS === 'ios' ? (
        (() => {
          const { Host, DatePicker } = require('@expo/ui/swift-ui');
          const { tint, labelsHidden } = require('@expo/ui/swift-ui/modifiers');
          return (
            <Host matchContents>
              <DatePicker
                title=""
                selection={value ?? DEFAULT_BIRTH_DATE}
                displayedComponents={['date']}
                range={{ end: new Date() }}
                onDateChange={onChange}
                modifiers={[labelsHidden(), tint(colors.accent)]}
              />
            </Host>
          );
        })()
      ) : (
        <Text style={{ fontFamily: font.semibold, fontSize: 16, color: colors.text }}>
          {value ? value.toLocaleDateString() : 'Select'}
        </Text>
      )}
    </View>
  );
}
