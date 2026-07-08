import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const HEADLINE = 'A new home for your internet hoarding tendencies';
const SUBLINE = 'A new way to explore a new city';

const CARDS = ['#E7C79A', '#D98E73', '#8FA9C0', '#C24B4B', '#232323'];

const OUTER_RADIUS = 160;
const INNER_RADIUS = 105;

function orbitIcon(symbol: Parameters<typeof SymbolView>[0]['name'], bg: string, angleDeg: number, ring: 'outer' | 'inner') {
  const rad = (angleDeg * Math.PI) / 180;
  const radius = ring === 'outer' ? OUTER_RADIUS : INNER_RADIUS;
  return { symbol, bg, x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

// 3 icons on the outer ring (evenly spaced triangle), 2 on the inner ring
// (flanking the top), for 5 total — less cluttered than one-per-45°.
const ORBIT_ICONS = [
  orbitIcon('paperplane.fill', '#3E8BF0', -90, 'outer'),
  orbitIcon('safari.fill', '#3E8BF0', 30, 'outer'),
  orbitIcon('fork.knife', '#E4483B', 150, 'outer'),
  orbitIcon('music.note', '#111111', 180, 'inner'),
  orbitIcon('camera.fill', '#C13584', 0, 'inner'),
];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function typeInto(setText: (value: string) => void, full: string, alive: { current: boolean }) {
  for (let i = 1; i <= full.length; i++) {
    if (!alive.current) return;
    setText(full.slice(0, i));
    await sleep(26);
  }
}

async function eraseAll(setText: (value: string) => void, full: string, alive: { current: boolean }) {
  for (let i = full.length; i >= 0; i--) {
    if (!alive.current) return;
    setText(full.slice(0, i));
    await sleep(16);
  }
}

function CardStack({ progress }: { progress: ReturnType<typeof useSharedValue<number>>[] }) {
  return (
    <>
      {progress.map((value, index) => (
        <AnimatedCard key={index} value={value} color={CARDS[index]} />
      ))}
    </>
  );
}

function AnimatedCard({ value, color }: { value: ReturnType<typeof useSharedValue<number>>; color: string }) {
  // Cards stay full size and slide straight down; the opaque icon (rendered
  // after this in the tree, so it paints on top) covers them near the end —
  // it's z-order occlusion, not a shrink-into-the-icon effect.
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(value.value, [0, 0.12, 0.8, 1], [0, 1, 1, 0]),
    transform: [{ translateY: interpolate(value.value, [0, 1], [-140, 90]) }],
  }));
  return <Animated.View style={[styles.card, { backgroundColor: color }, style]} />;
}

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

export function HoarderHero() {
  const theme = useTheme();
  const rotate = useSharedValue(0);
  const orbit = useSharedValue(0);
  const cardProgress = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const [text, setText] = useState('');
  const [caret, setCaret] = useState(false);
  const alive = useRef(true);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotate.value, [0, 1], [0, 45])}deg` }],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: orbit.value }));

  useEffect(() => {
    alive.current = true;

    async function playCycle(isFirst: boolean) {
      if (!isFirst) {
        setCaret(true);
        await eraseAll(setText, SUBLINE, alive);
        if (!alive.current) return;
      }

      cardProgress.forEach((value) => {
        value.value = 0;
      });
      rotate.value = 0;
      orbit.value = 0;
      setCaret(true);

      cardProgress.forEach((value, index) => {
        value.value = withDelay(index * 220, withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) }));
      });
      await typeInto(setText, HEADLINE, alive);
      setCaret(false);
      await sleep(400);
      if (!alive.current) return;

      rotate.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
      await sleep(700);
      if (!alive.current) return;

      orbit.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.back(1.4)) });
      await sleep(650);
      if (!alive.current) return;

      setCaret(true);
      await eraseAll(setText, HEADLINE, alive);
      await typeInto(setText, SUBLINE, alive);
      setCaret(false);
      await sleep(1200);
      if (!alive.current) return;

      orbit.value = withTiming(0, { duration: 250 });
      rotate.value = withTiming(0, { duration: 250 });
      await sleep(300);
    }

    (async () => {
      let isFirst = true;
      while (alive.current) {
        await playCycle(isFirst);
        isFirst = false;
      }
    })();

    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <View style={styles.iconCluster}>
          <Animated.View style={[styles.ring, styles.ringOuter, ringStyle]} />
          <Animated.View style={[styles.ring, styles.ringInner, ringStyle]} />
          {ORBIT_ICONS.map((icon, index) => (
            <OrbitIcon key={index} {...icon} progress={orbit} />
          ))}
          <CardStack progress={cardProgress} />
          <Animated.View style={iconStyle}>
            <SymbolView name="bookmark.fill" size={130} tintColor={theme.text} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.bottomGroup}>
        <View style={styles.copyBlock}>
          <ThemedText style={styles.brand}>Magpie.</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.tagline} numberOfLines={2}>
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
    fontWeight: '700',
  },
  tagline: {
    fontSize: 19,
    lineHeight: 26,
  },
  cta: {
    alignSelf: 'stretch',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  ctaLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
});
