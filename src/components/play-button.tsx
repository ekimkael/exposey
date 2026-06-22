import { Pressable } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { layout } from '@/constants/layout';
import { palette } from '@/constants/playlists';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PlayButtonProps {
  /** Whether the media is currently playing (selects the glyph). */
  playing: boolean;
  /** Tint of the play/pause glyph (matches the card's colour scheme). */
  glyph: string;
  onPress: () => void;
  /** Diameter, in points. */
  size?: number;
}

/**
 * The large white central transport button. Springs down on press and swaps
 * between the play and pause SF Symbols based on {@link PlayButtonProps.playing}.
 */
export function PlayButton({ playing, glyph, onPress, size = layout.control.playSize }: PlayButtonProps) {
  const pressProgress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressProgress.value, [0, 1], [1, 0.88]) }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => (pressProgress.value = withSpring(1, { damping: 14 }))}
      onPressOut={() => (pressProgress.value = withSpring(0, { damping: 14 }))}
      onPress={onPress}
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: palette.controlBg,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
        },
      ]}>
      <Icon name={playing ? 'pause.fill' : 'play.fill'} size={Math.round(size * 0.38)} color={glyph} />
    </AnimatedPressable>
  );
}
