import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const CARD_W = 134;
const CARD_H = 156;
const RADIUS = 32;

// Alternating light/dark stops → crisp vertical louvers (the ribbed building).
const LOUVERS = ['#d7dbde', '#101012', '#c3c7cb', '#0d0d0f', '#d7dbde', '#101012', '#c3c7cb', '#0d0d0f', '#d7dbde'] as const;

/**
 * A card that fades + slides up on mount, then bobs gently forever.
 * Entrance and idle bob are separate shared values summed in the transform,
 * so the loop never fights the entrance. Index staggers both phases.
 */
function FloatingCard({ children, index }: { children: ReactNode; index: number }) {
  const enter = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(300 + index * 110, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }));
    bob.value = withDelay(
      index * 260,
      withRepeat(withTiming(1, { duration: 2600 + index * 180, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [enter, bob, index]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 26 + (bob.value * 8 - 4) }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

function CardFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {children}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.45)']}
        style={styles.scrim}
        pointerEvents="none"
      />
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

function Bar({ w, o = 0.5 }: { w: number; o?: number }) {
  return <View style={[styles.bar, { width: w, backgroundColor: `rgba(255,255,255,${o})` }]} />;
}

function LocationCard() {
  return (
    <CardFrame label="Location">
      <View style={styles.mapFill}>
        <View style={styles.mapWater} />
        <View style={styles.mapRoad} />
        <View style={styles.mapPin} />
      </View>
    </CardFrame>
  );
}

function TasksCard() {
  return (
    <CardFrame label="Tasks">
      <View style={styles.tasks}>
        <View style={styles.taskRow}>
          <View style={styles.checkbox} />
          <Bar w={46} />
        </View>
        <View style={[styles.taskRow, styles.taskRowIndent]}>
          <SymbolView name="checkmark" size={16} tintColor="rgba(255,255,255,0.7)" />
          <Bar w={38} o={0.35} />
        </View>
        <View style={styles.taskRow}>
          <View style={styles.checkbox} />
          <Bar w={46} />
        </View>
      </View>
    </CardFrame>
  );
}

function PhotoCard() {
  // Vertical louvers evoke the ribbed building facade in the reference photo.
  return (
    <CardFrame label="Photo">
      <LinearGradient
        colors={LOUVERS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.photoFill}
      />
      <View style={styles.photoFigure} />
    </CardFrame>
  );
}

function WebsiteCard() {
  return (
    <CardFrame label="Website">
      <View style={styles.website}>
        <View style={styles.searchBar}>
          <SymbolView name="magnifyingglass" size={13} tintColor="rgba(255,255,255,0.7)" />
          <SymbolView name="arrow.counterclockwise" size={13} tintColor="rgba(255,255,255,0.7)" />
        </View>
        <View style={styles.webLines}>
          <Bar w={70} o={0.4} />
          <Bar w={54} o={0.28} />
          <Bar w={62} o={0.28} />
        </View>
      </View>
    </CardFrame>
  );
}

export function OnboardingCards() {
  const cards = [LocationCard, TasksCard, PhotoCard, WebsiteCard];
  return (
    <View style={styles.shelf}>
      {cards.map((Card, i) => (
        <FloatingCard key={i} index={i}>
          <Card />
        </FloatingCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    flexDirection: 'row',
    gap: 14,
    // Row is wider than the screen; centering makes the outer cards (Location /
    // Website) bleed off both edges and clip at the device bezel, per reference.
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS,
    backgroundColor: 'rgba(64,67,62,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    zIndex: 2,
  },
  bar: {
    height: 7,
    borderRadius: 4,
  },
  // Tasks
  tasks: {
    position: 'absolute',
    top: 22,
    left: 18,
    gap: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskRowIndent: {
    marginLeft: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  // Photo
  photoFill: {
    // expo-linear-gradient needs explicit dimensions under Fabric; inset-only
    // (absoluteFill) sizing renders it at zero size.
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
  },
  photoFigure: {
    position: 'absolute',
    bottom: 42,
    left: '46%',
    width: 7,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#050505',
  },
  // Website
  website: {
    position: 'absolute',
    top: 20,
    left: 18,
    right: 18,
    gap: 12,
  },
  searchBar: {
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  webLines: {
    gap: 9,
  },
  // Location / map
  mapFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#a9c9a0',
  },
  mapWater: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 90,
    height: 90,
    backgroundColor: '#8fb6d8',
    transform: [{ rotate: '35deg' }],
  },
  mapRoad: {
    position: 'absolute',
    top: '55%',
    left: -10,
    right: -10,
    height: 10,
    backgroundColor: '#f2efe6',
    transform: [{ rotate: '-8deg' }],
  },
  mapPin: {
    position: 'absolute',
    top: '38%',
    left: '55%',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f6871f',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
});
