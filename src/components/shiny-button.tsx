/**
 * @file shiny-button.tsx
 * @description Port of Ryan Mulligan's "Shiny call-to-action button"
 * (https://codepen.io/hexagoncircle/pen/MWMqXbK), which relies on CSS
 * `@property`-animated `conic-gradient()` — unavailable in React Native.
 * Reproduced with `@shopify/react-native-skia`'s `SweepGradient`, which is
 * the direct native equivalent of a conic gradient.
 *
 * Mapping from the original CSS:
 * - Rotating border sweep   → `SweepGradient` stroked around a `RoundedRect`
 * - Angle keeps advancing (base 3s loop) + a faster reverse loop that only
 *   plays while pressed (CSS `animation-composition: add`, driven here by
 *   `useFrameCallback` accumulating two angles instead of two paused/running
 *   CSS animations — simpler to reason about, same visual result)
 * - `:hover`/`:focus` state → press-and-hold (no hover on touch)
 * - Inner shimmer            → rotating gradient masked to a soft glow near
 *   the bottom edge
 * - Dot-grid texture         → dot field revealed by a rotating wedge, from
 *   the CSS `mask-image: conic-gradient(from <angle> + 45deg, black,
 *   transparent 10% 90%, black)`. Only the wedge is opaque, so the dots are
 *   lit by the passing halo and the rest of the pill stays black.
 * - Text glow + breathing pulse → blurred ellipse under the label, opacity
 *   driven by press state, scale pulsing continuously via a sine wave
 */
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  interpolateColors,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  rect,
  RoundedRect,
  rrect,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const WIDTH = 300;
const HEIGHT = 68;
const BORDER = 2;
const RADIUS = HEIGHT / 2;
const CENTER = vec(WIDTH / 2, HEIGHT / 2);

const BG = '#000000';
const HIGHLIGHT = '#3d3dff';
const SHINE_REST = '#ffffff';
const SHINE_ACTIVE = '#8484ff';

const BASE_DURATION = 3000; // ms per revolution, always spinning
const BOOST_DURATION = BASE_DURATION / 0.4; // ms per revolution, only while pressed
const TRANSITION_MS = 800;
const EASING = Easing.bezier(0.25, 1, 0.5, 1);

/**
 * Inner-shimmer geometry. The CSS `::after` is a square as wide as the button
 * (`width: 100%; aspect-ratio: 1`) centred on it, holding a `-50deg` linear
 * gradient and masked by `radial-gradient(circle at bottom, transparent 40%,
 * black)`. The whole element — gradient *and* mask — is what `rotate: 360deg`
 * spins, so the lit crescent orbits the centre instead of pulsing in place.
 */
const SHIMMER_SIZE = WIDTH;
const SHIMMER_X = CENTER.x - SHIMMER_SIZE / 2;
const SHIMMER_Y = CENTER.y - SHIMMER_SIZE / 2;
/** `-50deg`: CSS 0deg points up, positive clockwise → dir = (sinθ, -cosθ). */
const SHIMMER_DIR = vec(Math.sin(-(50 * Math.PI) / 180), -Math.cos(-(50 * Math.PI) / 180));
/** Half the gradient line for a square at that angle: S·(|sinθ|+|cosθ|)/2. */
const SHIMMER_REACH =
  (SHIMMER_SIZE * (Math.abs(SHIMMER_DIR.x) + Math.abs(SHIMMER_DIR.y))) / 2;
const SHIMMER_START = vec(
  CENTER.x - SHIMMER_DIR.x * SHIMMER_REACH,
  CENTER.y - SHIMMER_DIR.y * SHIMMER_REACH,
);
const SHIMMER_END = vec(
  CENTER.x + SHIMMER_DIR.x * SHIMMER_REACH,
  CENTER.y + SHIMMER_DIR.y * SHIMMER_REACH,
);
/** Mask circle sits at the square's bottom edge; `farthest-corner` radius. */
const SHIMMER_MASK_CENTER = vec(CENTER.x, SHIMMER_Y + SHIMMER_SIZE);
const SHIMMER_MASK_RADIUS = Math.hypot(SHIMMER_SIZE / 2, SHIMMER_SIZE);

/**
 * Text glow (`span::before`). The CSS is an *inset* `box-shadow` on a box only
 * slightly larger than the label — a soft lift hugging the bottom of the text,
 * not a wash over the whole pill. Kept well under full opacity and narrow
 * enough to stay behind the label.
 */
const GLOW_MAX_OPACITY = 0.26;
const GLOW_RADIUS = WIDTH * 0.15;
const GLOW_BLUR = 18;

/** Clips the pseudo-element layers to the body, so nothing leaks past the border. */
const BODY_CLIP = rrect(
  rect(BORDER, BORDER, WIDTH - BORDER * 2, HEIGHT - BORDER * 2),
  RADIUS - BORDER,
  RADIUS - BORDER,
);

/**
 * Dot grid, matching the CSS `background-size: 4px` / dot radius `2px / 4`.
 * At 8pt spacing the field covered under 2% of the pill and read as black
 * once the wedge mask thinned it further. Built as one `Path` so the ~1300
 * dots cost a single draw call rather than a node each.
 */
const DOT_SPACING = 4;
const DOT_RADIUS = 0.5;

export function ShinyButton({ label = 'Get unlimited access' }: { label?: string }) {
  const pressed = useSharedValue(false);
  const activation = useSharedValue(0);
  const baseAngle = useSharedValue(0);
  const boostAngle = useSharedValue(0);
  const breathe = useSharedValue(0);

  useFrameCallback((frame) => {
    'worklet';
    const dt = frame.timeSincePreviousFrame ?? 16;
    baseAngle.value = (baseAngle.value + (dt / BASE_DURATION) * 360) % 360;
    breathe.value = (breathe.value + dt) % (BASE_DURATION * 1.5);
    if (pressed.value) {
      boostAngle.value -= (dt / BOOST_DURATION) * 360;
    }
  }, true);

  /** Shared rotation: base loop + press-only reverse boost. */
  const spinAngle = useDerivedValue(() => baseAngle.value + boostAngle.value);

  /** The border also picks up `--gradient-angle-offset` (95deg while pressed). */
  const angle = useDerivedValue(() => spinAngle.value - activation.value * 95);

  const percent = useDerivedValue(() => 5 + activation.value * 15);

  const positions = useDerivedValue(() => {
    const p = percent.value / 100;
    return [0, p, p * 2, p * 3, Math.min(p * 4, 1)];
  });

  const colors = useDerivedValue(() => {
    const shine = interpolateColors(activation.value, [0, 1], [SHINE_REST, SHINE_ACTIVE]);
    return ['transparent', HIGHLIGHT, shine, HIGHLIGHT, 'transparent'];
  });

  const glowOpacity = useDerivedValue(() => activation.value * GLOW_MAX_OPACITY);

  const glowScale = useDerivedValue(() => {
    const t = breathe.value / (BASE_DURATION * 1.5);
    return 1 + 0.1 * (1 - Math.cos(2 * Math.PI * t));
  });

  const glowTransform = useDerivedValue(() => [{ scale: glowScale.value }]);

  const borderTransform = useDerivedValue(() => [{ rotate: (angle.value * Math.PI) / 180 }]);

  const shimmerTransform = useDerivedValue(() => [{ rotate: (spinAngle.value * Math.PI) / 180 }]);

  /** The dot mask's wedge leads the border sweep by 45deg, as in the CSS. */
  const dotsMaskTransform = useDerivedValue(() => [
    { rotate: ((spinAngle.value + 45) * Math.PI) / 180 },
  ]);

  function onPressIn() {
    pressed.value = true;
    activation.value = withTiming(1, { duration: TRANSITION_MS, easing: EASING });
  }

  function onPressOut() {
    pressed.value = false;
    activation.value = withTiming(0, { duration: TRANSITION_MS, easing: EASING });
  }

  const dotPath = useMemo(() => {
    const path = Skia.Path.Make();
    for (let y = DOT_SPACING / 2; y < HEIGHT; y += DOT_SPACING) {
      for (let x = DOT_SPACING / 2; x < WIDTH; x += DOT_SPACING) {
        path.addCircle(x, y, DOT_RADIUS);
      }
    }
    return path;
  }, []);

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed: isPressed }) => [styles.root, isPressed && styles.rootPressed]}
    >
      <View style={styles.pill}>
        <Canvas style={StyleSheet.absoluteFill}>
          {/* body fill — the CSS `padding-box` background */}
          <RoundedRect
            x={BORDER}
            y={BORDER}
            width={WIDTH - BORDER * 2}
            height={HEIGHT - BORDER * 2}
            r={RADIUS - BORDER}
            color={BG}
          />

          {/*
            Pseudo-element layers. `isolation: isolate` + `z-index: -1` puts
            these above the background but below the label, so they must paint
            after the body fill — and be clipped to it.
          */}
          <Group clip={BODY_CLIP}>
            {/* dot texture, revealed only inside the rotating wedge */}
            <Mask
              mode="luminance"
              mask={
                <Rect x={0} y={0} width={WIDTH} height={HEIGHT}>
                  <SweepGradient
                    c={CENTER}
                    colors={['white', 'black', 'black', 'white']}
                    positions={[0, 0.1, 0.9, 1]}
                    transform={dotsMaskTransform}
                    origin={CENTER}
                  />
                </Rect>
              }
            >
              <Path path={dotPath} color="white" opacity={0.4} />
            </Mask>

            {/* inner shimmer — mask rotates with the gradient, so it orbits */}
            <Group opacity={0.6} transform={shimmerTransform} origin={CENTER}>
              <Mask
                mode="luminance"
                mask={
                  <Rect
                    x={SHIMMER_X}
                    y={SHIMMER_Y}
                    width={SHIMMER_SIZE}
                    height={SHIMMER_SIZE}
                  >
                    <RadialGradient
                      c={SHIMMER_MASK_CENTER}
                      r={SHIMMER_MASK_RADIUS}
                      colors={['black', 'white']}
                      positions={[0.4, 1]}
                    />
                  </Rect>
                }
              >
                <Rect x={SHIMMER_X} y={SHIMMER_Y} width={SHIMMER_SIZE} height={SHIMMER_SIZE}>
                  <LinearGradient
                    start={SHIMMER_START}
                    end={SHIMMER_END}
                    colors={['transparent', HIGHLIGHT, 'transparent']}
                  />
                </Rect>
              </Mask>
            </Group>
          </Group>

          {/* rotating conic border */}
          <RoundedRect
            x={BORDER / 2}
            y={BORDER / 2}
            width={WIDTH - BORDER}
            height={HEIGHT - BORDER}
            r={RADIUS}
            style="stroke"
            strokeWidth={BORDER}
          >
            <SweepGradient
              c={CENTER}
              colors={colors}
              positions={positions}
              transform={borderTransform}
              origin={CENTER}
            />
          </RoundedRect>
        </Canvas>

        <Canvas style={styles.glowCanvas} pointerEvents="none">
          <Group opacity={glowOpacity} transform={glowTransform} origin={vec(WIDTH / 2, HEIGHT)}>
            <Circle cx={WIDTH / 2} cy={HEIGHT} r={GLOW_RADIUS} color={HIGHLIGHT}>
              <BlurMask blur={GLOW_BLUR} style="normal" />
            </Circle>
          </Group>
        </Canvas>

        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'center' },
  rootPressed: { transform: [{ translateY: 1 }] },
  pill: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowCanvas: {
    ...StyleSheet.absoluteFill,
  },
  label: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', default: undefined }),
  },
});
