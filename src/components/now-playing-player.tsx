import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { Metrics, NowPlaying, Palette } from '@/constants/pumice';

const artwork = require('@/assets/pumice/rock-that.png');

interface PlayerProps {
  style: ComponentProps<typeof Animated.View>['style'];
}

function Controls({ airplay, play, gap }: { airplay: number; play: number; gap: number }) {
  return (
    <View style={[styles.controls, { gap }]}>
      <View style={[styles.circle, { width: airplay, height: airplay, borderRadius: airplay / 2, backgroundColor: Palette.control }]}>
        <SymbolView name={{ ios: 'airplayaudio', android: 'airplay' }} size={airplay * 0.55} tintColor="#FFFFFF" />
      </View>
      <View style={[styles.circle, { width: play, height: play, borderRadius: play / 2, backgroundColor: '#FFFFFF' }]}>
        <SymbolView name={{ ios: 'play.fill', android: 'play_arrow' }} size={play * 0.5} tintColor="#000000" />
      </View>
    </View>
  );
}

function Progress({ style }: { style: StyleProp<ViewStyle> }) {
  const percent = `${NowPlaying.progress * 100}%` as const;
  return (
    <View style={[styles.track, style]}>
      <View style={[styles.trackFill, { width: percent }]} />
      <View style={[styles.playhead, { left: percent }]} />
    </View>
  );
}

/** Full-width sheet pinned to the bottom edge, with the page's rounded bottom corners cut into it. */
export function DockPlayer({ style }: PlayerProps) {
  const { dock, page } = Metrics;
  return (
    <Animated.View style={[styles.dock, style]}>
      <View style={[styles.corner, { left: 0, top: -page.bottomRadius }]}>
        <View style={[styles.cornerDisc, { left: 0 }]} />
      </View>
      <View style={[styles.corner, { right: 0, top: -page.bottomRadius }]}>
        <View style={[styles.cornerDisc, { right: 0 }]} />
      </View>

      <View style={styles.grabber} />
      <View style={[styles.dockRow, { top: dock.artTop, left: dock.inset, right: dock.buttonRight }]}>
        <Image source={artwork} style={{ width: dock.art, height: dock.art, borderRadius: dock.artRadius }} />
        <View style={styles.dockText}>
          <Text style={[styles.title, styles.dockTitle]}>{NowPlaying.title}</Text>
          <Text style={styles.dockArtist}>{NowPlaying.artist}</Text>
        </View>
        <Controls airplay={dock.airplay} play={dock.play} gap={dock.buttonGap} />
      </View>
      <Progress style={{ position: 'absolute', top: dock.progressTop, left: dock.textLeft, right: dock.inset }} />
    </Animated.View>
  );
}

/** Compact rounded bar floating above the bottom edge, title and artist on one line. */
export function PillPlayer({ style }: PlayerProps) {
  const { pill } = Metrics;
  return (
    <Animated.View style={[styles.pill, style]}>
      <View style={[styles.pillRow, { left: pill.artLeft, right: pill.buttonRight }]}>
        <Image source={artwork} style={{ width: pill.art, height: pill.art, borderRadius: pill.artRadius }} />
        <View style={styles.pillText}>
          <Text style={styles.title}>{NowPlaying.title}</Text>
          <Text style={styles.pillArtist}>{NowPlaying.artist}</Text>
        </View>
        <Controls airplay={pill.airplay} play={pill.play} gap={pill.buttonGap} />
      </View>
      <Progress style={{ position: 'absolute', top: pill.progressTop, left: pill.textLeft, right: pill.progressRight }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Metrics.dock.height,
    backgroundColor: Palette.player,
  },
  // ponytail: the page's rounded bottom corners are faked with two filled
  // squares carrying a white disc, instead of clipping the whole page (which
  // would need an animated height). Only works because the page keeps at least
  // `bottomRadius` of white margin on both edges.
  corner: {
    position: 'absolute',
    width: Metrics.page.bottomRadius,
    height: Metrics.page.bottomRadius,
    backgroundColor: Palette.player,
    overflow: 'hidden',
  },
  cornerDisc: {
    position: 'absolute',
    top: -Metrics.page.bottomRadius,
    width: Metrics.page.bottomRadius * 2,
    height: Metrics.page.bottomRadius * 2,
    borderRadius: Metrics.page.bottomRadius,
    backgroundColor: Palette.page,
  },
  grabber: {
    position: 'absolute',
    top: Metrics.dock.grabberTop,
    alignSelf: 'center',
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.control,
  },
  dockRow: {
    position: 'absolute',
    height: Metrics.dock.art,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dockText: { flex: 1, marginLeft: Metrics.dock.textLeft - Metrics.dock.inset - Metrics.dock.art },
  dockTitle: { fontSize: 15 },
  dockArtist: { color: Palette.onPlayerSecondary, fontSize: 13, marginTop: 1 },

  pill: {
    position: 'absolute',
    left: Metrics.pill.margin,
    right: Metrics.pill.margin,
    bottom: Metrics.pill.bottom,
    height: Metrics.pill.height,
    borderRadius: Metrics.pill.radius,
    backgroundColor: Palette.player,
  },
  pillRow: {
    position: 'absolute',
    top: Metrics.pill.textCenter - Metrics.pill.art / 2,
    height: Metrics.pill.art,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: Metrics.pill.textLeft - Metrics.pill.artLeft - Metrics.pill.art,
  },
  pillArtist: { color: Palette.onPlayerSecondary, fontSize: 14 },

  title: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  controls: { flexDirection: 'row', alignItems: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },

  track: { height: 2, borderRadius: 1, backgroundColor: Palette.track },
  trackFill: { height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' },
  playhead: {
    position: 'absolute',
    top: -3.5,
    width: 2,
    height: 9,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
});
