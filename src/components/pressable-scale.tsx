import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { duration, easing, pressScale } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /**
   * Style for the surface. Accepts animated styles (e.g. an `interpolateColor`
   * fill) as well as plain ones. Function-form (`({ pressed }) => …`) styles are
   * not supported — the press state is animated internally.
   */
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
}

/**
 * The standard press feedback for rows, cards and secondary buttons.
 *
 * Held, the surface sinks to `pressScale` (0.97) and dims slightly over
 * {@link duration.press} (160ms) with the shared ease-out curve, then returns on
 * release — replacing React Native's instant `({ pressed })` opacity flick with
 * something that feels physically pushed.
 *
 * Under the system Reduce Motion setting the scale is dropped and only the
 * opacity dip remains, so the feedback survives without movement.
 */
export function PressableScale({ style, onPressIn, onPressOut, ...props }: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const config = { duration: duration.press, easing: easing.out };
    return {
      opacity: withTiming(1 - pressed.value * 0.1, config),
      transform: [{ scale: reduceMotion ? 1 : withTiming(1 - pressed.value * (1 - pressScale), config) }],
    };
  });

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        pressed.value = 1;
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = 0;
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    />
  );
}
