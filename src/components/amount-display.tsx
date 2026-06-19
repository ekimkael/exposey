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

export type AnimStyle = 'pulse' | 'shake' | 'color' | 'flip' | 'fade';

export const ANIM_LABELS: Record<AnimStyle, { label: string; icon: string }> = {
  pulse: { label: 'Scale Pulse', icon: 'waveform' },
  shake: { label: 'Shake', icon: 'arrow.left.and.right' },
  color: { label: 'Couleur', icon: 'paintpalette' },
  flip: { label: 'Flip', icon: 'arrow.up.arrow.down' },
  fade: { label: 'Fondu', icon: 'eye' },
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
  available,
  animStyle,
}: {
  amount: string;
  exceeded: boolean;
  available: number;
  animStyle: AnimStyle;
}) {
  const { dollars, cents } = splitAmount(amount);
  const ratio = Math.min(parseFloat(amount || '0') / available, 1);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  // pulse: bounce on every keystroke
  useEffect(() => {
    if (animStyle !== 'pulse') return;
    scale.value = withSequence(
      withTiming(1.08, { duration: 70 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
  }, [amount, animStyle]);

  // shake: fire when exceeded transitions to true
  useEffect(() => {
    if (animStyle !== 'shake' || !exceeded) return;
    translateX.value = withSequence(
      withTiming(-10, { duration: 45 }),
      withTiming(10, { duration: 45 }),
      withTiming(-8, { duration: 45 }),
      withTiming(8, { duration: 45 }),
      withTiming(0, { duration: 45 }),
    );
  }, [exceeded, animStyle]);

  // color: follow ratio as amount grows toward available
  useEffect(() => {
    colorProgress.value =
      animStyle === 'color'
        ? withTiming(ratio, { duration: 300 })
        : withTiming(0, { duration: 200 });
  }, [amount, animStyle]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const colorTextStyle = useAnimatedStyle(() => ({
    // ponytail: no PlatformColors here — reanimated requires static values
    color: interpolateColor(colorProgress.value, [0, 1], ['#111111', '#E0312A']),
  }));

  // --- Fade per digit ---
  if (animStyle === 'fade') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={[T, { color: '#111' }]}>$</Text>
        {dollars.split('').map((ch, i) => (
          <Animated.View key={`d${i}${ch}`} entering={FadeInDown.duration(140)} exiting={FadeOutUp.duration(140)}>
            <Text style={[T, { color: '#111' }]}>{ch}</Text>
          </Animated.View>
        ))}
        {cents.split('').map((ch, i) => (
          <Animated.View key={`c${i}${ch}`} entering={FadeInDown.duration(140)} exiting={FadeOutUp.duration(140)}>
            <Text style={[T, { color: '#B8B8B8' }]}>{ch}</Text>
          </Animated.View>
        ))}
      </View>
    );
  }

  // --- Flip (slot machine) ---
  if (animStyle === 'flip') {
    return (
      <Animated.View
        key={amount}
        entering={SlideInDown.duration(180)}
        exiting={SlideOutUp.duration(180)}
        style={{ flexDirection: 'row' }}>
        <Text selectable style={[T, { color: '#111' }]}>${dollars}</Text>
        <Text style={[T, { color: '#B8B8B8' }]}>{cents}</Text>
      </Animated.View>
    );
  }

  // --- Color gradient ---
  if (animStyle === 'color') {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Animated.Text selectable style={[T, colorTextStyle]}>${dollars}</Animated.Text>
        <Text style={[T, { color: '#B8B8B8' }]}>{cents}</Text>
      </View>
    );
  }

  // --- Pulse / Shake ---
  return (
    <Animated.View style={[{ flexDirection: 'row' }, animStyle === 'pulse' ? pulseStyle : shakeStyle]}>
      <Text selectable style={[T, { color: '#111' }]}>${dollars}</Text>
      <Text style={[T, { color: '#B8B8B8' }]}>{cents}</Text>
    </Animated.View>
  );
}
