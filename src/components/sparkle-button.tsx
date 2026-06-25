/**
 * Sparkle button — sweeping border spark + orbiting star particles.
 *
 * Technique (translated from CSS to Reanimated + react-native-svg):
 *  1. A square SVG gradient (white at one edge) is placed inside an
 *     overflow:hidden pill container and rotated continuously → the
 *     gradient tip sweeps around the border.
 *  2. An inner backdrop View covers the button body so only the thin
 *     border ring reveals the sweeping light.
 *  3. Star particles are positioned around the button and each orbits
 *     via Reanimated rotate + transformOrigin (RN ≥ 0.82).
 *
 * @see https://codepen.io/jh3y/pen/LYJMPBL
 * @module components/sparkle-button
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

// 4-pointed sparkle star path from the CodePen
const STAR =
  'M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z';

const BTN_H = 52;
// Horizontal padding from bottomSection (28px × 2 sides)
const H_PAD = 56;

// Particle pen extends 36px beyond button on each side
const PEN_BLEED = 36;

// Deterministic particle configs — positions are % of particle-pen dimensions
const PARTICLES = [
  { x: 15, y: 30, size: 8,  dur: 8000,  a: 0.70, ox:  520, oy: -430, rev: false },
  { x: 78, y: 15, size: 10, dur: 12500, a: 0.55, ox: -600, oy:  380, rev: true  },
  { x: 88, y: 58, size: 7,  dur: 9000,  a: 0.65, ox:  440, oy:  510, rev: false },
  { x: 22, y: 72, size: 9,  dur: 14000, a: 0.50, ox: -520, oy: -320, rev: true  },
  { x: 65, y: 82, size: 11, dur: 7500,  a: 0.75, ox:  360, oy: -480, rev: false },
  { x: 10, y: 50, size: 7,  dur: 11000, a: 0.60, ox: -640, oy:  400, rev: true  },
  { x: 50, y: 10, size: 8,  dur: 10000, a: 0.65, ox:  480, oy:  550, rev: false },
  { x: 92, y: 80, size: 6,  dur: 13000, a: 0.55, ox: -400, oy: -370, rev: true  },
] as const;

type ParticleCfg = (typeof PARTICLES)[number];

function StarParticle({
  p,
  penW,
  penH,
}: {
  p: ParticleCfg;
  penW: number;
  penH: number;
}) {
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
          left: (p.x / 100) * penW - p.size / 2,
          top: (p.y / 100) * penH - p.size / 2,
          opacity: p.a,
          // transformOrigin: rotate each star around a far-off pivot so it orbits
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

type Props = {
  label: string;
  leftSlot?: React.ReactNode;
  onPress?: () => void;
};

/** Secondary CTA pill with rotating border spark and orbiting sparkle particles. */
export function SparkleButton({ label, leftSlot, onPress }: Props) {
  const { width } = useWindowDimensions();
  const BW = width - H_PAD; // button width matches bottomSection layout

  // Diagonal of button rect — the rotating square must cover the whole pill
  const DIAG = Math.ceil(Math.sqrt(BW * BW + BTN_H * BTN_H));

  // Particle pen dimensions (button + bleed on each side)
  const penW = BW + PEN_BLEED * 2;
  const penH = BTN_H + PEN_BLEED * 2;

  const sparkRot = useSharedValue(0);

  useEffect(() => {
    sparkRot.value = withRepeat(
      withTiming(360, { duration: 1_800, easing: Easing.linear }),
      -1,
    );
  }, [sparkRot]);

  const sparkStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkRot.value}deg` }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    // Outer wrapper sized to button; particles bleed outside via absolute positioning
    <View style={styles.wrapper}>
      {/* ── Particle pen ── */}
      <View
        style={[
          styles.particlePen,
          {
            width: penW,
            height: penH,
            left: -PEN_BLEED,
            top: -PEN_BLEED,
          },
        ]}
        pointerEvents="none"
      >
        {PARTICLES.map((p, i) => (
          <StarParticle key={i} p={p} penW={penW} penH={penH} />
        ))}
      </View>

      {/* ── Pill with sweeping border spark ── */}
      <View style={styles.pill} pointerEvents="box-none">
        {/* Rotating gradient square — the white streak sweeps the border */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: DIAG,
              height: DIAG,
              top: (BTN_H - DIAG) / 2,
              left: (BW - DIAG) / 2,
            },
            sparkStyle,
          ]}
          pointerEvents="none"
        >
          <Svg width={DIAG} height={DIAG}>
            <Defs>
              <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0"    stopColor="white" stopOpacity="0" />
                <Stop offset="0.87" stopColor="white" stopOpacity="0" />
                <Stop offset="0.93" stopColor="white" stopOpacity="1" />
                <Stop offset="1"    stopColor="white" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={DIAG} height={DIAG} fill="url(#sparkGrad)" />
          </Svg>
        </Animated.View>

        {/* Backdrop: covers button interior — only the ~2px ring shows the spark */}
        <View style={styles.backdrop} pointerEvents="none" />

        {/* Actual pressable content */}
        <Pressable
          onPress={handlePress}
          style={styles.content}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {leftSlot}
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: BTN_H,
    alignSelf: 'stretch',
  },
  particlePen: {
    position: 'absolute',
  },
  pill: {
    overflow: 'hidden',
    borderRadius: BTN_H / 2,
    height: BTN_H,
    alignSelf: 'stretch',
  },
  backdrop: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: BTN_H / 2 - 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
});
