/**
 * Apple-Intelligence-style animated glow button.
 *
 * Visual structure (bottom → top):
 *  1. Wide semi-transparent strokes → outer color bleed / halo
 *  2. Gradient-filled pill (the visible button body)
 *  3. Subtle white inner highlight border
 *  4. Text label
 *
 * Animation: LinearGradient x1/y1/x2/y2 rotated via useAnimatedProps
 * giving a slow sweeping conic-like effect without Skia.
 *
 * Colors lifted from the Apple Intelligence reference (purple → red → amber).
 */
import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Apple Intelligence palette: deep indigo → violet → crimson → orange → amber
const COLORS = ['#3730E6', '#7B1FA2', '#B71C1C', '#E65100', '#F57F17', '#3730E6'];
const STOPS  = COLORS.map((c, i) => ({ offset: i / (COLORS.length - 1), color: c }));

const SPEED = 3500; // ms per revolution
const W     = 220;
const H     = 58;
const RX    = H / 2;

interface GlowButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  sharedTransitionTag?: string;
}

export function GlowButton({ label, onPress, style, sharedTransitionTag }: GlowButtonProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: SPEED, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const cx = W / 2;
  const cy = H / 2;
  const r  = Math.hypot(cx, cy) * 1.2;

  const gradProps = useAnimatedProps(() => {
    'worklet';
    const a = t.value * 2 * Math.PI;
    return {
      x1: cx + r * Math.cos(a),
      y1: cy + r * Math.sin(a),
      x2: cx - r * Math.cos(a),
      y2: cy - r * Math.sin(a),
    };
  });

  return (
    <Pressable onPress={onPress} style={[s.root, style]}>
      {({ pressed }) => (
        <Animated.View
          style={[s.pill, pressed && s.pressed]}
          sharedTransitionTag={sharedTransitionTag}
        >
          <Svg width={W} height={H} style={[StyleSheet.absoluteFill, { overflow: 'visible' }]}>
            <Defs>
              <AnimatedLinearGradient
                id="ai"
                gradientUnits="userSpaceOnUse"
                animatedProps={gradProps}
              >
                {STOPS.map(({ offset, color }) => (
                  <Stop key={`${color}${offset}`} offset={offset} stopColor={color} />
                ))}
              </AnimatedLinearGradient>
            </Defs>

            {/* Outer halo — wide bleed */}
            <Rect
              x={-16} y={-16} width={W + 32} height={H + 32} rx={RX + 16}
              fill="none" stroke="url(#ai)" strokeWidth={32} opacity={0.18}
            />
            {/* Mid glow */}
            <Rect
              x={-6} y={-6} width={W + 12} height={H + 12} rx={RX + 6}
              fill="none" stroke="url(#ai)" strokeWidth={14} opacity={0.32}
            />
            {/* Button fill */}
            <Rect x={0} y={0} width={W} height={H} rx={RX} fill="url(#ai)" />
            {/* Inner highlight border */}
            <Rect
              x={1} y={1} width={W - 2} height={H - 2} rx={RX - 1}
              fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5}
            />
          </Svg>

          <View style={s.textLayer}>
            <Animated.Text style={s.label}>{label}</Animated.Text>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root:      { alignSelf: 'center' },
  pill:      { width: W, height: H },
  pressed:   { opacity: 0.82 },
  textLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color:         '#FFFFFF',
    fontSize:      16,
    fontWeight:    '600',
    letterSpacing: 0.2,
  },
});
