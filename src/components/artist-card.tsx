import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import type { Artist } from '@/constants/artists';

export const CARD_WIDTH = 296;
export const CARD_HEIGHT = 104;

/** Abstract stand-in for the artist photo (no real assets in the repo). */
function ArtistArt({ artist }: { artist: Artist }) {
  const [c1, c2] = artist.artColors;
  const shapes = {
    portrait: (
      <>
        <Circle cx="50" cy="34" r="16" fill={c2} opacity={0.9} />
        <Path d="M20 100 Q50 58 80 100 Z" fill={c2} opacity={0.9} />
      </>
    ),
    prism: <Polygon points="50,18 88,86 12,86" fill="#EDEDEA" opacity={0.92} />,
    band: (
      <>
        <Circle cx="28" cy="46" r="11" fill={c1} />
        <Circle cx="52" cy="42" r="11" fill={c1} />
        <Circle cx="76" cy="46" r="11" fill={c1} />
        <Rect x="14" y="60" width="72" height="40" rx="6" fill={c1} opacity={0.6} />
      </>
    ),
    landscape: (
      <>
        <Path d="M0 78 L34 40 L58 66 L78 48 L100 78 Z" fill={c2} opacity={0.85} />
        <Circle cx="72" cy="26" r="9" fill="#F5EFE2" opacity={0.9} />
      </>
    ),
    sun: (
      <>
        <Circle cx="50" cy="44" r="20" fill={c1} opacity={0.85} />
        <Rect x="0" y="70" width="100" height="30" fill={c2} opacity={0.7} />
      </>
    ),
    waves: (
      <>
        <Path d="M0 44 Q25 28 50 44 T100 44 V100 H0 Z" fill={c2} opacity={0.7} />
        <Path d="M0 62 Q25 46 50 62 T100 62 V100 H0 Z" fill={c2} opacity={0.9} />
      </>
    ),
  } as const;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c1} />
          <Stop offset="1" stopColor={c2} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill="url(#bg)" />
      {shapes[artist.art]}
    </Svg>
  );
}

/** One tilted sticker card of the marquee. */
export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: artist.bg,
          transform: [{ translateX: artist.offsetX }, { rotate: `${artist.tilt}deg` }],
        },
      ]}>
      <Text style={[styles.name, { color: artist.text }]}>{artist.name}</Text>
      <View style={styles.art}>
        <ArtistArt artist={artist} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 7,
    boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
  },
  name: {
    flex: 1,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 27,
    paddingRight: 8,
  },
  art: {
    width: 104,
    height: CARD_HEIGHT - 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
});
