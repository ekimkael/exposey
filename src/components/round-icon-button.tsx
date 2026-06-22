import { Pressable } from 'react-native';

import { Icon } from '@/components/icon';
import { layout } from '@/constants/layout';

interface RoundIconButtonProps {
  /** SF Symbol name to render. */
  icon: string;
  /** Diameter of the circle, in points. */
  size?: number;
  /** Circle background colour. */
  background?: string;
  /** Icon tint colour. */
  color?: string;
  onPress?: () => void;
}

/**
 * A small circular icon button used throughout the transport controls
 * (block, like, mute, download…). The glyph scales with the button.
 */
export function RoundIconButton({
  icon,
  size = layout.control.roundSize,
  background = 'rgba(0,0,0,0.4)',
  color = '#FFFFFF',
  onPress,
}: RoundIconButtonProps) {
  return (
    <Pressable
      hitSlop={6}
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={icon} size={Math.round(size * 0.42)} color={color} />
    </Pressable>
  );
}
