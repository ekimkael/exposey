import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  blur,
  disabled,
  font,
  foregroundStyle,
  opacity,
  padding,
  zIndex,
} from '@expo/ui/swift-ui/modifiers';

import { WALLET_COLORS, type DetailKind } from '@/constants/wallet';

import { CloseButton } from './close-button';
import { OptionRow } from './option-row';

/**
 * The compact first state of the sheet: a title, three option rows, and a
 * close button. Both panes stay mounted so the morph can cross-fade between
 * them; when `active` is false this pane fades out (opacity + blur) and
 * `disabled` turns off its hit-testing so the hidden pane can't be tapped.
 *
 * @param active - Whether this is the pane currently shown.
 * @param onSelectDetail - Called with the detail pane to open.
 * @param onClose - Called when the close button is tapped (dismisses the sheet).
 */
export function OptionsPane({
  active,
  onSelectDetail,
  onClose,
}: {
  active: boolean;
  onSelectDetail: (kind: DetailKind) => void;
  onClose: () => void;
}) {
  return (
    <VStack
      alignment="leading"
      spacing={10}
      modifiers={[
        padding({ horizontal: 18, top: 18, bottom: 18 }),
        opacity(active ? 1 : 0),
        blur(active ? 0 : 6),
        zIndex(active ? 1 : 0),
        disabled(!active),
      ]}>
      <HStack modifiers={[padding({ bottom: 4 })]}>
        <Text
          modifiers={[
            font({ size: 25, weight: 'semibold', design: 'rounded' }),
            foregroundStyle(WALLET_COLORS.primaryText),
          ]}>
          Options
        </Text>
        <Spacer />
        <CloseButton onPress={onClose} />
      </HStack>

      <OptionRow
        icon="creditcard"
        label="View Private Key"
        onPress={() => onSelectDetail('privateKey')}
      />
      <OptionRow
        icon="list.bullet.rectangle"
        label="View Recovery Phrase"
        onPress={() => onSelectDetail('recoveryPhrase')}
      />
      {/* Decorative in this reproduction — wire up to a real flow as needed. */}
      <OptionRow icon="exclamationmark.triangle" label="Remove Wallet" destructive onPress={() => {}} />
    </VStack>
  );
}
