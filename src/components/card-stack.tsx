import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { CARD_FAN, CARD_SIZE, HERO_STAGE } from '@/constants/cards';
import { ONYX_COLORS } from '@/constants/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function ChipGlyph({ tint }: { tint: string }) {
  return (
    <View style={[styles.chip, { borderColor: tint }]}>
      <View style={[styles.chipLine, { backgroundColor: tint }]} />
      <View style={[styles.chipLine, { backgroundColor: tint }]} />
    </View>
  );
}

interface CardFaceProps {
  colors: readonly [string, string];
  wordmark: string;
  /** Animated transform — see {@link useKeyboardShrink}'s `cardAnims`. */
  rotate: Animated.AnimatedInterpolation<string>;
  translateX: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
  showVisa?: boolean;
}

function CardFace({ colors, wordmark, rotate, translateX, translateY, showVisa }: CardFaceProps) {
  return (
    <AnimatedLinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { transform: [{ translateX }, { translateY }, { rotate }] }]}>
      <Text style={[styles.wordmark, { color: wordmark }]}>Onyx</Text>
      <ChipGlyph tint={wordmark} />
      {showVisa && (
        <View style={styles.visaBlock}>
          <Text style={styles.visaText}>VISA</Text>
          <Text style={styles.visaSubtext}>Business</Text>
        </View>
      )}
    </AnimatedLinearGradient>
  );
}

interface CardStackProps {
  /** Per-card animated transform, matching `CARD_FAN` order — see
   * {@link useKeyboardShrink}'s `cardAnims`. */
  cardAnims: { rotate: Animated.AnimatedInterpolation<string>; translateX: Animated.AnimatedInterpolation<number>; translateY: Animated.AnimatedInterpolation<number> }[];
}

/** The gold/silver/black card-stack hero illustration. Purely presentational
 * — geometry lives in {@link CARD_FAN}; the shrink (height, scale) and
 * fan-closing transform are driven by the caller via
 * {@link useKeyboardShrink}. */
export function CardStack({ cardAnims }: CardStackProps) {
  return (
    <View style={styles.stage}>
      {CARD_FAN.map((card, index) => (
        <CardFace key={card.resting.rotate} colors={card.colors} wordmark={card.wordmark} {...cardAnims[index]} showVisa={index === CARD_FAN.length - 1} />
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
    color: ONYX_COLORS.visaText,
  },
  visaSubtext: {
    fontSize: 9,
    color: ONYX_COLORS.visaSubtext,
  },
});
