import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const PRESS = { duration: 160, easing: Easing.out(Easing.cubic) } as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressScaleProps {
  onPress: () => void;
  /** Keep between 0.95 and 0.98 — smaller controls tolerate more. */
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityLabel?: string;
  children: ReactNode;
}

/** A pressable that acknowledges the finger before the press resolves. */
export function PressScale({
  onPress,
  scaleTo = 0.96,
  style,
  hitSlop,
  accessibilityLabel,
  children,
}: PressScaleProps) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(scaleTo, PRESS);
      }}
      onPressOut={() => {
        scale.value = withTiming(1, PRESS);
      }}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}
