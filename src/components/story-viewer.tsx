import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING } from '@/utils/trip-tokens';

const { width: W, height: H } = Dimensions.get('window');
const STORY_DURATION = 4000; // ms per story

type StoryItem = { id: string; name: string; imageUrl: string };

type Props = {
  items: StoryItem[];
  startIndex?: number;
  visible: boolean;
  onClose: () => void;
};

function ProgressBar({ active, passed, paused }: { active: boolean; passed: boolean; paused: boolean }) {
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
    // if active && paused: keep at 0, animation starts once paused becomes false
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
  fill: { height: '100%', backgroundColor: '#fff' },
});

export default function StoryViewer({ items, startIndex = 0, visible, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= items.length) {
        // defer close so current render finishes cleanly
        setTimeout(onClose, 0);
        return i;
      }
      return next;
    });
  }, [items.length, onClose]);

  useEffect(() => {
    if (!visible) return;
    setIndex(startIndex);
  }, [visible, startIndex]);

  // clamp index if items shrink (e.g. when slice changes after parent re-render)
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  useEffect(() => { setLoading(true); }, [index]);

  useEffect(() => {
    if (!visible || loading) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(advance, STORY_DURATION);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [index, visible, loading, advance]);

  if (!items.length) return null;
  const current = items[index] ?? items[0];
  if (!current) return null;

  const goBack = () => {
    if (timer.current) clearTimeout(timer.current);
    setIndex((i) => Math.max(0, i - 1));
  };

  const goForward = () => {
    if (timer.current) clearTimeout(timer.current);
    advance();
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={s.root}>
        <Image
          source={{ uri: current.imageUrl }}
          style={s.image}
          contentFit="cover"
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <ActivityIndicator size="large" color="#fff" style={s.loader} />
        )}

        {/* Tap zones: left = back, right = forward */}
        <View style={s.tapRow} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={goBack}>
            <View style={s.tapHalf} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={goForward}>
            <View style={s.tapHalf} />
          </TouchableWithoutFeedback>
        </View>

        {/* Top overlay rendered last so it's above tap zones */}
        <View style={[s.topOverlay, { paddingTop: insets.top + SPACING.sm }]} pointerEvents="box-none">
          <View style={s.bars} pointerEvents="none">
            {items.map((_, i) => (
              <ProgressBar key={i} active={i === index} passed={i < index} paused={loading} />
            ))}
          </View>
          <View style={s.header} pointerEvents="box-none">
            <Text style={s.name}>{current.name}</Text>
            <Pressable onPress={onClose} hitSlop={20}>
              <Text style={s.close}>✕</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  image: { ...StyleSheet.absoluteFill },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bars: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: FONT.cardVenue, fontWeight: '600', color: COLORS.white },
  close: { fontSize: 18, color: COLORS.white, fontWeight: '300' },
  tapRow: { ...StyleSheet.absoluteFill, flexDirection: 'row', top: 80 },
  tapHalf: { flex: 1 },
  loader: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
});
