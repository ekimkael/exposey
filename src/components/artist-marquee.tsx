import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
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
/** Rotary-dial timeline measured on the reference (4.4s loop): advance 4 slots, hold, rewind, hold. */
const ADVANCE_SLOTS = 4;
const ADVANCE_MS = 2400;
const HOLD_MS = 600;
const REWIND_MS = 600;
const END_HOLD_MS = 800;

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
 * One card slot: rotation and x-shift depend on the card's position in the
 * viewport (barrel effect) — flat at center (base tilt only), rocked back
 * ~-18° and shifted left near the bottom edge, slightly positive at the top.
 */
function DialSlot({
  artist,
  index,
  scrollY,
  viewportH,
}: {
  artist: Artist;
  index: number;
  scrollY: SharedValue<number>;
  viewportH: number;
}) {
  const half = viewportH / 2;
  const animated = useAnimatedStyle(() => {
    const d = index * PITCH + PITCH / 2 + scrollY.value - half;
    return {
      transform: [
        { translateX: artist.offsetX + interpolate(d, [-half, 0, half], [-6, 0, -16], 'clamp') },
        { rotate: `${artist.tilt + interpolate(d, [-half, 0, half], [6, 0, -18], 'clamp')}deg` },
      ],
    };
  });

  return (
    <View style={styles.slot}>
      <Animated.View style={animated}>
        <ArtistCard artist={artist} />
      </Animated.View>
    </View>
  );
}

/** Rotary-dial marquee: winds up 4 slots, pauses, springs back, pauses, loops. */
export function ArtistMarquee() {
  const scrollY = useSharedValue(0);
  const [viewportH, setViewportH] = useState(0);

  useEffect(() => {
    const distance = -ADVANCE_SLOTS * PITCH;
    scrollY.value = 0;
    scrollY.value = withRepeat(
      withSequence(
        withTiming(distance, { duration: ADVANCE_MS, easing: Easing.inOut(Easing.cubic) }),
        withTiming(distance, { duration: HOLD_MS }),
        withTiming(0, { duration: REWIND_MS, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: END_HOLD_MS }),
      ),
      -1,
    );
  }, [scrollY]);

  const containerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scrollY.value }] }));

  return (
    <View style={styles.viewport} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
      {viewportH > 0 ? (
        <Animated.View style={containerStyle}>
          {ARTISTS.map((artist, index) => (
            <DialSlot key={artist.name} artist={artist} index={index} scrollY={scrollY} viewportH={viewportH} />
          ))}
        </Animated.View>
      ) : null}
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
  slot: {
    height: PITCH,
    alignItems: 'center',
    justifyContent: 'center',
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
