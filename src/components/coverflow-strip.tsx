import { Image } from 'expo-image';
import { useCallback } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedStyle,
  useScrollOffset,
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
const STRIP_HEIGHT = 100;

interface ThumbnailProps {
  readonly scene: number;
  readonly index: number;
  readonly scrollX: SharedValue<number>;
  readonly onPress: (index: number) => void;
}

function Thumbnail({ scene, index, scrollX, onPress }: ThumbnailProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = index - scrollX.value / STRIDE;
    const steps = Math.min(Math.max(distance, -MAX_STEPS), MAX_STEPS);
    const angle = steps * STEP_DEG;

    return {
      opacity: 1 - Math.min(1, Math.max(0, (Math.abs(distance) - FADE_FROM) / (MAX_STEPS - FADE_FROM))),
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

  const handlePress = useCallback(() => onPress(index), [index, onPress]);

  return (
    <Animated.View style={[styles.slot, animatedStyle]}>
      <Pressable onPress={handlePress} accessibilityRole="imagebutton">
        <Image source={scene} style={styles.thumbnail} contentFit="cover" transition={0} />
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
