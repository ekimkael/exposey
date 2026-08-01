import { Image } from 'expo-image';
import { useCallback } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useScrollOffset,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { ReadingEntry } from '@/data/reading-log';

/** Thumbnail edge length. */
const ITEM = 85;
/** Scroll distance between two entries. */
const STRIDE = 102;
/** Cylinder arc consumed by one entry. */
const STEP_DEG = 30.5;
const DEG_TO_RAD = Math.PI / 180;
/**
 * Cylinder radius, derived rather than chosen: `RADIUS * STEP_rad === STRIDE`
 * makes the centre of the strip track the finger 1:1. Any other radius and the
 * carousel slides out from under the touch.
 */
const RADIUS = STRIDE / (STEP_DEG * DEG_TO_RAD);
const PERSPECTIVE = 500;
/**
 * Entries stop turning at ~79deg. Parked faces stay on screen (R*sin caps at
 * RADIUS, inside the half-width), so they are faded out over the last quarter
 * step rather than cut, which would pop a visible sliver at the edge.
 */
const MAX_STEPS = 2.6;
const FADE_FROM = 2.35;
/** Reduce Motion: scale drop one step out from centre, standing in for foreshortening. */
const FLAT_SCALE_FALLOFF = 0.08;
const STRIP_HEIGHT = 100;
/** Press feedback: 0.97 scale, subtle enough to acknowledge without bouncing. */
const PRESS_SCALE_DROP = 0.03;
/** Strong ease-out — the response should be quickest where the eye is watching. */
const PRESS_TIMING = { duration: 160, easing: Easing.bezier(0.23, 1, 0.32, 1) };

interface ThumbnailProps {
  readonly scene: number;
  readonly index: number;
  readonly scrollX: SharedValue<number>;
  readonly onPress: (index: number) => void;
}

function Thumbnail({ scene, index, scrollX, onPress }: ThumbnailProps) {
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => {
    const distance = index - scrollX.value / STRIDE;
    const fade =
      1 - Math.min(1, Math.max(0, (Math.abs(distance) - FADE_FROM) / (MAX_STEPS - FADE_FROM)));

    if (reduceMotion) {
      // Reduce Motion: no 3D rotation and no cylinder remap — the two vestibular
      // triggers. A flat scale falloff carries the "which entry is centred" cue
      // that foreshortening carries otherwise.
      return {
        opacity: fade,
        transform: [{ scale: 1 - Math.min(Math.abs(distance), 1) * FLAT_SCALE_FALLOFF }],
      };
    }

    const steps = Math.min(Math.max(distance, -MAX_STEPS), MAX_STEPS);
    const angle = steps * STEP_DEG;

    return {
      opacity: fade,
      transform: [
        { perspective: PERSPECTIVE },
        // Orthographic cylinder: the face sits at R*sin(angle) rather than at
        // its flat scroll position, which is what packs the outer entries
        // together instead of letting the gaps grow as they foreshorten.
        { translateX: RADIUS * Math.sin(angle * DEG_TO_RAD) - distance * STRIDE },
        { rotateY: `${angle}deg` },
      ],
    };
  });

  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * PRESS_SCALE_DROP }],
  }));

  const handlePress = useCallback(() => onPress(index), [index, onPress]);

  return (
    <Animated.View style={[styles.slot, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          pressed.value = withTiming(1, PRESS_TIMING);
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, PRESS_TIMING);
        }}
        accessibilityRole="imagebutton"
      >
        <Animated.View style={pressStyle}>
          <Image source={scene} style={styles.thumbnail} contentFit="cover" transition={0} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

interface CoverflowStripProps {
  readonly entries: readonly ReadingEntry[];
  readonly onSelect: (index: number) => void;
}

export function CoverflowStrip({ entries, onSelect }: CoverflowStripProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useScrollOffset(scrollRef);

  // Only crosses to JS when the centred entry actually changes, so the hero
  // swap never runs at scroll frequency.
  useAnimatedReaction(
    () => Math.round(scrollX.value / STRIDE),
    (index, previous) => {
      if (index !== previous && index >= 0 && index < entries.length) {
        runOnJS(onSelect)(index);
      }
    },
  );

  const handlePress = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ x: index * STRIDE, animated: true });
    },
    [scrollRef],
  );

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      style={styles.strip}
      // Pads by the slot, not the thumbnail: each slot already carries the gap
      // as margin, so insetting by the thumbnail leaves entry 0 off-centre.
      contentContainerStyle={[styles.content, { paddingHorizontal: (width - STRIDE) / 2 }]}
      showsHorizontalScrollIndicator={false}
      snapToInterval={STRIDE}
      decelerationRate="fast"
    >
      {entries.map((entry, index) => (
        <Thumbnail
          key={entry.date}
          scene={entry.scene}
          index={index}
          scrollX={scrollX}
          onPress={handlePress}
        />
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { height: STRIP_HEIGHT },
  content: { alignItems: 'center' },
  slot: { width: ITEM, marginHorizontal: (STRIDE - ITEM) / 2 },
  thumbnail: { width: ITEM, height: ITEM, borderRadius: 10 },
});
