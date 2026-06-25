/**
 * Vertical slot-machine that cycles through Remindo's value propositions.
 *
 * Three rows are visible at all times: the centre row is full-size and
 * coloured; neighbours fade and shrink with distance. The list scrolls
 * upward continuously via a linear Reanimated animation that resets
 * seamlessly because the word array is doubled.
 *
 * @module components/cycling-words
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { ITEM_HEIGHT, WORDS, type Word } from '@/utils/tokens';

const VISIBLE = 3;
const CONTAINER_H = ITEM_HEIGHT * VISIBLE;
const CENTER = CONTAINER_H / 2; // 108 px

// Doubled so the withRepeat jump is visually seamless.
const LOOP_WORDS = [...WORDS, ...WORDS];

function Icon({ word }: { word: Word }) {
  return (
    <View style={[styles.iconBox, { backgroundColor: word.color }]}>
      <Text style={styles.iconLetter}>{word.label[0]}</Text>
    </View>
  );
}

function WordRow({
  word,
  index,
  translateY,
}: {
  word: Word;
  index: number;
  translateY: SharedValue<number>;
}) {
  const rowStyle = useAnimatedStyle(() => {
    const itemY = index * ITEM_HEIGHT + ITEM_HEIGHT / 2 + translateY.value;
    const dist = Math.abs(itemY - CENTER);
    return {
      opacity: interpolate(dist, [0, ITEM_HEIGHT, ITEM_HEIGHT * 1.4], [1, 0.25, 0], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(dist, [0, ITEM_HEIGHT], [1, 0.8], Extrapolation.CLAMP) }],
    };
  });

  // Icon fades out faster so only the active row shows it.
  const iconStyle = useAnimatedStyle(() => {
    const itemY = index * ITEM_HEIGHT + ITEM_HEIGHT / 2 + translateY.value;
    const dist = Math.abs(itemY - CENTER);
    return {
      opacity: interpolate(dist, [0, ITEM_HEIGHT * 0.45], [1, 0], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      <Animated.View style={iconStyle}>
        <Icon word={word} />
      </Animated.View>
      <Text style={styles.wordText}>{word.label}</Text>
    </Animated.View>
  );
}

export function CyclingWords() {
  // T=0 → item 1 (Remind) at centre. Animate to -N*H → item N+1 at centre (same word, seamless).
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-WORDS.length * ITEM_HEIGHT, {
        duration: WORDS.length * 1_400,
        easing: Easing.linear,
      }),
      -1,
    );
  }, [translateY]);

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={listStyle}>
        {LOOP_WORDS.map((word, i) => (
          <WordRow key={`${word.label}-${i}`} word={word} index={i} translateY={translateY} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_H,
    overflow: 'hidden',
    alignSelf: 'stretch',
    paddingHorizontal: 40,
  },
  row: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLetter: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
  },
  wordText: {
    fontSize: 38,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
  },
});
