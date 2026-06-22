import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { RoundIconButton } from '@/components/round-icon-button';
import { StatBadge } from '@/components/stat-badge';
import { TransportControls } from '@/components/transport-controls';
import { layout, motion } from '@/constants/layout';
import { type Playlist } from '@/constants/playlists';

/** Fills the parent — used to lay the poster over the video surface. */
const absoluteFill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Scroll distance (in `snap` units) over which a card scales/fades at the edges. */
const EDGE_SCALE = 0.92;
const EDGE_OPACITY = 0.55;
/** Scale applied while the card is pressed, before the zoom transition. */
const PRESS_SCALE = 0.95;

interface PlaylistCardProps {
  playlist: Playlist;
  /** True when this card is snapped to centre — drives autoplay + title reveal. */
  active: boolean;
  /** Shared vertical scroll offset of the feed. */
  scrollY: SharedValue<number>;
  /** This card's index in the feed. */
  index: number;
  /** Card height, in points. */
  height: number;
  /** Distance between successive card tops (height + gap). */
  snap: number;
}

/**
 * A single Featured-feed card: a full-bleed looping preview with the author row,
 * a centred title + stats, and the transport controls overlaid on top.
 *
 * Animations mirror the reference:
 * - scales/fades down as it leaves the centre of the viewport (scroll-driven);
 * - scales down on press, then the Apple Zoom transition carries it into the
 *   detail screen ({@link Link.AppleZoom});
 * - the centred (`active`) card autoplays its preview and reveals its title.
 *
 * A poster still covers the surface until the first video frame is ready, so a
 * card is never blank while its clip buffers.
 */
export function PlaylistCard({ playlist, active, scrollY, index, height, snap }: PlaylistCardProps) {
  const { theme } = playlist;
  const player = useVideoPlayer(playlist.video, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });
  const [playing, setPlaying] = useState(false);
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  // Autoplay the centred card; pause the rest so only one clip ever runs.
  useEffect(() => {
    if (active) {
      player.play();
      setPlaying(true);
    } else {
      player.pause();
      setPlaying(false);
    }
  }, [active, player]);

  // Title + stats reveal when the card becomes active.
  const revealProgress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    revealProgress.value = withTiming(active ? 1 : 0, { duration: motion.cardReveal });
  }, [active, revealProgress]);
  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [{ translateY: interpolate(revealProgress.value, [0, 1], [14, 0]) }],
  }));

  // Scroll-driven scale/opacity combined with the press-in scale-down.
  const pressProgress = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => {
    const distanceFromCentre = scrollY.value - index * snap;
    const scrollScale = interpolate(distanceFromCentre, [-snap, 0, snap], [EDGE_SCALE, 1, EDGE_SCALE], 'clamp');
    const opacity = interpolate(distanceFromCentre, [-snap, 0, snap], [EDGE_OPACITY, 1, EDGE_OPACITY], 'clamp');
    const pressScale = interpolate(pressProgress.value, [0, 1], [1, PRESS_SCALE]);
    return { transform: [{ scale: scrollScale * pressScale }], opacity };
  });

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
    <Link href={`/${playlist.id}`} asChild>
      <Link.Trigger withAppleZoom>
        <Pressable
          onPressIn={() => (pressProgress.value = withSpring(1, { damping: 18, stiffness: 220 }))}
          onPressOut={() => (pressProgress.value = withSpring(0, { damping: 18, stiffness: 220 }))}>
          <Animated.View
            style={[
              cardStyle,
              {
                height,
                borderRadius: layout.card.radius,
                borderCurve: 'continuous',
                backgroundColor: theme.surface,
                overflow: 'hidden',
              },
            ]}>
            {/* Full-bleed preview, with a poster until the first frame is ready */}
            <VideoView player={player} contentFit="cover" nativeControls={false} style={{ flex: 1 }} />
            {status !== 'readyToPlay' && (
              <Image source={playlist.poster} contentFit="cover" style={absoluteFill} />
            )}

            {/* Author row */}
            <View
              style={{
                position: 'absolute',
                top: layout.card.inset,
                left: layout.card.inset,
                right: layout.card.inset,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              <Image source={playlist.avatar} style={{ width: 34, height: 34, borderRadius: 17 }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1, color: '#FFFFFF' }}>
                  {playlist.author.toUpperCase()}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{playlist.date}</Text>
              </View>
              <RoundIconButton icon="plus" size={34} background="rgba(255,255,255,0.18)" />
            </View>

            {/* Centred, revealing title + stats */}
            <Animated.View
              style={[
                revealStyle,
                { position: 'absolute', top: 76, left: layout.card.inset, right: layout.card.inset, alignItems: 'center', gap: 8 },
              ]}>
              <Text style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' }}>
                {playlist.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <StatBadge icon="flame.fill" label={playlist.plays} />
                <StatBadge icon="clock" label={playlist.duration} />
              </View>
            </Animated.View>

            {/* Transport controls */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: layout.card.inset }}>
              <TransportControls
                leftIcons={['nosign']}
                rightIcons={['hand.thumbsup.fill', 'speaker.slash.fill']}
                playing={playing}
                glyph={theme.controlGlyph}
                onTogglePlay={togglePlay}
              />
            </View>
          </Animated.View>
        </Pressable>
      </Link.Trigger>
    </Link>
  );
}
