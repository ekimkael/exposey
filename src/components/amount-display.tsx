import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInDown,
  SlideOutUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text, View, type TextStyle } from 'react-native';

import { font } from '@/lib/fonts';
import { splitAmount } from '@/lib/amount';

// 'color' + 'shake' removed — now always-on error feedback regardless of mode
export type AnimStyle = 'pulse' | 'flip' | 'fade';

export const ANIM_LABELS: Record<AnimStyle, { label: string; icon: string }> = {
  pulse: { label: 'Scale Pulse', icon: 'waveform' },
  flip:  { label: 'Flip',        icon: 'arrow.up.arrow.down' },
  fade:  { label: 'Fondu',       icon: 'eye' },
};

const T: TextStyle = {
  fontSize: 64,
  fontFamily: font.bold,
  fontVariant: ['tabular-nums'],
  lineHeight: 76,
};

export function AmountDisplay({
  amount,
  exceeded,
  animStyle,
}: {
  amount: string;
  exceeded: boolean;
  animStyle: AnimStyle;
}) {
  const { dollars, cents } = splitAmount(amount);

  const scale      = useSharedValue(1);
  const translateX = useSharedValue(0);
  const errorColor = useSharedValue(0); // 0 = black, 1 = red — always driven by exceeded

  // pulse: bounce on each keystroke
  useEffect(() => {
    if (animStyle !== 'pulse') return;
    scale.value = withSequence(
      withTiming(1.08, { duration: 70 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
  }, [amount, animStyle]);

  // shake + red: always trigger on exceeded, regardless of animStyle
  useEffect(() => {
    errorColor.value = withTiming(exceeded ? 1 : 0, { duration: 250 });
    if (!exceeded) return;
    translateX.value = withSequence(
      withTiming(-10, { duration: 45 }),
      withTiming(10,  { duration: 45 }),
      withTiming(-8,  { duration: 45 }),
      withTiming(8,   { duration: 45 }),
      withTiming(0,   { duration: 45 }),
    );
  }, [exceeded]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  // ponytail: no PlatformColors — reanimated worklets require static color strings
  const errorDollarStyle = useAnimatedStyle(() => ({
    color: interpolateColor(errorColor.value, [0, 1], ['#111111', '#E0312A']),
  }));

  // --- Fade per digit ---
  if (animStyle === 'fade') {
    return (
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'baseline' }, shakeStyle]}>
        <Animated.Text style={[T, errorDollarStyle]}>$</Animated.Text>
        {dollars.split('').map((ch, i) => (
          <Animated.View key={`d${i}${ch}`} entering={FadeInDown.duration(140)} exiting={FadeOutUp.duration(140)}>
            <Animated.Text style={[T, errorDollarStyle]}>{ch}</Animated.Text>
          </Animated.View>
        ))}
        {cents.split('').map((ch, i) => (
          <Animated.View key={`c${i}${ch}`} entering={FadeInDown.duration(140)} exiting={FadeOutUp.duration(140)}>
            <Text style={[T, { color: '#B8B8B8' }]}>{ch}</Text>
          </Animated.View>
        ))}
      </Animated.View>
    );
  }

  // --- Flip (slot machine) — clipped to its own bounds ---
  if (animStyle === 'flip') {
    return (
      <Animated.View style={shakeStyle}>
        <View style={{ height: 80, overflow: 'hidden', justifyContent: 'center' }}>
          <Animated.View
            key={amount}
            entering={SlideInDown.duration(200)}
            exiting={SlideOutUp.duration(200)}
            style={{ flexDirection: 'row' }}>
            <Animated.Text selectable style={[T, errorDollarStyle]}>${dollars}</Animated.Text>
            <Text style={[T, { color: '#B8B8B8' }]}>{cents}</Text>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  // --- Pulse (default) ---
  return (
    <Animated.View style={[{ flexDirection: 'row' }, pulseStyle, shakeStyle]}>
      <Animated.Text selectable style={[T, errorDollarStyle]}>${dollars}</Animated.Text>
      <Text style={[T, { color: '#B8B8B8' }]}>{cents}</Text>
    </Animated.View>
  );
}
