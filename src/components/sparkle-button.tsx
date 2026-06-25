/**
 * Pill button with a continuously sweeping border spark.
 *
 * A square SVG gradient (white at one edge) rotates inside an
 * overflow:hidden pill — the inner backdrop covers the button body so
 * only the thin border ring reveals the light as it sweeps around.
 *
 * Orbiting particles live in SparkleParticles (used in the parent section).
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
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const BTN_H = 52;
const H_PAD = 56; // 28px × 2 sides from bottomSection

type Props = {
  label: string;
  leftSlot?: React.ReactNode;
  onPress?: () => void;
};

/** Secondary CTA pill with a rotating border-sweep spark effect. */
export function SparkleButton({ label, leftSlot, onPress }: Props) {
  const { width } = useWindowDimensions();
  const BW = width - H_PAD;
  const DIAG = Math.ceil(Math.sqrt(BW * BW + BTN_H * BTN_H));

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

  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        {/* Rotating gradient — white tip sweeps the border */}
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

        {/* Backdrop: covers interior so only the ~2px ring shows the spark */}
        <View style={styles.backdrop} pointerEvents="none" />

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress?.();
          }}
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
