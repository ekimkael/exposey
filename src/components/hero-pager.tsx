import { Image } from 'expo-image';
import { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  type AccessibilityActionEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedReaction,
  useReducedMotion,
  useScrollOffset,
} from 'react-native-reanimated';

import { LAYOUT } from '@/constants/theme';
import type { ReadingEntry } from '@/data/reading-log';

interface HeroPagerProps {
  readonly entries: readonly ReadingEntry[];
  readonly selectedIndex: number;
  /** True while the user is dragging this pager, so it is never scrolled out from under them. */
  readonly isActiveSource: boolean;
  readonly onSelect: (index: number) => void;
  readonly onDragStart: () => void;
  readonly onDragSettled: () => void;
}

/**
 * The hero photo, as a horizontally paged list.
 *
 * Built on a paging `ScrollView` rather than a pan gesture on purpose. Native
 * paging supplies velocity-aware page changes, rubber-banding at the first and
 * last entry, and mid-flight interruptibility for free — all of which would
 * have to be hand-rolled on a gesture, and a hard stop at the bounds is a
 * motion defect in its own right. It also avoids needing a
 * `GestureHandlerRootView` at the root, which this app does not mount.
 *
 * The scroller is full-screen-width so pages snap by `width`; the photo is
 * centred inside each page at its inset size, leaving the rendered geometry
 * identical to the static hero it replaces.
 *
 * @param entries - Reading-log entries, in order.
 * @param selectedIndex - Entry to display; the pager scrolls to it unless it is
 *   the list the user is currently dragging.
 * @param isActiveSource - Whether this pager is the list driving the selection.
 * @param onSelect - Called when the settled page changes.
 * @param onDragStart - Called when the user starts dragging, to claim ownership.
 * @param onDragSettled - Called when the drag and its momentum finish.
 */
export function HeroPager({
  entries,
  selectedIndex,
  isActiveSource,
  onSelect,
  onDragStart,
  onDragSettled,
}: HeroPagerProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useScrollOffset(scrollRef);
  const reduceMotion = useReducedMotion();

  const heroWidth = width - LAYOUT.heroInset * 2;
  // RN reads aspectRatio as width / height.
  const heroHeight = heroWidth / LAYOUT.heroAspect;

  useAnimatedReaction(
    () => Math.round(scrollX.value / width),
    (index, previous) => {
      if (index !== previous && index >= 0 && index < entries.length) {
        runOnJS(onSelect)(index);
      }
    },
  );

  // Follows the selection when the strip is the one driving. Scrolling here
  // while this pager is under the finger would fight the drag.
  useEffect(() => {
    if (isActiveSource) return;
    scrollRef.current?.scrollTo({ x: selectedIndex * width, animated: !reduceMotion });
  }, [selectedIndex, isActiveSource, reduceMotion, scrollRef, width]);

  // onMomentumScrollEnd never fires when a drag is released without velocity,
  // which would strand this list as the active source and stop it ever
  // following the strip again.
  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (Math.abs(event.nativeEvent.velocity?.x ?? 0) < 0.1) onDragSettled();
    },
    [onDragSettled],
  );

  // Swiping is invisible to VoiceOver, so expose the same navigation as an
  // adjustable value that responds to increment/decrement.
  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
      const next = Math.min(Math.max(selectedIndex + delta, 0), entries.length - 1);
      if (next !== selectedIndex) onSelect(next);
    },
    [selectedIndex, entries.length, onSelect],
  );

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScrollBeginDrag={onDragStart}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={onDragSettled}
      style={[styles.pager, { height: heroHeight }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`Reading entry, ${entries[selectedIndex]?.date ?? ''}`}
      accessibilityActions={ACCESSIBILITY_ACTIONS}
      onAccessibilityAction={handleAccessibilityAction}
    >
      {entries.map((entry) => (
        <View key={entry.date} style={[styles.page, { width }]}>
          <Image
            source={entry.scene}
            style={[styles.photo, { width: heroWidth, height: heroHeight }]}
            contentFit="cover"
            transition={0}
          />
        </View>
      ))}
    </Animated.ScrollView>
  );
}

const ACCESSIBILITY_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }] as const;

const styles = StyleSheet.create({
  pager: { marginTop: LAYOUT.gap, flexGrow: 0 },
  page: { alignItems: 'center', justifyContent: 'center' },
  photo: { borderRadius: LAYOUT.heroRadius },
});
