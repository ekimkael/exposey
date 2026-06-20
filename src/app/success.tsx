import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { useFlow } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * Success screen — "You're all set".
 *
 * Terminal step: a green check, a confirmation personalised with the name
 * collected on the profile screen, and "Continue" into the home dashboard.
 */
export default function SuccessScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useFlow();
  const name = profile.firstName.trim() || 'there';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 32, paddingBottom: insets.bottom }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Image source={require('@/assets/images/success-check.svg')} style={{ width: 140, height: 140 }} contentFit="contain" />
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 30, lineHeight: 36, textAlign: 'center', color: colors.text }}>
            Thanks, {name}! You&apos;re all set
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 22, textAlign: 'center', color: colors.textMuted }}>
            Your smart investment journey starts now, powered by real-time insights and seamless tracking.
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: 12 }}>
        <PrimaryButton label="Continue" onPress={() => router.replace('/home')} />
      </View>
    </View>
  );
}
