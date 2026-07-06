import { Button, HStack, Image, Spacer, Text } from '@expo/ui/swift-ui';
import {
  background,
  buttonStyle,
  clipShape,
  font,
  foregroundStyle,
  frame,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import type { SFSymbol } from 'sf-symbols-typescript';

import { FILL_AVAILABLE_WIDTH, WALLET_COLORS } from '@/constants/wallet';

/** A single tappable row in the Options pane. */
export function OptionRow({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  /** SF Symbol shown at the leading edge of the row. */
  icon: SFSymbol;
  /** Row label text. */
  label: string;
  /** Renders in the red/destructive palette (e.g. "Remove Wallet"). */
  destructive?: boolean;
  /** Invoked when the row is tapped. */
  onPress: () => void;
}) {
  const textColor = destructive ? WALLET_COLORS.destructive : WALLET_COLORS.primaryText;
  const iconColor = destructive ? WALLET_COLORS.destructive : WALLET_COLORS.optionRowIcon;
  const rowColor = destructive ? WALLET_COLORS.removeRow : WALLET_COLORS.optionRow;

  return (
    <Button onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <HStack
        spacing={12}
        modifiers={[
          padding({ horizontal: 14 }),
          // `frame` ignores max* once an explicit height is set, so the fixed
          // height and the fill-width live in separate `frame` calls.
          frame({ height: 56 }),
          frame({ maxWidth: FILL_AVAILABLE_WIDTH }),
          background(rowColor),
          clipShape('roundedRectangle', 15),
        ]}>
        <Image systemName={icon} size={19} color={iconColor} />
        <Text
          modifiers={[
            font({ size: 19, weight: 'medium', design: 'rounded' }),
            foregroundStyle(textColor),
          ]}>
          {label}
        </Text>
        <Spacer />
      </HStack>
    </Button>
  );
}
