/**
 * @file shiny-button.tsx
 * @description Port of Ryan Mulligan's "Shiny call-to-action button"
 * (https://codepen.io/hexagoncircle/pen/MWMqXbK). The original leans on CSS
 * `@property`-animated `conic-gradient()`, which React Native has no
 * equivalent for, so the whole button is drawn with `@shopify/react-native-skia`
 * — `SweepGradient` being the direct native counterpart of a conic gradient.
 *
 * How the CSS maps onto this tree:
 * | Original                    | Here                                        |
 * | --------------------------- | ------------------------------------------- |
 * | rotating conic border       | `SweepGradient` stroking a `RoundedRect`     |
 * | `::before` dot grid + mask  | `Path` of dots behind a rotating wedge mask  |
 * | `::after` inner shimmer     | linear gradient + radial mask, spun together |
 * | `span::before` text glow    | blurred `Circle`, opacity driven by press    |
 * | `:hover` / `:focus`         | press-and-hold (touch has no hover)          |
 *
 * Paint order matters: `isolation: isolate` with `z-index: -1` places the
 * pseudo-elements above the button background but below its label, so the body
 * fill is drawn first and the decorative layers on top of it, clipped to it.
 *
 * All motion lives in {@link useShinyButtonAnimation}; this file is rendering
 * only. Tunable values live in `@/constants/shiny-button`.
 */
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  RoundedRect,
  SweepGradient,
} from '@shopify/react-native-skia';

import {
  BG,
  BODY_CLIP,
  BORDER,
  CENTER,
  DOT_MASK_COLORS,
  DOT_MASK_STOPS,
  DOT_OPACITY,
  GLOW_BLUR,
  GLOW_ORIGIN,
  GLOW_RADIUS,
  HEIGHT,
  HIGHLIGHT,
  RADIUS,
  SHIMMER_END,
  SHIMMER_MASK_CENTER,
  SHIMMER_MASK_RADIUS,
  SHIMMER_MASK_STOPS,
  SHIMMER_OPACITY,
  SHIMMER_SIZE,
  SHIMMER_START,
  SHIMMER_X,
  SHIMMER_Y,
  WIDTH,
} from '@/constants/shiny-button';
import { useShinyButtonAnimation } from '@/hooks/use-shiny-button-animation';

export interface ShinyButtonProps {
  /** Text shown inside the pill. */
  label?: string;
  /** Fired on a completed tap. */
  onPress?: () => void;
}

/**
 * A pill-shaped call-to-action with a conic highlight orbiting its border, a
 * dot grid lit by the passing halo, and a glow that blooms while held.
 *
 * @param props - See {@link ShinyButtonProps}.
 * @returns The rendered button.
 *
 * @example
 * ```tsx
 * <ShinyButton label="Get unlimited access" onPress={subscribe} />
 * ```
 */
export function ShinyButton({ label = 'Get unlimited access', onPress }: ShinyButtonProps) {
  const {
    borderColors,
    borderPositions,
    borderTransform,
    shimmerTransform,
    dotMaskTransform,
    glowOpacity,
    glowTransform,
    dotPath,
    handlePressIn,
    handlePressOut,
  } = useShinyButtonAnimation();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [styles.root, pressed && styles.rootPressed]}
    >
      <View style={styles.pill}>
        <Canvas style={StyleSheet.absoluteFill}>
          {/* Button background (the CSS `padding-box` layer). */}
          <RoundedRect
            x={BORDER}
            y={BORDER}
            width={WIDTH - BORDER * 2}
            height={HEIGHT - BORDER * 2}
            r={RADIUS - BORDER}
            color={BG}
          />

          {/* Pseudo-element layers: above the background, below the label. */}
          <Group clip={BODY_CLIP}>
            {/* Dot grid, revealed only inside the rotating wedge. */}
            <Mask
              mode="luminance"
              mask={
                <Rect x={0} y={0} width={WIDTH} height={HEIGHT}>
                  <SweepGradient
                    c={CENTER}
                    colors={DOT_MASK_COLORS}
                    positions={DOT_MASK_STOPS}
                    transform={dotMaskTransform}
                    origin={CENTER}
                  />
                </Rect>
              }
            >
              <Path path={dotPath} color="white" opacity={DOT_OPACITY} />
            </Mask>

            {/* Inner shimmer: the mask spins with the gradient, so it orbits. */}
            <Group opacity={SHIMMER_OPACITY} transform={shimmerTransform} origin={CENTER}>
              <Mask
                mode="luminance"
                mask={
                  <Rect x={SHIMMER_X} y={SHIMMER_Y} width={SHIMMER_SIZE} height={SHIMMER_SIZE}>
                    <RadialGradient
                      c={SHIMMER_MASK_CENTER}
                      r={SHIMMER_MASK_RADIUS}
                      colors={['black', 'white']}
                      positions={SHIMMER_MASK_STOPS}
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

          {/* Rotating conic border. */}
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
              colors={borderColors}
              positions={borderPositions}
              transform={borderTransform}
              origin={CENTER}
            />
          </RoundedRect>
        </Canvas>

        {/* Text glow sits in its own canvas so its blur cannot tint the body. */}
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Group opacity={glowOpacity} transform={glowTransform} origin={GLOW_ORIGIN}>
            <Circle cx={GLOW_ORIGIN.x} cy={GLOW_ORIGIN.y} r={GLOW_RADIUS} color={HIGHLIGHT}>
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
  /** CSS `&:active { translate: 0 1px }`. */
  rootPressed: { transform: [{ translateY: 1 }] },
  pill: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', default: undefined }),
  },
});
