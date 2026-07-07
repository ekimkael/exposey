import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { CARD_FAN, CARD_SIZE, HERO_STAGE } from '@/constants/onyx';

function ChipGlyph({ tint }: { tint: string }) {
  return (
    <View style={[styles.chip, { borderColor: tint }]}>
      <View style={[styles.chipLine, { backgroundColor: tint }]} />
      <View style={[styles.chipLine, { backgroundColor: tint }]} />
    </View>
  );
}

function CardFace({ colors, wordmark, rotate, translateX, translateY, showVisa }: (typeof CARD_FAN)[number] & { showVisa?: boolean }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { transform: [{ translateX }, { translateY }, { rotate }] }]}>
      <Text style={[styles.wordmark, { color: wordmark }]}>Slash</Text>
      <ChipGlyph tint={wordmark} />
      {showVisa && (
        <View style={styles.visaBlock}>
          <Text style={styles.visaText}>VISA</Text>
          <Text style={styles.visaSubtext}>Business</Text>
        </View>
      )}
    </LinearGradient>
  );
}

export function CardStack() {
  return (
    <View style={styles.stage}>
      {CARD_FAN.map((card, index) => (
        <CardFace key={card.rotate} {...card} showVisa={index === CARD_FAN.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: HERO_STAGE.width,
    height: HERO_STAGE.height,
  },
  card: {
    position: 'absolute',
    width: CARD_SIZE.width,
    height: CARD_SIZE.height,
    borderRadius: 14,
    padding: 16,
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  chip: {
    width: 30,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  chipLine: {
    height: 1.5,
    opacity: 0.6,
  },
  visaBlock: {
    position: 'absolute',
    right: 16,
    bottom: 14,
    alignItems: 'flex-end',
  },
  visaText: {
    fontSize: 17,
    fontWeight: '700',
    fontStyle: 'italic',
    color: 'rgba(198, 202, 208, 0.85)',
  },
  visaSubtext: {
    fontSize: 9,
    color: 'rgba(198, 202, 208, 0.55)',
  },
});
