import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { PressScale } from '@/components/press-scale';
import { Elevation, Metrics, NowPlaying, Palette } from '@/constants/pumice';

const artwork = require('@/assets/pumice/rock-that.png');

type AnimatedStyleProp = ComponentProps<typeof Animated.View>['style'];
/** Accepts composed gestures (`Gesture.Exclusive`), not just leaf recognisers. */
type PlayerGesture = ComponentProps<typeof GestureDetector>['gesture'];

interface PlayerProps {
  style: AnimatedStyleProp;
  gesture: PlayerGesture;
  playing: boolean;
  onPlayPause: () => void;
}

interface ControlsProps {
  airplay: number;
  play: number;
  gap: number;
  playing: boolean;
  onPlayPause: () => void;
}

/** AirPlay has nothing to route to here, so it stays a non-interactive glyph. */
function Controls({ airplay, play, gap, playing, onPlayPause }: ControlsProps) {
  return (
    <View style={[styles.controls, { gap }]}>
      <View
        style={[
          styles.circle,
          { width: airplay, height: airplay, borderRadius: airplay / 2, backgroundColor: Palette.control },
        ]}>
        <SymbolView name={{ ios: 'airplayaudio', android: 'airplay' }} size={airplay * 0.55} tintColor="#FFFFFF" />
      </View>
      <PressScale
        onPress={onPlayPause}
        scaleTo={0.96}
        hitSlop={8}
        accessibilityLabel={playing ? 'Pause' : 'Play'}
        style={[styles.circle, { width: play, height: play, borderRadius: play / 2, backgroundColor: '#FFFFFF' }]}>
        <SymbolView
          name={playing ? { ios: 'pause.fill', android: 'pause' } : { ios: 'play.fill', android: 'play_arrow' }}
          size={play * 0.5}
          tintColor="#000000"
        />
      </PressScale>
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

/**
 * Expanded state: a full-width sheet at the bottom edge. The page appears to end
 * above it with rounded bottom corners (see `corner` below) while the sheet casts
 * upward onto it, so it reads as resting on top rather than as the floor. Drag it
 * down anywhere to collapse; the grabber doubles as a tap target for anyone who
 * cannot pan.
 */
export function DockPlayer({
  style,
  gesture,
  grabberGesture,
  playing,
  onPlayPause,
}: PlayerProps & { grabberGesture: PlayerGesture }) {
  const { dock, page } = Metrics;
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.dock, style]}>
        <View style={[styles.corner, { left: 0, top: -page.bottomRadius }]}>
          <View style={[styles.cornerDisc, { left: 0 }]} />
        </View>
        <View style={[styles.corner, { right: 0, top: -page.bottomRadius }]}>
          <View style={[styles.cornerDisc, { right: 0 }]} />
        </View>

        <GestureDetector gesture={grabberGesture}>
          <View
            style={styles.grabberTarget}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Collapse player"
            accessibilityHint="Shrinks the player back to a floating bar">
            <View style={styles.grabber} />
          </View>
        </GestureDetector>

        <View style={[styles.dockRow, { top: dock.artTop, left: dock.inset, right: dock.buttonRight }]}>
          <Image source={artwork} style={{ width: dock.art, height: dock.art, borderRadius: dock.artRadius }} />
          <View style={styles.dockText}>
            <Text style={[styles.title, styles.dockTitle]}>{NowPlaying.title}</Text>
            <Text style={styles.dockArtist}>{NowPlaying.artist}</Text>
          </View>
          <Controls
            airplay={dock.airplay}
            play={dock.play}
            gap={dock.buttonGap}
            playing={playing}
            onPlayPause={onPlayPause}
          />
        </View>
        <Progress style={{ position: 'absolute', top: dock.progressTop, left: dock.textLeft, right: dock.inset }} />
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Resting state: compact rounded bar floating above the bottom edge, title and
 * artist on one line. Tapping the artwork or the text expands it.
 */
export function PillPlayer({
  style,
  gesture,
  pressStyle,
  playing,
  onPlayPause,
}: PlayerProps & { pressStyle: AnimatedStyleProp }) {
  const { pill } = Metrics;
  return (
    <Animated.View style={[styles.pill, style]}>
      <View style={[styles.pillRow, { left: pill.artLeft, right: pill.buttonRight }]}>
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[styles.pillTarget, pressStyle]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${NowPlaying.title} by ${NowPlaying.artist}`}
            accessibilityHint="Expands the player">
            <Image source={artwork} style={{ width: pill.art, height: pill.art, borderRadius: pill.artRadius }} />
            <View style={styles.pillText}>
              <Text style={styles.title}>{NowPlaying.title}</Text>
              <Text style={styles.pillArtist}>{NowPlaying.artist}</Text>
            </View>
          </Animated.View>
        </GestureDetector>
        <Controls
          airplay={pill.airplay}
          play={pill.play}
          gap={pill.buttonGap}
          playing={playing}
          onPlayPause={onPlayPause}
        />
      </View>
      <Progress
        style={{ position: 'absolute', top: pill.progressTop, left: pill.textLeft, right: pill.progressRight }}
      />
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
    boxShadow: Elevation.dock,
  },
  // ponytail: the page's rounded bottom corners are faked with two filled
  // squares carrying a page-coloured disc, instead of clipping the whole page
  // (which would need an animated height). Only works because the page keeps at
  // least `bottomRadius` of clear margin on both edges.
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
  // The grabber is 20x4 in the reference; the target around it is what makes
  // it reachable without a drag.
  grabberTarget: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 88,
    height: 44,
    alignItems: 'center',
    // Keeps the bar itself exactly where the reference puts it; the rest of
    // the box is invisible padding that makes it hittable.
    paddingTop: Metrics.dock.grabberTop,
  },
  grabber: { width: 20, height: 4, borderRadius: 2, backgroundColor: Palette.control },
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
    boxShadow: Elevation.pill,
  },
  pillRow: {
    position: 'absolute',
    top: Metrics.pill.textCenter - Metrics.pill.art / 2,
    height: Metrics.pill.art,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillTarget: { flex: 1, flexDirection: 'row', alignItems: 'center' },
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
