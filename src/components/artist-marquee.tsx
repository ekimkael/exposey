import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { ArtistCard } from '@/components/artist-card';
import { ARTISTS, type Artist } from '@/constants/artists';
import { CARD_HEIGHT, PITCH, RAD_TO_DEG, SLOT_COUNT, TRACK, WHEEL_RADIUS } from '@/constants/wheel';
import { useWheelGesture } from '@/hooks/use-wheel-gesture';

/** Static tick ruler on the right edge, longer ticks toward the middle. */
function Ruler() {
  return (
    <View style={styles.ruler} pointerEvents="none">
      {Array.from({ length: 17 }, (_, i) => {
        const distanceFromCenter = Math.abs(i - 8);
        return (
          <View
            key={i}
            style={{
              height: 1.5,
              width: 4 + Math.max(0, 10 - distanceFromCenter * 2),
              backgroundColor: `rgba(255,255,255,${0.7 - distanceFromCenter * 0.07})`,
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
 *
 * @param position Which viewport edge to cover.
 */
function EdgeBlur({ position }: { position: 'top' | 'bottom' }) {
  const down = position === 'top';
  const pos = down ? styles.top : styles.bottom;
  const maskColors: [string, string] = ['#FFFFFF', 'rgba(255,255,255,0)'];
  return (
    <>
      <MaskedView
        pointerEvents="none"
        style={[styles.edge, pos, { height: 120 }]}
        maskElement={
          <LinearGradient
            colors={down ? maskColors : ([...maskColors].reverse() as [string, string])}
            style={styles.fill}
          />
        }>
        <BlurView intensity={40} tint="dark" style={styles.fill} />
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
 * at the edges (R·(1−cos θ)) and the card is rotated by θ itself — fixed
 * to the wheel like a sun ray / a number on a rotary dial. Cards on the
 * hidden half of the ring are culled with opacity.
 *
 * @param artist    Card content and static sticker tilt/offset.
 * @param index     Slot index on the ring (0..SLOT_COUNT-1).
 * @param progress  Wheel arc distance from useWheelGesture.
 * @param viewportH Measured height of the wheel viewport.
 */
function WheelCard({
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
    let arcDistance = (index * PITCH - progress.value) % TRACK;
    if (arcDistance > TRACK / 2) arcDistance -= TRACK;
    if (arcDistance < -TRACK / 2) arcDistance += TRACK;
    const theta = arcDistance / WHEEL_RADIUS;
    const behind = Math.abs(theta) > Math.PI / 2;
    return {
      opacity: behind ? 0 : 1,
      transform: [
        { translateY: WHEEL_RADIUS * Math.sin(theta) },
        { translateX: artist.offsetX - WHEEL_RADIUS * (1 - Math.cos(theta)) },
        { rotate: `${artist.tilt + theta * RAD_TO_DEG}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.cardHolder, { top: centerTop }, animated]} pointerEvents="none">
      <ArtistCard artist={artist} />
    </Animated.View>
  );
}

/**
 * Gesture-driven rotary wheel of artist cards: the user's vertical pan
 * spins the ring, release snaps to the nearest slot (see useWheelGesture).
 */
export function ArtistMarquee() {
  const { progress, panGesture } = useWheelGesture();
  const [viewportH, setViewportH] = useState(0);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.viewport} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
        {viewportH > 0
          ? Array.from({ length: SLOT_COUNT }, (_, index) => (
              <WheelCard
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
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
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
