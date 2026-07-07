import { useState } from 'react';
import { Animated } from 'react-native';

import { FIELD_LABEL_ANIM_MS, LABEL_FLOAT_SCALE, LABEL_FLOAT_TRANSLATE_Y } from '@/constants/animation';

interface FloatingLabel {
  /** Ready-to-spread style for the label `Animated.Text` — floats to the top-left
   * and shrinks while focused or filled, rests centered otherwise. */
  labelStyle: {
    transform: ({ translateY: Animated.AnimatedInterpolation<number> } | { scale: Animated.AnimatedInterpolation<number> })[];
  };
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * Floating-label animation for a text field: the placeholder floats from
 * resting (centered, full size) to active (top-left, shrunk) and back.
 *
 * `onFocus` always floats the label. `onBlur` settles back to resting only
 * if `hasValue` is false — a field with content stays floated even after
 * losing focus, matching standard floating-label behavior. `hasValue` is
 * read fresh on every blur (not the field's focus state), so this stays
 * correct even though `onBlur` fires while the field still *reports*
 * focused in the same render pass.
 *
 * @param hasValue - whether the field currently has content.
 */
export function useFloatingLabel(hasValue: boolean): FloatingLabel {
  const [labelProgress] = useState(() => new Animated.Value(hasValue ? 1 : 0));

  function animateTo(toValue: number) {
    Animated.timing(labelProgress, { toValue, duration: FIELD_LABEL_ANIM_MS, useNativeDriver: true }).start();
  }

  return {
    labelStyle: {
      transform: [
        { translateY: labelProgress.interpolate({ inputRange: [0, 1], outputRange: [0, LABEL_FLOAT_TRANSLATE_Y] }) },
        { scale: labelProgress.interpolate({ inputRange: [0, 1], outputRange: [1, LABEL_FLOAT_SCALE] }) },
      ],
    },
    onFocus: () => animateTo(1),
    onBlur: () => animateTo(hasValue ? 1 : 0),
  };
}
