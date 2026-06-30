/**
 * @file glow-button.tsx
 * @description Apple-Intelligence-style animated glow button — no Skia, no extra deps.
 *
 * ## Visual structure (back → front)
 * 1. Wide semi-transparent stroke  → soft outer halo bleed
 * 2. Medium stroke                 → intermediate glow ring
 * 3. Crisp `BORDER`-wide stroke    → sharp gradient border
 * 4. Dark pill body (View)         → button background
 * 5. Label (Text)                  → foreground text
 *
 * ## Animation
 * A `LinearGradient` is rotated by animating its `x1/y1/x2/y2` endpoints
 * around the button's centroid via `useAnimatedProps`. The result approximates
 * a conic sweep without requiring `@shopify/react-native-skia`.
 *
 * ## Customisation
 * Tweak `COLORS`, `SPEED`, `BORDER`, `WIDTH`, and `HEIGHT` at the top of the file.
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

/** Apple Intelligence signature palette — first color repeated at the end for a seamless loop. */
const COLORS = ['#BF5AF2', '#5AC8FA', '#FFFFFF', '#FF2D55', '#BF5AF2'];
const STOPS  = COLORS.map((color, i) => ({ offset: i / (COLORS.length - 1), color }));

const SPEED  = 2400; /** ms per full gradient revolution */
const BORDER = 3;    /** visible border stroke width in pixels */
const WIDTH  = 180;  /** pill width in pixels */
const HEIGHT = 52;   /** pill height in pixels */

export interface GlowButtonProps {
  /** Text displayed inside the pill. */
  label: string;
  /** Called when the button is pressed. Typically provided by `Link.AppleZoom`. */
  onPress?: () => void;
  /** Extra styles applied to the outermost `Pressable`. */
  style?: ViewStyle;
  /**
   * Reanimated shared-element tag. Attach the same tag to the destination
   * `Animated.View` on the next screen to trigger a morphing transition.
   */
  sharedTransitionTag?: string;
}

/**
 * A pill-shaped button with an animated gradient border that mimics the
 * Apple Intelligence glow effect.
 *
 * @example
 * ```tsx
 * <GlowButton label="Be here now" sharedTransitionTag="beach-morph" />
 * ```
 */
export function GlowButton({ label, onPress, style, sharedTransitionTag }: GlowButtonProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, { duration: SPEED, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const centerX = WIDTH / 2;
  const centerY = HEIGHT / 2;
  // Radius large enough so the gradient covers the full pill at every angle
  const radius = Math.hypot(centerX, centerY) * 1.15;

  const gradientProps = useAnimatedProps(() => {
    'worklet';
    const angle = rotation.value * 2 * Math.PI;
    return {
      x1: centerX + radius * Math.cos(angle),
      y1: centerY + radius * Math.sin(angle),
      x2: centerX - radius * Math.cos(angle),
      y2: centerY - radius * Math.sin(angle),
    };
  });

  return (
    <Pressable onPress={onPress} style={[s.root, style]}>
      {({ pressed }) => (
        <Animated.View
          style={[s.pill, pressed && s.pressed]}
          sharedTransitionTag={sharedTransitionTag}
        >
          <Svg width={WIDTH} height={HEIGHT} style={StyleSheet.absoluteFill}>
            <Defs>
              <AnimatedLinearGradient
                id="ai-glow"
                gradientUnits="userSpaceOnUse"
                animatedProps={gradientProps}
              >
                {STOPS.map(({ offset, color }) => (
                  <Stop key={`${color}-${offset}`} offset={offset} stopColor={color} />
                ))}
              </AnimatedLinearGradient>
            </Defs>

            {/* Layer 1 — wide soft halo */}
            <Rect
              x={8} y={8} width={WIDTH - 16} height={HEIGHT - 16}
              rx={(HEIGHT - 16) / 2}
              fill="none" stroke="url(#ai-glow)"
              strokeWidth={20} opacity={0.12}
            />
            {/* Layer 2 — intermediate glow ring */}
            <Rect
              x={5} y={5} width={WIDTH - 10} height={HEIGHT - 10}
              rx={(HEIGHT - 10) / 2}
              fill="none" stroke="url(#ai-glow)"
              strokeWidth={10} opacity={0.22}
            />
            {/* Layer 3 — crisp visible border */}
            <Rect
              x={BORDER / 2} y={BORDER / 2}
              width={WIDTH - BORDER} height={HEIGHT - BORDER}
              rx={(HEIGHT - BORDER) / 2}
              fill="none" stroke="url(#ai-glow)"
              strokeWidth={BORDER} opacity={1}
            />
          </Svg>

          {/* Dark body sits above all SVG layers */}
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
  pill:    { width: WIDTH, height: HEIGHT },
  pressed: { opacity: 0.82 },
  body: {
    position:        'absolute',
    top:             0, left: 0, right: 0, bottom: 0,
    margin:          BORDER,
    borderRadius:    (HEIGHT - BORDER * 2) / 2,
    backgroundColor: '#0B0B0F',
    alignItems:      'center',
    justifyContent:  'center',
  },
  label: {
    color:         '#FFFFFF',
    fontSize:      15,
    fontWeight:    '500',
    letterSpacing: 0.15,
  },
});
