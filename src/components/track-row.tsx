import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { motion } from '@/constants/layout';
import { palette, type Track } from '@/constants/playlists';

interface TrackRowProps {
  track: Track;
  /** 1-based position shown at the left. */
  position: number;
  /** Zero-based index used to stagger the entering animation. */
  revealIndex: number;
}

/** A single tracklist row: position number, title + artist, and duration. */
export function TrackRow({ track, position, revealIndex }: TrackRowProps) {
  const delay = Math.min(revealIndex, motion.trackStaggerCap) * motion.trackStagger;

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.reveal).delay(delay)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 }}>
      <Text style={{ width: 20, fontSize: 15, color: palette.muted, fontVariant: ['tabular-nums'] }}>{position}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: palette.ink }}>{track.title}</Text>
        <Text style={{ fontSize: 13, color: palette.muted }}>{track.artist}</Text>
      </View>
      <Text style={{ fontSize: 13, color: palette.muted, fontVariant: ['tabular-nums'] }}>{track.duration}</Text>
    </Animated.View>
  );
}
