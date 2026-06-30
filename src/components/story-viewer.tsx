import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING } from '@/utils/trip-tokens';

/** Duration each story slide is displayed before auto-advancing. */
const STORY_DURATION = 4000;

/**
 * A single slide shown inside StoryViewer.
 * Exported so consumers (CircularAvatarRow) can build typed arrays.
 */
export type StoryViewerItem = {
  id: string;
  /** Displayed in the header while this slide is active. */
  name: string;
  imageUrl: string;
};

/** Props for StoryViewer. */
type Props = {
  /** Ordered list of slides to play through. */
  items: StoryViewerItem[];
  /** Index of the slide to show first. Defaults to 0. */
  startIndex?: number;
  /** Whether the modal is visible. */
  visible: boolean;
  /** Called when the viewer should close (last slide ends or user taps ✕). */
  onClose: () => void;
};

// ─── Progress bar ─────────────────────────────────────────────────────────

type ProgressBarProps = {
  /** Whether this bar belongs to the currently active slide. */
  active: boolean;
  /** Whether this slide has already been seen (bar full). */
  passed: boolean;
  /** When true the animation is held at 0 — used while the image loads. */
  paused: boolean;
};

function ProgressBar({ active, passed, paused }: ProgressBarProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active && !paused) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: STORY_DURATION,
        useNativeDriver: false,
      }).start();
    } else if (!active) {
      anim.setValue(passed ? 1 : 0);
    }
    // active && paused → keep at 0 until paused becomes false
  }, [active, passed, paused]);

  return (
    <View style={p.track}>
      <Animated.View
        style={[p.fill, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
      />
    </View>
  );
}

const p = StyleSheet.create({
  track: { flex: 1, height: 3.5, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, overflow: 'hidden' },
  fill:  { height: '100%', backgroundColor: '#fff' },
});

// ─── StoryViewer ──────────────────────────────────────────────────────────

export default function StoryViewer({ items, startIndex = 0, visible, onClose }: Props) {
  const [slideIndex, setSlideIndex] = useState(startIndex);
  const [imageLoading, setImageLoading] = useState(true);
  /** Measured height of the top overlay — used to push tap zones below it. */
  const [overlayHeight, setOverlayHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Advance to the next slide, or close if we've reached the end. */
  const advance = useCallback(() => {
    setSlideIndex((i) => {
      const next = i + 1;
      if (next >= items.length) {
        // Defer so the current render completes before the modal unmounts.
        setTimeout(onClose, 0);
        return i;
      }
      return next;
    });
  }, [items.length, onClose]);

  // Reset to startIndex when the viewer opens.
  useEffect(() => {
    if (!visible) return;
    setSlideIndex(startIndex);
  }, [visible, startIndex]);

  // Clamp index when items array shrinks (e.g. different item tapped).
  useEffect(() => {
    setSlideIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  // Each new slide starts in loading state; clear any running timer too.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    setImageLoading(true);
  }, [slideIndex]);

  // Start the auto-advance timer only after the image has fully loaded.
  useEffect(() => {
    if (!visible || imageLoading) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(advance, STORY_DURATION);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [slideIndex, visible, imageLoading, advance]);

  if (!items.length) return null;
  const currentSlide = items[slideIndex] ?? items[0];
  if (!currentSlide) return null;

  const goBack = () => {
    if (timer.current) clearTimeout(timer.current);
    setSlideIndex((i) => Math.max(0, i - 1));
  };

  const goForward = () => {
    if (timer.current) clearTimeout(timer.current);
    advance();
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={s.root}>
        <Image
          source={{ uri: currentSlide.imageUrl }}
          style={s.image}
          contentFit="cover"
          onLoadEnd={() => setImageLoading(false)}
        />

        {imageLoading && (
          <ActivityIndicator size="large" color="#fff" style={s.loader} />
        )}

        {/* Left / right tap zones, positioned below the measured overlay. */}
        <View style={[s.tapRow, { top: overlayHeight }]} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={goBack}>
            <View style={s.tapHalf} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={goForward}>
            <View style={s.tapHalf} />
          </TouchableWithoutFeedback>
        </View>

        {/*
         * Top overlay rendered AFTER the tap row so it sits above it in z-order.
         * onLayout feeds the measured height back so the tap zones start below.
         */}
        <View
          style={[s.topOverlay, { paddingTop: insets.top + SPACING.sm }]}
          pointerEvents="box-none"
          onLayout={(e) => setOverlayHeight(e.nativeEvent.layout.height)}
        >
          <View style={s.bars} pointerEvents="none">
            {items.map((_, i) => (
              <ProgressBar
                key={i}
                active={i === slideIndex}
                passed={i < slideIndex}
                paused={imageLoading}
              />
            ))}
          </View>
          <View style={s.header} pointerEvents="box-none">
            <Text style={s.slideName}>{currentSlide.name}</Text>
            <Pressable onPress={onClose} hitSlop={20} accessibilityLabel="Close story viewer">
              <Text style={s.closeButton}>✕</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000' },
  image:      { ...StyleSheet.absoluteFill },
  loader:     { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
  tapRow:     { ...StyleSheet.absoluteFill, flexDirection: 'row' },
  tapHalf:    { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bars:        { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slideName:   { fontSize: FONT.cardVenue, fontWeight: '600', color: COLORS.white },
  closeButton: { fontSize: 18, color: COLORS.white, fontWeight: '300' },
});
