import { Image } from 'expo-image';
import { Pressable, Text } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
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
        opacity: pressed ? 0.7 : 1,
      })}>
      {icon ? <Image source={`sf:${icon}`} tintColor={colors.text} style={{ width: 18, height: 18 }} /> : null}
      <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}
