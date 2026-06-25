import { StyleSheet } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { DOT_ACTIVE_WIDTH } from '@/utils/data';
import { COLORS } from '@/utils/tokens';

export interface ProgressDotProps {
  /** Zero-based position of this dot in the row. */
  index: number;
  /** Current page — drives track width without JS re-renders. */
  page: SharedValue<number>;
  /** Fill progress of the active dot (0 → 1). */
  progress: SharedValue<number>;
}

/**
 * Progress-bar style carousel indicator.
 *
 * - **Past**: collapsed to 8px, fully filled.
 * - **Active**: expands to {@link DOT_ACTIVE_WIDTH}; fill tracks `progress`.
 * - **Future**: collapsed, empty.
 */
export function ProgressDot({ index, page, progress }: ProgressDotProps) {
  const trackStyle = useAnimatedStyle(() => ({
    width: page.value === index ? DOT_ACTIVE_WIDTH : 8,
  }));

  const fillStyle = useAnimatedStyle(() => {
    if (page.value > index) return { width: 8 };
    if (page.value === index) return { width: progress.value * DOT_ACTIVE_WIDTH };
    return { width: 0 };
  });

  return (
    <Animated.View style={[styles.track, trackStyle]}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.dotTrack,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.dotFill,
    borderRadius: 2.5,
  },
});
