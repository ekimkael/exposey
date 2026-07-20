import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { ArtistCard, CARD_HEIGHT } from '@/components/artist-card';
import { ARTISTS } from '@/constants/artists';

const GAP = 46;
const PITCH = CARD_HEIGHT + GAP;
const CYCLE = ARTISTS.length * PITCH;
/** Reference video loops all 8 cards in ~4.4s */
const CYCLE_MS = 4400;

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
 * Infinite upward marquee: the artist list is rendered twice and translated
 * by one full cycle with a linear loop, so the seam is invisible.
 */
export function ArtistMarquee() {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withRepeat(withTiming(-CYCLE, { duration: CYCLE_MS, easing: Easing.linear }), -1);
  }, [y]);

  const scroll = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <View style={styles.viewport}>
      <Animated.View style={scroll}>
        {[0, 1].map((copy) => (
          <View key={copy}>
            {ARTISTS.map((artist) => (
              <View key={artist.name} style={styles.slot}>
                <ArtistCard artist={artist} />
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
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
