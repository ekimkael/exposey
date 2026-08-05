import { Image } from 'expo-image';
import { Text } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { PressableScale } from '@/components/pressable-scale';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

export interface SocialButtonProps {
  /** Provider label, e.g. "Google" or "Apple". */
  label: string;
  /** Leading SF Symbol (iOS), e.g. `apple.logo`. */
  icon?: SFSymbol;
  /** Tap handler. */
  onPress?: () => void;
}

/**
 * Outlined secondary button used for the "Or continue with" providers
 * (Google / Apple). Sits two-up in a row, hence `flex: 1`.
 */
export function SocialButton({ label, icon, onPress }: SocialButtonProps) {
  const { colors } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 52,
        borderRadius: 14,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.surface,
      }}>
      {icon ? <Image source={`sf:${icon}`} tintColor={colors.text} style={{ width: 18, height: 18 }} /> : null}
      <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.text }}>{label}</Text>
    </PressableScale>
  );
}
