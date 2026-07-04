import {
  BottomSheet,
  Button,
  Group,
  Host,
  HStack,
  Image,
  Spacer,
  Text as UIText,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  Animation,
  animation,
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
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
  zIndex,
} from '@expo/ui/swift-ui/modifiers';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Palette sampled from the reference video (Family wallet). */
const C = {
  screenBg: '#F4F3F6',
  cardOrange: '#E68A00',
  sheetWhite: '#FFFFFF',
  rowBg: '#F7F5F9',
  removeBg: '#FBE9E6',
  red: '#E5484D',
  revealBlue: '#00B3FB',
  cancelBg: '#F2F2F3',
  title: '#161616',
  muted: '#9F9FA5',
  iconMuted: '#B0B0B6',
};

/**
 * Morph timings — the reference transition runs ~13 frames at 30fps
 * (~430ms) with a soft spring, no visible overshoot.
 */
const SPRING = Animation.spring({ duration: 0.45, bounce: 0.1 });

// ponytail: fixed sheet heights measured from the reference frames;
// switch to onGeometryChange-driven sizing if content becomes dynamic.
const OPTIONS_H = 236;
const DETAIL_H = 400;
/** Floating iOS 26 sheets have no bottom safe-area inset — content ≈ detent. */
const DETAIL_CONTENT_H = DETAIL_H - 8;

type SheetView = 'options' | 'privateKey' | 'recoveryPhrase';

const DETAIL_COPY = {
  privateKey: {
    title: 'Private Key',
    description:
      'Your Private Key is the key used to back up your wallet. Keep it secret and secure at all times.',
    bullets: ['Keep your Private Key safe'],
  },
  recoveryPhrase: {
    title: 'Secret Recovery Phrase',
    description:
      'Your Secret Recovery Phrase is the key used to back up your wallet. Keep it secret and secure at all times.',
    bullets: ['Keep your Secret Phrase safe'],
  },
} as const;

const SHARED_BULLETS = ["Don't share it with anyone else", "If you lose it, we can't recover it"];

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Button onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <Image systemName="xmark" size={14} color={C.iconMuted} modifiers={[padding({ all: 6 })]} />
    </Button>
  );
}

/** Compact "Options" pane — first sheet state. */
function OptionsPane({
  active,
  onSelect,
  onClose,
}: {
  active: boolean;
  onSelect: (view: SheetView) => void;
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
        <UIText
          modifiers={[font({ size: 18, weight: 'semibold', design: 'rounded' }), foregroundStyle(C.title)]}>
          Options
        </UIText>
        <Spacer />
        <CloseButton onPress={onClose} />
      </HStack>

      <OptionRow icon="creditcard" label="View Private Key" onPress={() => onSelect('privateKey')} />
      <OptionRow
        icon="list.bullet.rectangle"
        label="View Recovery Phrase"
        onPress={() => onSelect('recoveryPhrase')}
      />
      <OptionRow icon="exclamationmark.triangle" label="Remove Wallet" destructive onPress={() => {}} />
    </VStack>
  );
}

function OptionRow({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: 'creditcard' | 'list.bullet.rectangle' | 'exclamationmark.triangle';
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const tint = destructive ? C.red : C.title;
  return (
    <Button onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <HStack
        spacing={10}
        modifiers={[
          padding({ horizontal: 14 }),
          // FrameModifier ignores max* once height is set — keep them split.
          frame({ height: 48 }),
          frame({ maxWidth: 100000 }),
          background(destructive ? C.removeBg : C.rowBg),
          clipShape('roundedRectangle', 14),
        ]}>
        <Image systemName={icon} size={15} color={destructive ? C.red : '#7A7A80'} />
        <UIText
          modifiers={[font({ size: 15, weight: 'medium', design: 'rounded' }), foregroundStyle(tint)]}>
          {label}
        </UIText>
        <Spacer />
      </HStack>
    </Button>
  );
}

/** Tall detail pane — shared layout for Private Key / Recovery Phrase. */
function DetailPane({
  active,
  kind,
  onClose,
}: {
  active: boolean;
  kind: 'privateKey' | 'recoveryPhrase';
  onClose: () => void;
}) {
  const copy = DETAIL_COPY[kind];
  const bullets = [...copy.bullets, ...SHARED_BULLETS];
  const bulletIcons = ['checkmark.shield', 'square.and.pencil', 'nosign'] as const;

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[
        padding({ horizontal: 20, top: 20, bottom: 16 }),
        frame({ height: DETAIL_CONTENT_H, alignment: 'top' }),
        frame({ maxWidth: 100000 }),
        opacity(active ? 1 : 0),
        blur(active ? 0 : 6),
        zIndex(active ? 1 : 0),
        disabled(!active),
      ]}>
      <HStack>
        <Image
          systemName={kind === 'privateKey' ? 'creditcard.viewfinder' : 'circle.grid.3x3'}
          size={30}
          color={C.title}
        />
        <Spacer />
        <CloseButton onPress={onClose} />
      </HStack>

      <UIText
        modifiers={[
          padding({ top: 14 }),
          font({ size: 20, weight: 'bold', design: 'rounded' }),
          foregroundStyle(C.title),
        ]}>
        {copy.title}
      </UIText>

      <UIText
        modifiers={[
          padding({ top: 8 }),
          font({ size: 15, weight: 'medium', design: 'rounded' }),
          foregroundStyle(C.muted),
          lineSpacing(3),
        ]}>
        {copy.description}
      </UIText>

      <VStack alignment="leading" spacing={12} modifiers={[padding({ top: 22 })]}>
        {bullets.map((bullet, i) => (
          <HStack key={bullet} spacing={10}>
            <Image systemName={bulletIcons[i]} size={14} color={C.iconMuted} />
            <UIText
              modifiers={[
                font({ size: 13, weight: 'medium', design: 'rounded' }),
                foregroundStyle(C.muted),
              ]}>
              {bullet}
            </UIText>
          </HStack>
        ))}
      </VStack>

      <Spacer />

      <HStack spacing={10}>
        <Button onPress={onClose} modifiers={[buttonStyle('plain')]}>
          <UIText
            modifiers={[
              frame({ height: 50 }),
              frame({ maxWidth: 100000 }),
              background(C.cancelBg),
              clipShape('capsule'),
              font({ size: 16, weight: 'semibold', design: 'rounded' }),
              foregroundStyle(C.title),
            ]}>
            Cancel
          </UIText>
        </Button>
        <Button onPress={() => {}} modifiers={[buttonStyle('plain')]}>
          <HStack
            spacing={6}
            modifiers={[
              frame({ height: 50 }),
              frame({ maxWidth: 100000 }),
              background(C.revealBlue),
              clipShape('capsule'),
            ]}>
            <Image systemName="viewfinder" size={15} color="#FFFFFF" />
            <UIText
              modifiers={[
                font({ size: 16, weight: 'semibold', design: 'rounded' }),
                foregroundStyle('#FFFFFF'),
              ]}>
              Reveal
            </UIText>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  );
}

/**
 * Morphing sheet — a native SwiftUI BottomSheet with a transparent
 * presentation background; the visible white card is our own view so its
 * height can morph with a spring while both panes cross-fade (opacity +
 * blur), all in one SwiftUI transaction keyed on `stateIdx`.
 */
function MorphingSheet({
  isPresented,
  onIsPresentedChange,
}: {
  isPresented: boolean;
  onIsPresentedChange: (open: boolean) => void;
}) {
  const [view, setView] = useState<SheetView>('options');
  // Keeps the last detail copy mounted while fading back to Options,
  // otherwise the text would swap mid-transition.
  const [detailKind, setDetailKind] = useState<'privateKey' | 'recoveryPhrase'>('privateKey');

  const openDetail = (v: SheetView) => {
    if (v !== 'options') setDetailKind(v);
    setView(v);
  };

  const isOptions = view === 'options';
  const stateIdx = isOptions ? 0 : view === 'privateKey' ? 1 : 2;

  return (
    <Host style={styles.host}>
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={open => {
          onIsPresentedChange(open);
          if (!open) setView('options');
        }}>
        <Group
          modifiers={[
            // The sheet itself is the morphing card: two fixed detents, the
            // active one driven by state — UIKit animates the height change.
            presentationDetents([{ height: OPTIONS_H }, { height: DETAIL_H }], {
              selection: isOptions ? { height: OPTIONS_H } : { height: DETAIL_H },
              onSelectionChange: () => {},
            }),
            presentationBackground(C.sheetWhite),
            presentationDragIndicator('hidden'),
          ]}>
          <ZStack
            alignment="top"
            modifiers={[
              // Content height mirrors the active detent so the UIKit sheet
              // window and the SwiftUI content stay in lockstep during the
              // morph. FrameModifier ignores max* once height is set — split.
              frame({ height: isOptions ? OPTIONS_H : DETAIL_H, alignment: 'top' }),
              frame({ maxWidth: 100000 }),
              animation(SPRING, stateIdx),
            ]}>
            <OptionsPane
              active={isOptions}
              onSelect={openDetail}
              onClose={() => onIsPresentedChange(false)}
            />
            <DetailPane
              active={!isOptions}
              kind={detailKind}
              onClose={() => setView('options')}
            />
          </ZStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}

/** Static backdrop recreating the Family wallet settings screen. */
function WalletBackdrop({ onOpenSheet }: { onOpenSheet: () => void }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <SymbolView name="xmark" size={18} tintColor="#8E8E93" />
        <View>
          <SymbolView name="gift.fill" size={20} tintColor="#E68A00" />
          <View style={styles.giftBadge} />
        </View>
      </View>

      <View style={styles.orangeCard}>
        <View style={styles.cardRow}>
          <SymbolView name="heart.fill" size={26} tintColor="#FFFFFF" />
          <View style={styles.copyAddress}>
            <Text style={styles.copyAddressText}>Copy Address</Text>
            <SymbolView name="doc.on.doc" size={12} tintColor="rgba(255,255,255,0.85)" />
          </View>
        </View>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardName}>BFF</Text>
            <Text style={styles.cardBalance}>0.02 ETH</Text>
          </View>
          <View style={styles.customizePill}>
            <Text style={styles.customizeText}>Customize</Text>
          </View>
        </View>
      </View>

      <View style={styles.settingsList}>
        {(
          [
            ['square.grid.2x2', 'Connections'],
            ['checkmark.shield', 'Backup'],
            ['checkmark.seal', 'Approvals'],
          ] as const
        ).map(([icon, label]) => (
          <Pressable key={label} style={styles.settingsRow} onPress={onOpenSheet}>
            <SymbolView name={icon} size={18} tintColor="#3A3A3C" />
            <Text style={styles.settingsLabel}>{label}</Text>
            <View style={styles.spacer} />
            <SymbolView name="chevron.right" size={13} tintColor="#C7C7CC" />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function WalletScreen() {
  const [sheetOpen, setSheetOpen] = useState(true);

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.fallback}>
        <Text>This case uses @expo/ui/swift-ui and is iOS-only.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <WalletBackdrop onOpenSheet={() => setSheetOpen(true)} />
      <MorphingSheet isPresented={sheetOpen} onIsPresentedChange={setSheetOpen} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.screenBg,
  },
  host: {
    position: 'absolute',
    width: 1,
    height: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  giftBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5484D',
  },
  orangeCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: C.cardOrange,
    padding: 16,
    height: 168,
    justifyContent: 'space-between',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  copyAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  copyAddressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cardBalance: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  customizePill: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  customizeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingsList: {
    marginTop: 28,
    paddingHorizontal: 24,
    gap: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  spacer: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
