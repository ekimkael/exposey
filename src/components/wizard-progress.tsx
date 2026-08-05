import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { font } from '@/lib/fonts';
import { duration, easing } from '@/lib/motion';
import { useTheme } from '@/theme/theme-context';

/** Delay before the current segment fills, so the stack push has settled first. */
const FILL_DELAY = 250;

export interface WizardProgressProps {
  /** Current step (1-based). */
  step: number;
  /** Total number of steps. */
  total: number;
}

/**
 * Segmented progress indicator for the sign-up wizard: `total` bars filled up to
 * `step` in the accent colour, with a "Step X of N" caption.
 *
 * Each step is its own route, so this re-mounts per screen. Segments earned on
 * previous screens render already filled, while the current step's segment fills
 * in shortly after arrival — so progress is seen advancing rather than
 * teleporting.
 */
export function WizardProgress({ step, total }: WizardProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <Segment key={i} state={i < step - 1 ? 'earned' : i === step - 1 ? 'filling' : 'empty'} />
        ))}
      </View>
      <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.textMuted }}>
        Step {step} of {total}
      </Text>
    </View>
  );
}

/** One bar: `earned` renders filled, `filling` animates to filled, `empty` stays muted. */
function Segment({ state }: { state: 'earned' | 'filling' | 'empty' }) {
  const { colors } = useTheme();
  const progress = useSharedValue(state === 'earned' ? 1 : 0);

  useEffect(() => {
    if (state !== 'filling') return;
    progress.value = withDelay(FILL_DELAY, withTiming(1, { duration: duration.medium, easing: easing.out }));
  }, [state, progress]);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.divider, colors.accent]),
  }));

  return <Animated.View style={[{ flex: 1, height: 5, borderRadius: 3 }, style]} />;
}
