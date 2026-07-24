import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Metrics, Palette } from '@/constants/pumice';

interface Album {
  title: string;
  artist: string;
  cover: number;
}

/** Play badges are baked into the extracted artwork, so tiles draw no overlay. */
const ALBUMS: Album[] = [
  { title: 'Lekso', artist: 'Flowme', cover: require('@/assets/pumice/lekso.png') },
  { title: 'The only one', artist: 'Make2Beats', cover: require('@/assets/pumice/only-one.png') },
  { title: 'Lately', artist: 'Roomie', cover: require('@/assets/pumice/lekso.png') },
];

export function AlbumRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.rowContent}>
      {ALBUMS.map((album) => (
        <View key={album.title} style={styles.tile}>
          <Image source={album.cover} style={styles.tileCover} contentFit="cover" />
          <Text style={styles.tileTitle}>{album.title}</Text>
          <Text style={styles.tileArtist}>{album.artist}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function CollabRow() {
  return (
    <View style={styles.collab}>
      <Image source={require('@/assets/pumice/rickt.png')} style={styles.collabAvatar} />
      <View style={styles.collabText}>
        <Text style={styles.collabTitle}>
          RickT <Text style={styles.collabConjunction}>and</Text> Sharper
        </Text>
        <Text style={styles.collabSubtitle}>Mutual album</Text>
      </View>
      <SymbolView
        name={{ ios: 'arrow.right', android: 'arrow_forward' }}
        size={17}
        tintColor={Palette.text}
      />
    </View>
  );
}

export function FeaturedCard() {
  return (
    <View style={styles.card}>
      <Image
        source={require('@/assets/pumice/surpass-cover.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <Image source={require('@/assets/pumice/surpass.png')} style={styles.cardArt} />
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>Surpass</Text>
        <Text style={styles.cardSubtitle}>17 songs</Text>
      </View>
      <View style={styles.cardAction}>
        <SymbolView name={{ ios: 'plus.circle', android: 'add_circle' }} size={19} tintColor="#FFFFFF" />
      </View>
    </View>
  );
}

const { page, tile, card } = Metrics;

const styles = StyleSheet.create({
  // ScrollView defaults to flexGrow: 1, which would let the row eat the
  // column's slack instead of the spacer above it.
  row: { flexGrow: 0 },
  rowContent: { paddingHorizontal: page.inset, gap: tile.gap },
  tile: { width: tile.width },
  tileCover: {
    width: tile.width,
    height: tile.height,
    borderRadius: tile.radius,
    marginBottom: 10,
  },
  tileTitle: { fontSize: 15, fontWeight: '700', color: Palette.text },
  tileArtist: { fontSize: 13, color: Palette.textSecondary, marginTop: 2 },

  collab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: page.inset,
    paddingTop: 32,
    paddingBottom: 14,
  },
  collabAvatar: { width: 32, height: 32, borderRadius: 8 },
  collabText: { flex: 1 },
  collabTitle: { fontSize: 15, fontWeight: '700', color: Palette.text },
  collabConjunction: { fontWeight: '400', color: Palette.textSecondary },
  collabSubtitle: { fontSize: 12, color: Palette.textSecondary, marginTop: 1 },

  card: {
    height: card.height,
    marginHorizontal: page.inset,
    borderRadius: card.radius,
    overflow: 'hidden',
    backgroundColor: '#8FA8C8',
  },
  cardArt: {
    position: 'absolute',
    top: card.pad,
    left: card.pad,
    width: card.art,
    height: card.art,
    borderRadius: card.artRadius,
  },
  cardText: { position: 'absolute', top: card.pad + 4, left: card.pad + card.art + 15 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cardSubtitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2 },
  cardAction: {
    position: 'absolute',
    top: card.pad + 5,
    right: 18,
    width: card.action,
    height: card.action,
    borderRadius: card.action / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.scrim,
  },
});
