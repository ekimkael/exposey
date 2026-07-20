import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { ArtistCard, CARD_HEIGHT } from '@/components/artist-card';
import { ARTISTS, type Artist } from '@/constants/artists';

const GAP = 46;
const PITCH = CARD_HEIGHT + GAP;
/**
 * Full-circle carousel: the 8 artists are laid out twice around a 16-slot
 * wheel (22.5° per card, R ≈ 382pt so adjacent cards sit one PITCH apart on
 * the arc). The wheel spins continuously — 8 slots per 4.4s like the
 * reference loop — and wraps seamlessly because slot i and i+8 hold the
 * same artist.
 */
const SLOT_COUNT = 16;
const TRACK = SLOT_COUNT * PITCH;
const WHEEL_RADIUS = TRACK / (2 * Math.PI);
const CYCLE_MS = 4400;
const RAD_TO_DEG = 180 / Math.PI;

/** Static tick ruler on the right edge, longer ticks toward the middle. */
function Ruler() {
  return (
    <View style={styles.ruler} pointerEvents="none">
      {Array.from({ length: 17 }, (_, i) => {
        const d = Math.abs(i - 8);
        return (
          <View
            key={i}
            style={{
              height: 1.5,
              width: 4 + Math.max(0, 10 - d * 2),
              backgroundColor: `rgba(255,255,255,${0.7 - d * 0.07})`,
              marginVertical: 2.5,
              alignSelf: 'flex-end',
            }}
          />
        );
      })}
    </View>
  );
}

/**
 * Progressive edge blur: a BlurView masked by a vertical gradient, so the
 * blur fades out toward the center with no hard edge, plus a short black
 * fade at the very edge like the reference.
 */
function EdgeBlur({ position }: { position: 'top' | 'bottom' }) {
  const down = position === 'top';
  const pos = down ? styles.top : styles.bottom;
  const solid = { locations: [0, 1] as const, colors: ['#FFFFFF', 'rgba(255,255,255,0)'] as const };
  return (
    <>
      <MaskedView
        pointerEvents="none"
        style={[styles.edge, pos, { height: 120 }]}
        maskElement={
          <LinearGradient
            colors={down ? solid.colors : [...solid.colors].reverse() as [string, string]}
            style={{ flex: 1 }}
          />
        }>
        <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
      </MaskedView>
      <LinearGradient
        colors={down ? ['#000000', 'rgba(0,0,0,0)'] : ['rgba(0,0,0,0)', '#000000']}
        style={[styles.edge, pos, { height: 60 }]}
        pointerEvents="none"
      />
    </>
  );
}

/**
 * One card riding the wheel. Its slot's arc distance from the viewport
 * center maps to an angle θ: y = R·sin θ (vertical travel), x curves away
 * at the edges (R·(1−cos θ)) and the card's rotation is the tangent angle,
 * so the whole ring turns as one rigid carousel.
 */
function CarouselCard({
  artist,
  index,
  progress,
  viewportH,
}: {
  artist: Artist;
  index: number;
  progress: SharedValue<number>;
  viewportH: number;
}) {
  const centerTop = viewportH / 2 - CARD_HEIGHT / 2;
  const animated = useAnimatedStyle(() => {
    let d = (index * PITCH - progress.value) % TRACK;
    if (d > TRACK / 2) d -= TRACK;
    if (d < -TRACK / 2) d += TRACK;
    const theta = d / WHEEL_RADIUS;
    const behind = Math.abs(theta) > Math.PI / 2;
    return {
      opacity: behind ? 0 : 1,
      transform: [
        { translateY: WHEEL_RADIUS * Math.sin(theta) },
        { translateX: artist.offsetX - WHEEL_RADIUS * (1 - Math.cos(theta)) },
        { rotate: `${artist.tilt - theta * RAD_TO_DEG}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.cardHolder, { top: centerTop }, animated]} pointerEvents="none">
      <ArtistCard artist={artist} />
    </Animated.View>
  );
}

/** Continuously spinning full-circle carousel of artist cards. */
export function ArtistMarquee() {
  const progress = useSharedValue(0);
  const [viewportH, setViewportH] = useState(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(TRACK / 2, { duration: CYCLE_MS, easing: Easing.linear }),
      -1,
    );
  }, [progress]);

  return (
    <View style={styles.viewport} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
      {viewportH > 0
        ? Array.from({ length: SLOT_COUNT }, (_, index) => (
            <CarouselCard
              key={index}
              artist={ARTISTS[index % ARTISTS.length]}
              index={index}
              progress={progress}
              viewportH={viewportH}
            />
          ))
        : null}
      <Ruler />
      <EdgeBlur position="top" />
      <EdgeBlur position="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  cardHolder: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  top: { top: 0 },
  bottom: { bottom: 0 },
  ruler: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -40,
  },
});
