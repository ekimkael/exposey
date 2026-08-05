import { type ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/** Press feedback duration — within the 100-160ms button-press budget. */
const PRESS_MS = 140;

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps {
  onPress?: () => void;
  disabled?: boolean;
  /** Opacity while held down. */
  pressedOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * `Pressable` whose press-feedback opacity eases in/out instead of snapping —
 * RN's style-callback opacity changes instantly, so this animates a shared
 * value on the `Pressable` itself (no extra wrapper `View`, so `style` still
 * lays out exactly as it would on a plain `Pressable`).
 */
export function AnimatedPressable({ onPress, disabled, pressedOpacity = 0.6, style, children }: AnimatedPressableProps) {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <AnimatedPressableBase
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        opacity.value = withTiming(pressedOpacity, { duration: PRESS_MS });
      }}
      onPressOut={() => {
        opacity.value = withTiming(1, { duration: PRESS_MS });
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressableBase>
  );
}
