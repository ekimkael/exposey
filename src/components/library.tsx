import { Host, Icon, List, ListItem } from '@expo/ui';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressScale } from '@/components/press-scale';
import { Metrics, Palette } from '@/constants/pumice';

/**
 * Plain `{ ios, android }` rather than `Icon.select` — both assets ship to both
 * platforms. Worth it for six icons: `Icon.select` needs dynamic `import()`,
 * which reads worse than a static table this small.
 */
const ROWS = [
  {
    label: 'Playlists',
    icon: { ios: 'music.note.list', android: require('@expo/material-symbols/queue_music.xml') },
  },
  {
    label: 'Artists',
    icon: { ios: 'music.mic', android: require('@expo/material-symbols/mic.xml') },
  },
  {
    label: 'Albums',
    icon: { ios: 'square.stack', android: require('@expo/material-symbols/album.xml') },
  },
  {
    label: 'Songs',
    icon: { ios: 'music.note', android: require('@expo/material-symbols/music_note.xml') },
  },
  {
    label: 'Made for You',
    icon: { ios: 'person.crop.square', android: require('@expo/material-symbols/person.xml') },
  },
  {
    label: 'Downloaded',
    icon: {
      ios: 'arrow.down.circle',
      android: require('@expo/material-symbols/download_for_offline.xml'),
    },
  },
] as const;

const CHEVRON = {
  ios: 'chevron.right',
  android: require('@expo/material-symbols/chevron_right.xml'),
} as const;

/** Track list under Recently Added — enough content to make the page overflow. */
const PLAYED = [
  { title: 'Rock that', artist: 'Flawor' },
  { title: 'Surpass', artist: 'RickT' },
  { title: 'The only one', artist: 'Make2Beats' },
  { title: 'Lekso', artist: 'Flowme' },
  { title: 'Mutual album', artist: 'RickT and Sharper' },
] as const;

const NOTE = {
  ios: 'music.note',
  android: require('@expo/material-symbols/music_note.xml'),
} as const;

const RECENT = [
  { title: 'Lekso', tracks: 12, cover: require('@/assets/pumice/lekso.png') },
  { title: 'The only one', tracks: 9, cover: require('@/assets/pumice/only-one.png') },
  { title: 'Surpass', tracks: 17, cover: require('@/assets/pumice/surpass.png') },
] as const;

/**
 * Entrances are split per section and staggered rather than fading the whole
 * page in as one block — the eye reads the hierarchy in the order it arrives.
 */
export const ENTER = (delay: number) => FadeInDown.duration(360).delay(delay);

/**
 * `matchContents` collapses to zero around a `List` — it is a scroll container,
 * so it has no intrinsic height to match, and the Host must be told how tall it
 * is. 58pt per row plus 68pt of grouped-section inset, measured on screen.
 *
 * ponytail: fixed height, so a larger Dynamic Type setting will clip the last
 * row. Upgrade path: drive it from the Host's `onLayoutContent` callback.
 */
/** Measured on screen: a headline-only row, and one carrying supporting text. */
const ROW_HEIGHT = 58;
const ROW_HEIGHT_TWO_LINE = 72;
const LIST_INSET = 68;
const listHeight = (rows: number, rowHeight = ROW_HEIGHT) => rows * rowHeight + LIST_INSET;

/** Native rows — SwiftUI `List` on iOS, Compose on Android, from one tree. */
export function LibraryRows() {
  return (
    <Host style={{ height: listHeight(ROWS.length) }}>
      <List>
        {ROWS.map((row) => (
          <ListItem
            key={row.label}
            leading={<Icon name={row.icon} size={22} color={Palette.accent} />}
            trailing={<Icon name={CHEVRON} size={14} color={Palette.chevron} />}
            onPress={() => {}}>
            {row.label}
          </ListItem>
        ))}
      </List>
    </Host>
  );
}

export function RecentlyAdded() {
  return (
    <View>
      <Animated.View entering={ENTER(180)}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
      </Animated.View>
      <View style={styles.strip}>
        {RECENT.map((album, index) => (
          <Animated.View key={album.title} entering={ENTER(240 + index * 90)} style={styles.tile}>
            <PressScale onPress={() => {}} scaleTo={0.96}>
              <Image source={album.cover} style={styles.cover} contentFit="cover" />
              <Text style={styles.tileTitle} numberOfLines={1}>
                {album.title}
              </Text>
            <Text style={styles.tileMeta} numberOfLines={1}>
                  {album.tracks} songs
              </Text>
            </PressScale>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/** Recently played tracks, same native list as the navigation rows above. */
export function RecentlyPlayed() {
  return (
    <View>
      <Animated.View entering={ENTER(510)}>
        <Text style={styles.sectionTitle}>Recently Played</Text>
      </Animated.View>
      <Host style={{ height: listHeight(PLAYED.length, ROW_HEIGHT_TWO_LINE) }}>
        <List>
          {PLAYED.map((track) => (
            <ListItem
              key={track.title}
              leading={<Icon name={NOTE} size={20} color={Palette.accent} />}
              supportingText={track.artist}
              onPress={() => {}}>
              {track.title}
            </ListItem>
          ))}
        </List>
      </Host>
    </View>
  );
}

const { page, tile } = Metrics;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    paddingHorizontal: page.inset,
    marginTop: 12,
    marginBottom: 12,
  },
  strip: { flexDirection: 'row', paddingHorizontal: page.inset, gap: tile.gap },
  tile: { flex: 1, alignItems: 'stretch' },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: tile.radius,
    marginBottom: 8,
    // A 1pt outline at 10% pure black keeps every cover's edge consistent no
    // matter how light its own corners are. Pure black, never a tinted neutral —
    // a tint picks up the page behind it and reads as dirt on the edge.
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  tileTitle: { fontSize: 14, fontWeight: '600', color: Palette.text },
  tileMeta: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
    // Track counts differ per tile; tabular figures stop them shifting width.
    fontVariant: ['tabular-nums'],
  },
});
