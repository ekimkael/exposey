import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { CARD_COLORS, INNER_RADIUS, ORBIT_ICONS, OUTER_RADIUS } from '@/constants/animation';
import { Spacing } from '@/constants/theme';
import { useHoarderCycle } from '@/hooks/use-hoarder-cycle';
import { useTheme } from '@/hooks/use-theme';

function CardStack({ progress }: { progress: ReturnType<typeof useSharedValue<number>>[] }) {
  return (
    <>
      {progress.map((value, index) => (
        <AnimatedCard key={index} value={value} color={CARD_COLORS[index]} />
      ))}
    </>
  );
}

/**
 * A single falling card. It stays full size and slides straight down; the
 * opaque bookmark icon (rendered after this in the tree, so it paints on
 * top) covers it near the end of its travel — it's z-order occlusion, not a
 * shrink-into-the-icon effect.
 */
function AnimatedCard({ value, color }: { value: ReturnType<typeof useSharedValue<number>>; color: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(value.value, [0, 0.15, 0.6, 1], [0, 1, 1, 0]),
    transform: [{ translateY: interpolate(value.value, [0, 1], [-140, 90]) }],
  }));
  return <Animated.View style={[styles.card, { backgroundColor: color }, style]} />;
}

/** A single badge on the orbit ring; fades and scales in as `progress` goes 0→1. */
function OrbitIcon({ progress, symbol, bg, x, y }: (typeof ORBIT_ICONS)[number] & {
  progress: ReturnType<typeof useSharedValue<number>>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: x }, { translateY: y }, { scale: interpolate(progress.value, [0, 1], [0.4, 1]) }],
  }));
  return (
    <Animated.View style={[styles.orbitIcon, { backgroundColor: bg }, style]}>
      <SymbolView name={symbol} size={18} tintColor="#ffffff" weight="semibold" />
    </Animated.View>
  );
}

/**
 * The Magpie home screen's looping hero: cards fall behind a bookmark icon
 * (with a "gulp" bulge per card), the icon rotates into an "explore" pose,
 * an orbit of app icons fades in and spins, and the tagline underneath
 * types/erases between two phrases in sync. All timeline/orchestration
 * logic lives in `useHoarderCycle` — this component only renders.
 */
export function HoarderHero() {
  const theme = useTheme();
  const { iconStyle, ringStyle, orbitGroupStyle, orbit, cardProgress, text, caret } = useHoarderCycle();

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <View style={styles.iconCluster}>
          <Animated.View style={[styles.orbitGroup, orbitGroupStyle]}>
            <Animated.View style={[styles.ring, styles.ringOuter, ringStyle]} />
            <Animated.View style={[styles.ring, styles.ringInner, ringStyle]} />
            {ORBIT_ICONS.map((icon, index) => (
              <OrbitIcon key={index} {...icon} progress={orbit} />
            ))}
          </Animated.View>
          <CardStack progress={cardProgress} />
          <Animated.View style={iconStyle}>
            <SymbolView name="bookmark.fill" size={130} tintColor={theme.text} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.bottomGroup}>
        <View style={styles.copyBlock}>
          <ThemedText style={styles.brand}>Magpie.</ThemedText>
          <ThemedText
            themeColor="textSecondary"
            style={styles.tagline}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}>
            {text}
            {caret ? '_' : ''}
          </ThemedText>
        </View>

        <Pressable
          style={({ pressed }) => [styles.cta, { backgroundColor: theme.text, opacity: pressed ? 0.8 : 1 }]}>
          <ThemedText style={styles.ctaLabel} themeColor="background">
            Get Started
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  stage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Fixed-size anchor for the rings/cards/icon so their absolute positioning
  // stays relative to the icon itself, not to `stage` (which is flex:1 and
  // can be much taller than the cluster it centers).
  iconCluster: {
    width: OUTER_RADIUS * 2,
    height: OUTER_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitGroup: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8D8DC',
  },
  ringOuter: { width: OUTER_RADIUS * 2, height: OUTER_RADIUS * 2 },
  ringInner: { width: INNER_RADIUS * 2, height: INNER_RADIUS * 2 },
  card: {
    position: 'absolute',
    width: 80,
    height: 112,
    borderRadius: 12,
    top: -40,
  },
  orbitIcon: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGroup: {
    gap: Spacing.four,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.four,
  },
  copyBlock: {
    gap: Spacing.two,
  },
  brand: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: 'BricolageGrotesque_700Bold',
  },
  tagline: {
    fontSize: 19,
    lineHeight: 26,
  },
  cta: {
    alignSelf: 'stretch',
    borderRadius: 999,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  ctaLabel: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
  },
});
