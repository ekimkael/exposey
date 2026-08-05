import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  SlideInDown,
  SlideOutUp,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { type AnimationStyle } from '@/lib/animations';
import { splitAmount } from '@/lib/amount';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

// --- Animation tuning -------------------------------------------------------
/** Peak scale of the pulse bounce. */
const PULSE_PEAK_SCALE = 1.08;
const PULSE_RISE_MS = 70;
/** Horizontal offsets (px) the shake steps through, ending back at 0. */
const SHAKE_OFFSETS = [-10, 10, -8, 8, 0];
const SHAKE_STEP_MS = 45;
/** Cross-fade duration for the black↔red error colour transition. */
const ERROR_COLOR_MS = 250;
/** Per-digit fade duration in the `fade` style. */
const DIGIT_FADE_MS = 140;
/** Slide duration for the `flip` style. */
const FLIP_SLIDE_MS = 200;
/** Fixed height of the flip viewport so digits are clipped to their own bounds. */
const FLIP_CLIP_HEIGHT = 60;

/** Shared typography for every glyph of the amount. */
const amountTextStyle: TextStyle = {
  fontSize: 46,
  lineHeight: 56,
  fontFamily: font.semibold,
  fontVariant: ['tabular-nums'],
};

export interface AmountDisplayProps {
  /** Raw amount string (see `lib/amount.ts`). */
  amount: string;
  /** Whether the amount exceeds the available balance (drives red + shake). */
  exceeded: boolean;
  /** Which entry animation to play. */
  animationStyle: AnimationStyle;
}

/**
 * The large `$100.25` amount with selectable entry animations and built-in
 * error feedback.
 *
 * Dollars render in the theme text colour (or the danger colour when
 * `exceeded`); the cents stay muted. All Reanimated hooks are declared
 * unconditionally before the per-style branches, so the rules of hooks hold
 * regardless of which `animationStyle` is active.
 */
export function AmountDisplay({ amount, exceeded, animationStyle }: AmountDisplayProps) {
  const { colors } = useTheme();
  const { dollars, cents } = splitAmount(amount);
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);
  const shakeOffset = useSharedValue(0);
  const errorProgress = useSharedValue(0); // 0 = normal colour, 1 = danger colour

  // Pulse: bounce the whole amount on every keystroke.
  useEffect(() => {
    if (animationStyle !== 'pulse' || reducedMotion) return;
    scale.value = withSequence(
      withTiming(PULSE_PEAK_SCALE, { duration: PULSE_RISE_MS }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
  }, [amount, animationStyle, reducedMotion, scale]);

  // Error feedback: cross-fade to red, shake, and buzz whenever the balance is
  // exceeded. Runs only on the `exceeded` transition (the keypad is locked
  // above the limit, so this fires once per entry into the error state).
  // Independent of animationStyle by design. The shake (a position change) is
  // skipped under reduced motion; the colour cross-fade and haptic stay.
  useEffect(() => {
    errorProgress.value = withTiming(exceeded ? 1 : 0, { duration: ERROR_COLOR_MS });
    if (!exceeded) return;
    if (!reducedMotion) {
      shakeOffset.value = withSequence(
        ...SHAKE_OFFSETS.map((offset) => withTiming(offset, { duration: SHAKE_STEP_MS })),
      );
    }
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [exceeded, reducedMotion, errorProgress, shakeOffset]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeOffset.value }] }));
  const dollarsColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(errorProgress.value, [0, 1], [colors.text, colors.danger]),
  }));

  const centsStyle: TextStyle = { ...amountTextStyle, color: colors.amountCents };

  if (animationStyle === 'fade') {
    return (
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'baseline' }, shakeStyle]}>
        <Animated.Text style={[amountTextStyle, dollarsColorStyle]}>$</Animated.Text>
        {dollars.split('').map((digit, index) => (
          <Animated.View
            key={`dollar-${index}-${digit}`}
            entering={(reducedMotion ? FadeIn : FadeInDown).duration(DIGIT_FADE_MS)}
            exiting={(reducedMotion ? FadeOut : FadeOutUp).duration(DIGIT_FADE_MS)}>
            <Animated.Text style={[amountTextStyle, dollarsColorStyle]}>{digit}</Animated.Text>
          </Animated.View>
        ))}
        {cents.split('').map((char, index) => (
          <Animated.View
            key={`cent-${index}-${char}`}
            entering={(reducedMotion ? FadeIn : FadeInDown).duration(DIGIT_FADE_MS)}
            exiting={(reducedMotion ? FadeOut : FadeOutUp).duration(DIGIT_FADE_MS)}>
            <Text style={centsStyle}>{char}</Text>
          </Animated.View>
        ))}
      </Animated.View>
    );
  }

  if (animationStyle === 'flip') {
    return (
      <Animated.View style={shakeStyle}>
        <View style={{ height: FLIP_CLIP_HEIGHT, overflow: 'hidden', justifyContent: 'center' }}>
          {/* Remounting on `amount` change triggers the slide in/out within the clipped viewport. */}
          <Animated.View
            key={amount}
            entering={(reducedMotion ? FadeIn : SlideInDown).duration(FLIP_SLIDE_MS)}
            exiting={(reducedMotion ? FadeOut : SlideOutUp).duration(FLIP_SLIDE_MS)}
            style={{ flexDirection: 'row' }}>
            <Animated.Text selectable style={[amountTextStyle, dollarsColorStyle]}>${dollars}</Animated.Text>
            <Text style={centsStyle}>{cents}</Text>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  // Default: pulse.
  return (
    <Animated.View style={[{ flexDirection: 'row' }, pulseStyle, shakeStyle]}>
      <Animated.Text selectable style={[amountTextStyle, dollarsColorStyle]}>${dollars}</Animated.Text>
      <Text style={centsStyle}>{cents}</Text>
    </Animated.View>
  );
}
