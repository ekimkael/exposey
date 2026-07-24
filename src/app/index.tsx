import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ENTER, LibraryRows, RecentlyAdded, RecentlyPlayed } from '@/components/library';
import { DockPlayer, PillPlayer } from '@/components/now-playing-player';
import { Metrics, Palette } from '@/constants/pumice';
import { usePlayerSwap } from '@/hooks/use-player-swap';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { dockStyle, pillStyle, contentStyle, pillPressStyle, dragDock, tapPill, tapGrabber } =
    usePlayerSwap();
  const [playing, setPlaying] = useState(false);
  const togglePlaying = useCallback(() => setPlaying((value) => !value), []);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {/* Padded clear of the dock so nothing hides behind the player. */}
      <Animated.ScrollView
        style={[styles.screen, contentStyle]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}>
        <Animated.Text entering={ENTER(0)} style={styles.heading}>
          Library
        </Animated.Text>
        <Animated.View entering={ENTER(90)}>
          <LibraryRows />
        </Animated.View>
        <RecentlyAdded />
        <RecentlyPlayed />
      </Animated.ScrollView>

      <DockPlayer
        style={dockStyle}
        gesture={dragDock}
        grabberGesture={tapGrabber}
        playing={playing}
        onPlayPause={togglePlaying}
      />
      <PillPlayer
        style={pillStyle}
        gesture={tapPill}
        pressStyle={pillPressStyle}
        playing={playing}
        onPlayPause={togglePlaying}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.page },
  // Clears the dock so the last row is reachable rather than parked under it.
  content: { gap: 8, paddingBottom: Metrics.dock.height + 24 },
  heading: {
    fontSize: 34,
    fontWeight: '700',
    color: Palette.text,
    paddingHorizontal: Metrics.page.inset,
    marginTop: 8,
  },
});
