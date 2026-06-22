import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaylistHero } from '@/components/playlist-hero';
import { TrackRow } from '@/components/track-row';
import { layout } from '@/constants/layout';
import { findPlaylist, palette, SAMPLE_TRACKS } from '@/constants/playlists';

/**
 * Playlist detail screen.
 *
 * Reached by tapping a card on the Featured feed; the card zooms into the hero
 * via the Apple Zoom transition ({@link PlaylistHero} is the zoom target).
 * Below the hero is the tracklist. The native stack header starts transparent
 * over the hero and becomes a solid, titled sticky header once scrolled past
 * it — the status bar flips with it so it stays legible.
 */
export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const playlist = findPlaylist(id);
  const heroHeight = Math.round(screenHeight * layout.detail.heroHeightRatio);

  // Flip the header (and status bar) to solid once the hero is mostly scrolled.
  const [headerSolid, setHeaderSolid] = useState(false);
  const isSolid = useSharedValue(false);
  const onScroll = useAnimatedScrollHandler((event) => {
    const solid = event.contentOffset.y > heroHeight * layout.detail.stickyTriggerRatio;
    if (solid !== isSolid.value) {
      isSolid.value = solid;
      runOnJS(setHeaderSolid)(solid);
    }
  });

  if (!playlist) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Playlist not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: !headerSolid,
          headerShadowVisible: false,
          headerTitle: headerSolid ? playlist.title : '',
          headerTintColor: headerSolid ? palette.ink : '#FFFFFF',
          headerStyle: headerSolid ? { backgroundColor: palette.background } : undefined,
        }}
      />
      <StatusBar style={headerSolid ? 'dark' : 'light'} animated />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Link.AppleZoomTarget>
          <PlaylistHero playlist={playlist} height={heroHeight} />
        </Link.AppleZoomTarget>

        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          {SAMPLE_TRACKS.map((track, index) => (
            <TrackRow key={track.title} track={track} position={index + 1} revealIndex={index} />
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
