import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCarousel, type Slide } from '@/components/onboarding-carousel';
import { PrimaryButton } from '@/components/primary-button';
import { ThemeMenu } from '@/components/theme-menu';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** Carousel pages shown on the intro. */
const SLIDES: Slide[] = [
  {
    title: 'Optimize smart investments in real time.',
    subtitle: 'Effortlessly optimize smart investments with real-time monitoring all in one app.',
  },
  {
    title: 'Track your portfolio anywhere.',
    subtitle: 'Live prices, alerts and insights, right in your pocket wherever you go.',
  },
  {
    title: 'Invest with confidence.',
    subtitle: 'Bank-grade security and real-time analytics behind every move you make.',
  },
];

/**
 * Onboarding intro — the app's first screen.
 *
 * Full-bleed (no navigation header): the octagon mark, a theme switcher, a
 * swipeable {@link OnboardingCarousel} with morphing dots, and the entry
 * actions. "Log in" goes to the login form; "Sign up" jumps straight to country
 * selection to start the sign-up flow.
 */
export default function IntroScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: insets.bottom }}>
      {/* Renders the theme switcher into the native header toolbar (right). */}
      <ThemeMenu />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <OnboardingCarousel slides={SLIDES} />
      </View>

      <View style={{ paddingHorizontal: 20, gap: 16, paddingTop: 8, paddingBottom: 8 }}>
        <PrimaryButton label="Log in" onPress={() => router.push('/login')} />
        <Pressable onPress={() => router.push('/country?from=onboarding')} style={{ alignSelf: 'center' }}>
          <Text style={{ fontFamily: font.regular, fontSize: 14, color: colors.textMuted }}>
            Don&apos;t have an account? <Text style={{ fontFamily: font.semibold, color: colors.text }}>Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
