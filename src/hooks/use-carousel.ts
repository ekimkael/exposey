/**
 * @file Auto-advancing carousel hook backed by Reanimated shared values.
 *
 * ## What it does
 * - Tracks the active page in both JS state (`page`) and a shared value (`pageShared`).
 * - Drives a fill-progress animation (`progress`: 0 → 1) that resets on every page change.
 * - When `progress` reaches 1 naturally (no swipe interrupt), it advances to the next page.
 * - A manual swipe (detected via `handleMomentumEnd`) cancels the running animation and
 *   jumps directly to the new page, triggering a selection haptic on iOS.
 *
 * ## Usage
 * ```tsx
 * const { page, pageShared, progress, scrollRef, scrollHandler, handleMomentumEnd } =
 *   useCarousel({ count: SLIDES.length, slideDuration: SLIDE_DURATION });
 *
 * // Attach scrollRef and handlers to the ScrollView
 * // Drive ProgressDot with pageShared + progress (no JS re-renders)
 * // Re-render the slide text by reading `page` from JS state
 * ```
 *
 * @module hooks/use-carousel
 */

import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, useWindowDimensions } from 'react-native';
import {
  SharedValue,
  cancelAnimation,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Configuration for {@link useCarousel}. */
export interface UseCarouselOptions {
  /** Total number of slides in the carousel. */
  count: number;
  /** Duration (ms) each slide is displayed before auto-advancing. */
  slideDuration: number;
}

/** Values and refs returned by {@link useCarousel}. */
export interface UseCarouselReturn {
  /**
   * Zero-based index of the current page (JS state).
   * Changes trigger component re-renders — use for slide text, not dot animations.
   */
  page: number;

  /**
   * Zero-based index of the current page as a Reanimated shared value.
   * Drives animated styles (e.g. dot widths) without causing re-renders.
   */
  pageShared: SharedValue<number>;

  /**
   * Fill progress of the active dot, from 0 (start of slide) → 1 (end).
   * Resets to 0 at the beginning of each slide.
   * When it reaches 1 uninterrupted, the carousel advances automatically.
   */
  progress: SharedValue<number>;

  /** Ref to attach to the `<ScrollView>` for programmatic page scrolling. */
  scrollRef: React.RefObject<ScrollView | null>;

  /**
   * Raw horizontal scroll offset as a shared value (updated on every scroll frame).
   * Use this to drive scroll-synchronized animations on the UI thread.
   */
  scrollX: SharedValue<number>;

  /**
   * Animated scroll handler — pass directly to `onScroll` on the ScrollView.
   * Tracks {@link scrollX} on every frame.
   */
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;

  /**
   * Call from the ScrollView's `onMomentumScrollEnd`.
   * Cancels the auto-advance timer and syncs page state after a manual swipe.
   */
  handleMomentumEnd: (e: {
    nativeEvent: { contentOffset: { x: number } };
  }) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages carousel pagination, auto-advance timing, and dot fill animation.
 *
 * @param options - {@link UseCarouselOptions}
 * @returns Refs, shared values, and handlers to wire into a horizontal ScrollView.
 *
 * @example
 * ```tsx
 * const carousel = useCarousel({ count: 4, slideDuration: 6000 });
 *
 * <Animated.ScrollView
 *   ref={carousel.scrollRef}
 *   onScroll={carousel.scrollHandler}
 *   onMomentumScrollEnd={carousel.handleMomentumEnd}
 * />
 * ```
 */
export function useCarousel({
  count,
  slideDuration,
}: UseCarouselOptions): UseCarouselReturn {
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const pageShared = useSharedValue(0);
  const progress = useSharedValue(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  /**
   * Scrolls the view to `nextPage` and updates both the JS state and shared value.
   *
   * Must be called via `runOnJS` when invoked from a Reanimated worklet callback.
   */
  function goTo(nextPage: number) {
    scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
    pageShared.value = nextPage;
    setPage(nextPage);
  }

  /**
   * Starts the fill animation for `currentPage`.
   * On natural completion (not cancelled by a swipe), advances to the next slide.
   *
   * ⚠️ `goTo` is captured by closure at call time. If screen width changes mid-animation
   * (e.g. orientation flip), the next call to `startProgress` will pick up the new width.
   */
  function startProgress(currentPage: number) {
    progress.value = 0;
    progress.value = withTiming(1, { duration: slideDuration }, (finished) => {
      if (!finished) return;
      runOnJS(goTo)((currentPage + 1) % count);
    });
  }

  // Restart the timer on every page change; clean up the animation on unmount.
  useEffect(() => {
    startProgress(page);
    return () => cancelAnimation(progress);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Syncs page state after a manual swipe completes.
   * Cancels the running auto-advance timer so it doesn't overlap with the new slide.
   */
  function handleMomentumEnd(e: {
    nativeEvent: { contentOffset: { x: number } };
  }) {
    const nextPage = Math.round(e.nativeEvent.contentOffset.x / width);
    if (nextPage === page) return;

    cancelAnimation(progress);
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    pageShared.value = nextPage;
    setPage(nextPage);
  }

  return {
    page,
    pageShared,
    progress,
    scrollX,
    scrollRef,
    scrollHandler,
    handleMomentumEnd,
  };
}
