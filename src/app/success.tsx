import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { useFlow } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { duration, easing, spring } from '@/lib/motion';
import { useTheme } from '@/theme/theme-context';

/**
 * Delay before the entrance starts, so it plays *after* the stack push settles.
 * Without it the whole animation runs while the screen is still sliding in and
 * the celebration is never actually seen.
 */
const ENTER_DELAY = 250;
/** Stagger between the check mark and the copy, in milliseconds. */
const TEXT_DELAY = 80;

/**
 * Success screen — "You're all set".
 *
 * Terminal step: a green check, a confirmation personalised with the name
 * collected on the profile screen, and "Continue" into the home dashboard.
 *
 * The check springs in and the copy follows with an 80ms stagger — this is the
 * one rare, celebratory moment in the flow, so it gets a visible bounce. Both
 * are reduced to a plain fade under the system Reduce Motion setting, and
 * "Continue" never animates so it stays tappable from the first frame.
 */
export default function SuccessScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useFlow();
  const name = profile.firstName.trim() || 'there';

  const reduceMotion = useReducedMotion();
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = 1;
  }, [enter]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: withDelay(ENTER_DELAY, withTiming(enter.value, { duration: duration.short, easing: easing.out })),
    transform: [
      {
        scale: reduceMotion
          ? 1
          : withDelay(ENTER_DELAY, withSpring(0.9 + enter.value * 0.1, spring.celebration)),
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: withDelay(
      ENTER_DELAY + TEXT_DELAY,
      withTiming(enter.value, { duration: duration.short, easing: easing.out }),
    ),
    transform: [
      {
        translateY: reduceMotion
          ? 0
          : withDelay(
              ENTER_DELAY + TEXT_DELAY,
              withTiming((1 - enter.value) * 12, { duration: duration.short, easing: easing.out }),
            ),
      },
    ],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 32, paddingBottom: insets.bottom }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <Animated.View style={checkStyle}>
          <Image source={require('@/assets/images/success-check.svg')} style={{ width: 140, height: 140 }} contentFit="contain" />
        </Animated.View>
        <Animated.View style={[{ alignItems: 'center', gap: 12 }, textStyle]}>
          <Text style={{ fontFamily: font.bold, fontSize: 30, lineHeight: 36, textAlign: 'center', color: colors.text }}>
            Thanks, {name}! You&apos;re all set
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, lineHeight: 22, textAlign: 'center', color: colors.textMuted }}>
            Your smart investment journey starts now, powered by real-time insights and seamless tracking.
          </Text>
        </Animated.View>
      </View>

      <View style={{ paddingBottom: 12 }}>
        <PrimaryButton label="Continue" onPress={() => router.replace('/home')} />
      </View>
    </View>
  );
}
