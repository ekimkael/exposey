/**
 * Orbiting star particles — absolute overlay for use inside any View.
 * Each particle rotates around a far-off transformOrigin pivot so it
 * traces a large circular orbit at its own speed.
 *
 * Place as the FIRST child of a `position: 'relative'` container so
 * content renders on top. Pass `pointerEvents="none"` on the parent or
 * use the built-in `style` prop.
 *
 * @module components/sparkle-particles
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const STAR =
  'M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z';

// x/y are % of the parent container; ox/oy are % transformOrigin pivots
const PARTICLES = [
  { x:  8, y: 12, size: 10, dur:  8000, a: 0.65, ox:  500, oy: -420, rev: false },
  { x: 82, y:  8, size:  8, dur: 11500, a: 0.55, ox: -580, oy:  360, rev: true  },
  { x: 92, y: 35, size: 11, dur:  9500, a: 0.70, ox:  420, oy:  530, rev: false },
  { x:  5, y: 52, size:  7, dur: 14000, a: 0.50, ox: -500, oy: -310, rev: true  },
  { x: 72, y: 60, size:  9, dur:  7200, a: 0.75, ox:  370, oy: -490, rev: false },
  { x: 18, y: 74, size: 12, dur: 12000, a: 0.60, ox: -650, oy:  410, rev: true  },
  { x: 88, y: 80, size:  7, dur: 10500, a: 0.65, ox:  460, oy:  560, rev: false },
  { x: 40, y: 95, size:  9, dur:  8800, a: 0.55, ox: -400, oy: -380, rev: true  },
  { x: 60, y: 22, size:  6, dur: 13000, a: 0.60, ox:  540, oy:  390, rev: false },
  { x: 25, y: 40, size:  8, dur:  9000, a: 0.70, ox: -470, oy: -520, rev: true  },
] as const;

type P = (typeof PARTICLES)[number];

function Star({ p }: { p: P }) {
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = withRepeat(
      withTiming(p.rev ? -360 : 360, { duration: p.dur, easing: Easing.linear }),
      -1,
    );
  }, [rot, p.dur, p.rev]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          // % positioning is relative to the parent container dimensions
          left: `${p.x}%` as unknown as number,
          top: `${p.y}%` as unknown as number,
          opacity: p.a,
          transformOrigin: `${p.ox}% ${p.oy}%`,
        },
        anim,
      ]}
    >
      <Svg width={p.size} height={p.size} viewBox="0 0 15 15">
        <Path d={STAR} fill="rgba(255,255,255,0.9)" />
      </Svg>
    </Animated.View>
  );
}

type Props = { style?: ViewStyle };

/** Drop inside any View as first child to get ambient sparkle particles. */
export function SparkleParticles({ style }: Props) {
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {PARTICLES.map((p, i) => (
        <Star key={i} p={p} />
      ))}
    </View>
  );
}
