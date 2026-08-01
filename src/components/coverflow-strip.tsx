import { Image } from 'expo-image';
import { useCallback, useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedReaction,
  useReducedMotion,
  useScrollOffset,
  type SharedValue,
} from 'react-native-reanimated';

import { ITEM, STRIDE, STRIP_HEIGHT } from '@/constants/animation';
import { LAYOUT } from '@/constants/theme';
import type { ReadingEntry } from '@/data/reading-log';
import { useCoverflowTransform } from '@/hooks/use-coverflow-transform';
import { usePressScale } from '@/hooks/use-press-scale';

interface ThumbnailProps {
  readonly scene: number;
  readonly index: number;
  readonly scrollX: SharedValue<number>;
  readonly onPress: (index: number) => void;
}

/**
 * One filmstrip entry: a square photo placed on the cylinder, with press
 * feedback on a nested view so the two transforms stay independent.
 */
function Thumbnail({ scene, index, scrollX, onPress }: ThumbnailProps) {
  const coverflowStyle = useCoverflowTransform(index, scrollX);
  const { pressStyle, handlePressIn, handlePressOut } = usePressScale();
  const handlePress = useCallback(() => onPress(index), [index, onPress]);

  return (
    <Animated.View style={[styles.slot, coverflowStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
  readonly selectedIndex: number;
  /** True while the user is dragging this strip, so it is never scrolled out from under them. */
  readonly isActiveSource: boolean;
  readonly onSelect: (index: number) => void;
  readonly onDragStart: () => void;
  readonly onDragSettled: () => void;
}

/**
 * Horizontal filmstrip whose thumbnails wrap around a cylinder.
 *
 * The motion is scroll-linked rather than tweened: `useScrollOffset` feeds the
 * live offset to each entry's transform, so the effect is interruptible and
 * carries real velocity for free. Snapping is left to the platform
 * (`snapToInterval` + `decelerationRate="fast"`) so momentum stays native.
 *
 * @param entries - Reading-log entries to display, in order.
 * @param selectedIndex - Entry to centre; the strip scrolls to it unless it is
 *   the list the user is currently dragging.
 * @param isActiveSource - Whether this strip is the list driving the selection.
 * @param onSelect - Called with the entry index whenever the centred entry
 *   changes. Fires on index changes only, never at scroll frequency.
 * @param onDragStart - Called when the user starts dragging, to claim ownership.
 * @param onDragSettled - Called when the drag and its momentum finish.
 */
export function CoverflowStrip({
  entries,
  selectedIndex,
  isActiveSource,
  onSelect,
  onDragStart,
  onDragSettled,
}: CoverflowStripProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useScrollOffset(scrollRef);
  const reduceMotion = useReducedMotion();

  useAnimatedReaction(
    () => Math.round(scrollX.value / STRIDE),
    (index, previous) => {
      if (index !== previous && index >= 0 && index < entries.length) {
        runOnJS(onSelect)(index);
      }
    },
  );

  // Follows the selection when the hero is the one driving. Scrolling here
  // while this strip is under the finger would fight the drag.
  useEffect(() => {
    if (isActiveSource) return;
    scrollRef.current?.scrollTo({ x: selectedIndex * STRIDE, animated: !reduceMotion });
  }, [selectedIndex, isActiveSource, reduceMotion, scrollRef]);

  // onMomentumScrollEnd never fires when a drag is released without velocity,
  // which would strand this list as the active source and stop it ever
  // following the hero again.
  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (Math.abs(event.nativeEvent.velocity?.x ?? 0) < 0.1) onDragSettled();
    },
    [onDragSettled],
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
      onScrollBeginDrag={onDragStart}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={onDragSettled}
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
  thumbnail: { width: ITEM, height: ITEM, borderRadius: LAYOUT.thumbnailRadius },
});
