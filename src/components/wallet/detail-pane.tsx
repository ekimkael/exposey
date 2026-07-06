import { Button, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  blur,
  buttonStyle,
  clipShape,
  disabled,
  font,
  foregroundStyle,
  frame,
  lineSpacing,
  opacity,
  padding,
  zIndex,
} from '@expo/ui/swift-ui/modifiers';

import { DETAIL_CONTENT_HEIGHT } from '@/constants/animation';
import {
  BULLET_ICONS,
  DETAIL_COPY,
  DETAIL_HERO_ICON,
  FILL_AVAILABLE_WIDTH,
  SHARED_BULLETS,
  WALLET_COLORS,
  type DetailKind,
} from '@/constants/wallet';

import { CloseButton } from './close-button';

/**
 * The tall second state of the sheet, shared by the Private Key and Recovery
 * Phrase panes (they differ only by copy and hero icon). Fades in over the
 * Options pane during the morph; see {@link OptionsPane} for the cross-fade
 * mechanics.
 *
 * @param active - Whether this is the pane currently shown.
 * @param kind - Which detail copy/icon to render.
 * @param onClose - Called by both the X and Cancel to return to Options.
 */
export function DetailPane({
  active,
  kind,
  onClose,
}: {
  active: boolean;
  kind: DetailKind;
  onClose: () => void;
}) {
  const copy = DETAIL_COPY[kind];
  const bullets = [copy.leadBullet, ...SHARED_BULLETS];

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[
        padding({ horizontal: 20, top: 20, bottom: 16 }),
        // `frame` ignores max* once height is set, so height and fill-width
        // are separate calls (see OptionRow for the same workaround).
        frame({ height: DETAIL_CONTENT_HEIGHT, alignment: 'top' }),
        frame({ maxWidth: FILL_AVAILABLE_WIDTH }),
        opacity(active ? 1 : 0),
        blur(active ? 0 : 6),
        zIndex(active ? 1 : 0),
        disabled(!active),
      ]}>
      <HStack>
        <Image systemName={DETAIL_HERO_ICON[kind]} size={38} color={WALLET_COLORS.primaryText} />
        <Spacer />
        <CloseButton onPress={onClose} />
      </HStack>

      <Text
        modifiers={[
          padding({ top: 14 }),
          font({ size: 30, weight: 'bold', design: 'rounded' }),
          foregroundStyle(WALLET_COLORS.primaryText),
        ]}>
        {copy.title}
      </Text>

      <Text
        modifiers={[
          padding({ top: 8 }),
          font({ size: 19, weight: 'medium', design: 'rounded' }),
          foregroundStyle(WALLET_COLORS.mutedText),
          lineSpacing(3),
        ]}>
        {copy.description}
      </Text>

      <VStack alignment="leading" spacing={15} modifiers={[padding({ top: 24 })]}>
        {bullets.map((bullet, index) => (
          <HStack key={bullet} spacing={10}>
            <Image systemName={BULLET_ICONS[index]} size={18} color={WALLET_COLORS.mutedIcon} />
            <Text
              modifiers={[
                font({ size: 17, weight: 'medium', design: 'rounded' }),
                foregroundStyle(WALLET_COLORS.mutedText),
              ]}>
              {bullet}
            </Text>
          </HStack>
        ))}
      </VStack>

      <Spacer />

      <HStack spacing={10}>
        <Button onPress={onClose} modifiers={[buttonStyle('plain')]}>
          <Text
            modifiers={[
              frame({ height: 58 }),
              frame({ maxWidth: FILL_AVAILABLE_WIDTH }),
              background(WALLET_COLORS.cancelButton),
              clipShape('capsule'),
              font({ size: 20, weight: 'semibold', design: 'rounded' }),
              foregroundStyle(WALLET_COLORS.primaryText),
            ]}>
            Cancel
          </Text>
        </Button>
        {/* Decorative in this reproduction — wire up to the reveal flow as needed. */}
        <Button onPress={() => {}} modifiers={[buttonStyle('plain')]}>
          <HStack
            spacing={6}
            modifiers={[
              frame({ height: 58 }),
              frame({ maxWidth: FILL_AVAILABLE_WIDTH }),
              background(WALLET_COLORS.revealBlue),
              clipShape('capsule'),
            ]}>
            <Image systemName="viewfinder" size={19} color={WALLET_COLORS.sheetSurface} />
            <Text
              modifiers={[
                font({ size: 20, weight: 'semibold', design: 'rounded' }),
                foregroundStyle(WALLET_COLORS.sheetSurface),
              ]}>
              Reveal
            </Text>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  );
}
