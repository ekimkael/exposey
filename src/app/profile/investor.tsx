import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipGroup } from '@/components/chip-group';
import { PrimaryButton } from '@/components/primary-button';
import { WizardProgress } from '@/components/wizard-progress';
import { useFlow, type Experience, type Goal, type Risk } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

const EXPERIENCES: { label: string; value: Experience }[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const GOALS: { label: string; value: Goal }[] = [
  { label: 'Growth', value: 'growth' },
  { label: 'Income', value: 'income' },
  { label: 'Retirement', value: 'retirement' },
];

const RISKS: { label: string; value: Risk }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

/**
 * Sign-up wizard, step 3 — investor profile.
 *
 * Experience, primary goal and risk tolerance (single-select chip groups).
 * "Finish" requires all three, then completes onboarding at the success screen.
 */
export default function InvestorStep() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, setProfile } = useFlow();

  const canSubmit = profile.experience !== null && profile.goal !== null && profile.risk !== null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 8 }}>
      <ScrollView contentContainerStyle={{ gap: 26, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <WizardProgress step={3} total={3} />

        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 28, color: colors.text }}>Your investor profile</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, color: colors.textMuted }}>
            This tailors your insights and recommendations.
          </Text>
        </View>

        <Field label="Experience">
          <ChipGroup options={EXPERIENCES} value={profile.experience} onChange={(experience) => setProfile({ experience })} />
        </Field>
        <Field label="Primary goal">
          <ChipGroup options={GOALS} value={profile.goal} onChange={(goal) => setProfile({ goal })} />
        </Field>
        <Field label="Risk tolerance">
          <ChipGroup options={RISKS} value={profile.risk} onChange={(risk) => setProfile({ risk })} />
        </Field>
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom + 12, paddingTop: 8 }}>
        <PrimaryButton label="Finish" disabled={!canSubmit} onPress={() => router.push('/success')} />
      </View>
    </View>
  );
}

/** Labelled section wrapping a chip group. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 16, color: colors.text }}>{label}</Text>
      {children}
    </View>
  );
}
