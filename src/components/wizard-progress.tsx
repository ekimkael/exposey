import { Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

export interface WizardProgressProps {
  /** Current step (1-based). */
  step: number;
  /** Total number of steps. */
  total: number;
}

/**
 * Segmented progress indicator for the sign-up wizard: `total` bars filled up to
 * `step` in the accent colour, with a "Step X of N" caption.
 */
export function WizardProgress({ step, total }: WizardProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: i < step ? colors.accent : colors.divider,
            }}
          />
        ))}
      </View>
      <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.textMuted }}>
        Step {step} of {total}
      </Text>
    </View>
  );
}
