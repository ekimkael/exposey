/**
 * Apple-Intelligence-style animated glow button.
 *
 * Approach (no Skia / no extra deps):
 *  - Three SVG Rect layers share the same LinearGradient (x1/y1/x2/y2 animated
 *    via useAnimatedProps) to simulate a rotating perimeter gradient.
 *  - Outermost layer: thick, very transparent → soft halo bleed
 *  - Middle layer: medium width, moderate opacity → border glow
 *  - Inner layer: exact border width, full opacity → crisp gradient edge
 *  - Gradient colors cycle first→last→first for a seamless loop.
 *
 * Limitation vs Skia: the gradient follows a straight line, not the
 * perimeter arc, so the sweep isn't perfectly conic. At normal animation
 * speed (~2.5 s/rev) the difference is imperceptible.
 */
import React, { useEffect } from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Apple Intelligence signature gradient — first color repeated at end for seamless loop
const COLORS = ['#BF5AF2', '#5AC8FA', '#FFFFFF', '#FF2D55', '#BF5AF2'];
const STOPS  = COLORS.map((c, i) => ({ offset: i / (COLORS.length - 1), color: c }));

const SPEED    = 2400; // ms per full revolution
const BORDER   = 3;   // visible border width (px)
const W        = 180;
const H        = 52;

interface GlowButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GlowButton({ label, onPress, style }: GlowButtonProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: SPEED, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  // Rotate a linear gradient around the button's centroid
  const cx = W / 2;
  const cy = H / 2;
  const r  = Math.hypot(cx, cy) * 1.15;

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
        <Animated.View style={[s.pill, pressed && s.pressed]}>
          {/* SVG glow layers */}
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <AnimatedLinearGradient
                id="ai-glow"
                gradientUnits="userSpaceOnUse"
                animatedProps={gradProps}
              >
                {STOPS.map(({ offset, color }) => (
                  <Stop key={color + offset} offset={offset} stopColor={color} />
                ))}
              </AnimatedLinearGradient>
            </Defs>

            {/* Wide soft halo */}
            <Rect
              x={8} y={8} width={W - 16} height={H - 16}
              rx={(H - 16) / 2}
              fill="none" stroke="url(#ai-glow)"
              strokeWidth={20} opacity={0.12}
            />
            {/* Mid glow */}
            <Rect
              x={5} y={5} width={W - 10} height={H - 10}
              rx={(H - 10) / 2}
              fill="none" stroke="url(#ai-glow)"
              strokeWidth={10} opacity={0.22}
            />
            {/* Crisp border */}
            <Rect
              x={BORDER / 2} y={BORDER / 2}
              width={W - BORDER} height={H - BORDER}
              rx={(H - BORDER) / 2}
              fill="none" stroke="url(#ai-glow)"
              strokeWidth={BORDER} opacity={1}
            />
          </Svg>

          {/* Button body — sits on top of SVG layers */}
          <Animated.View style={s.body}>
            <Animated.Text style={s.label}>{label}</Animated.Text>
          </Animated.View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root:    { alignSelf: 'center' },
  pill:    { width: W, height: H },
  pressed: { opacity: 0.82 },
  body: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    margin:       BORDER,
    borderRadius: (H - BORDER * 2) / 2,
    backgroundColor: '#0B0B0F',
    alignItems:   'center',
    justifyContent: 'center',
  },
  label: {
    color:        '#FFFFFF',
    fontSize:     15,
    fontWeight:   '500',
    letterSpacing: 0.15,
  },
});
