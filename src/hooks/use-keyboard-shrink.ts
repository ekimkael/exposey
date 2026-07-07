import { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

import type { CardTransform } from '@/constants/cards';
import { DEFAULT_KEYBOARD_ANIM_MS, HERO_SHRINK_HEIGHT_RATIO, HERO_SHRINK_SCALE } from '@/constants/animation';

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/** A card's animated transform — same shape as {@link CardTransform}, each
 * field interpolated between its resting and focused value. */
interface CardTransformAnim {
  rotate: Animated.AnimatedInterpolation<string>;
  translateX: Animated.AnimatedInterpolation<number>;
  translateY: Animated.AnimatedInterpolation<number>;
}

interface KeyboardShrinkAnim {
  /** Hero container height — animates from `heroHeight` down to its shrunk ratio. */
  heroHeightAnim: Animated.AnimatedInterpolation<number>;
  /** Card-stack visual scale — animates from 1 down to its shrunk ratio. */
  cardScaleAnim: Animated.AnimatedInterpolation<number>;
  /** Per-card transform, one entry per `cards` input, in order. */
  cardAnims: CardTransformAnim[];
}

/**
 * Drives the login screen's hero card shrink as the keyboard shows/hides.
 *
 * Animates over the *native* keyboard event's own `duration` (falling back
 * to {@link DEFAULT_KEYBOARD_ANIM_MS} on the rare event that doesn't report
 * one), so the shrink stays in lockstep with the real keyboard slide instead
 * of guessing a timing that can drift out of sync.
 *
 * iOS listens on `keyboardWillShow`/`WillHide` (fires *before* the keyboard
 * animation starts, letting ours run concurrently); Android only reliably
 * offers `keyboardDidShow`/`DidHide`, so the shrink there trails slightly
 * behind the keyboard itself.
 *
 * Each card in `cards` also animates from its `resting` transform (fanned
 * out) to its `focused` transform (see `CARD_FAN` in constants/cards.ts —
 * typically horizontal and tightly stacked) in the same motion as the
 * shrink, closing the fan like a wallet's card stack.
 *
 * @param heroHeight - resting (keyboard-hidden) height of the hero container, in points.
 * @param cards - each card's resting/focused transform, fan order.
 */
export function useKeyboardShrink(heroHeight: number, cards: readonly { resting: CardTransform; focused: CardTransform }[]): KeyboardShrinkAnim {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const showSub = Keyboard.addListener(SHOW_EVENT, (event) => {
      Animated.timing(progress, {
        toValue: 1,
        duration: event.duration || DEFAULT_KEYBOARD_ANIM_MS,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(HIDE_EVENT, (event) => {
      Animated.timing(progress, {
        toValue: 0,
        duration: event.duration || DEFAULT_KEYBOARD_ANIM_MS,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [progress]);

  return {
    heroHeightAnim: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [heroHeight, heroHeight * HERO_SHRINK_HEIGHT_RATIO],
    }),
    cardScaleAnim: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, HERO_SHRINK_SCALE],
    }),
    cardAnims: cards.map(({ resting, focused }) => ({
      rotate: progress.interpolate({ inputRange: [0, 1], outputRange: [resting.rotate, focused.rotate] }),
      translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [resting.translateX, focused.translateX] }),
      translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [resting.translateY, focused.translateY] }),
    })),
  };
}
