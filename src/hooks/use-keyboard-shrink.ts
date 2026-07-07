import { useEffect, useState } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/**
 * 0 -> keyboard hidden, 1 -> keyboard shown. Animates over the native
 * keyboard's own duration so the hero image shrink stays in lockstep with
 * the keyboard slide.
 */
export function useKeyboardShrink() {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const showSub = Keyboard.addListener(SHOW_EVENT, (event) => {
      Animated.timing(progress, {
        toValue: 1,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(HIDE_EVENT, (event) => {
      Animated.timing(progress, {
        toValue: 0,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [progress]);

  return progress;
}
