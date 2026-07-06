import { Button, Image } from '@expo/ui/swift-ui';
import { buttonStyle, font, frame, glassEffect } from '@expo/ui/swift-ui/modifiers';

import { WALLET_COLORS } from '@/constants/wallet';

/**
 * The close (X) glyph shown inside the sheet, matched to the native iOS 26
 * header toolbar button. It uses the same SF Symbol and gray, wrapped in a
 * circular `glassEffect`, so the in-sheet cross and the header cross get the
 * same OS Liquid Glass treatment.
 *
 * @param onPress - Invoked when the glyph is tapped.
 */
export function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Button onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <Image
        systemName="xmark"
        color={WALLET_COLORS.closeGlyph}
        modifiers={[
          font({ size: 14, weight: 'semibold' }),
          frame({ width: 30, height: 30 }),
          glassEffect({ glass: { variant: 'regular', interactive: true }, shape: 'circle' }),
        ]}
      />
    </Button>
  );
}
