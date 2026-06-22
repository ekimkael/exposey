import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { StatBadge } from '@/components/stat-badge';
import { TransportControls } from '@/components/transport-controls';
import { motion } from '@/constants/layout';
import { type Playlist } from '@/constants/playlists';

/** Fills the parent — used to lay the poster over the video surface. */
const absoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

interface PlaylistHeroProps {
  playlist: Playlist;
  /** Hero height, in points. */
  height: number;
}

/**
 * The detail screen's hero: a full-bleed looping preview with the playlist's
 * identity (avatar + "+" badge, author, title, stats, blurb) centred over it
 * and the transport controls along the bottom.
 *
 * Owns its own playback (autoplays on mount, muted + looping) and shows a
 * poster still until the first video frame is ready, so the surface is never
 * blank while buffering. The header text reveals on entry and the avatar /
 * badge pop in, mirroring the reference animation.
 */
export function PlaylistHero({ playlist, height }: PlaylistHeroProps) {
  const insets = useSafeAreaInsets();
  const { theme } = playlist;

  const player = useVideoPlayer(playlist.video, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });
  const [playing, setPlaying] = useState(true);
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  // Autoplay once the source resolves (handles late deep-link params).
  useEffect(() => {
    player.play();
    setPlaying(true);
  }, [player]);

  const togglePlay = () => {
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };

  return (
    <View style={{ height, backgroundColor: theme.surface, overflow: 'hidden' }}>
      <VideoView player={player} contentFit="cover" nativeControls={false} style={{ flex: 1 }} />
      {status !== 'readyToPlay' && <Image source={playlist.poster} contentFit="cover" style={absoluteFill} />}

      {/* Centred, revealing identity */}
      <View style={{ position: 'absolute', top: insets.top + 52, left: 24, right: 24, alignItems: 'center', gap: 10 }}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          {/* Avatar pops in, then the "+" badge */}
          <Animated.View entering={ZoomIn.duration(motion.pop)} style={{ width: 50, height: 50 }}>
            <Image source={playlist.avatar} style={{ width: 50, height: 50, borderRadius: 25 }} contentFit="cover" />
            <Animated.View
              entering={ZoomIn.duration(200).delay(90)}
              style={{
                position: 'absolute',
                right: -3,
                top: -3,
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: '#FFFFFF',
                borderWidth: 2,
                borderColor: theme.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name="plus" size={11} color={theme.controlGlyph} />
            </Animated.View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.duration(motion.reveal).delay(60)}
            style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: '#FFFFFF' }}>
            {playlist.author.toUpperCase()}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.duration(motion.reveal).delay(90)}
            style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
            {playlist.date}
          </Animated.Text>
        </View>

        <Animated.Text
          entering={FadeInDown.duration(motion.reveal).delay(110)}
          selectable
          style={{ fontSize: 34, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' }}>
          {playlist.title}
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.duration(motion.reveal).delay(140)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <StatBadge icon="flame.fill" label={`${playlist.plays} plays`} />
          <StatBadge icon="clock" label={playlist.duration} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.duration(motion.reveal).delay(170)}
          style={{ fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
          {playlist.description}
        </Animated.Text>
      </View>

      {/* Transport controls */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 28 }}>
        <TransportControls
          leftIcons={['square.and.arrow.down', 'nosign']}
          rightIcons={['hand.thumbsup.fill', 'speaker.wave.2.fill']}
          playing={playing}
          glyph={theme.controlGlyph}
          onTogglePlay={togglePlay}
        />
      </View>
    </View>
  );
}
