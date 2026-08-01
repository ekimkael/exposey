import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverflowStrip } from '@/components/coverflow-strip';
import { COLORS, LAYOUT, TYPE } from '@/constants/theme';
import { READING_LOG } from '@/data/reading-log';

/**
 * Reading-log viewer: a hero photo with its date above a cylindrical filmstrip.
 *
 * Scrolling the strip swaps the hero. The swap is a hard cut rather than a
 * crossfade — the reference recording shows no blend between entries, and
 * `transition={0}` keeps it that way.
 */
export default function ReadingLogScreen() {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(0);
  const handleSelect = useCallback((index: number) => setSelected(index), []);
  const entry = READING_LOG[selected];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <SymbolView name="xmark" size={20} tintColor={COLORS.foreground} />
        <Text style={styles.title}>Read at least 10 pages</Text>
        <SymbolView name="trash" size={20} tintColor={COLORS.foreground} />
      </View>

      <Image
        source={entry.scene}
        style={[styles.hero, { width: width - LAYOUT.heroInset * 2 }]}
        contentFit="cover"
        transition={0}
      />
      <Text style={styles.date}>{entry.date}</Text>

      <View style={styles.strip}>
        <CoverflowStrip entries={READING_LOG} onSelect={handleSelect} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    height: LAYOUT.headerHeight,
    paddingHorizontal: LAYOUT.headerPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: COLORS.foreground, ...TYPE.title },
  hero: {
    aspectRatio: LAYOUT.heroAspect,
    alignSelf: 'center',
    marginTop: LAYOUT.gap,
    borderRadius: LAYOUT.heroRadius,
  },
  date: {
    color: COLORS.foreground,
    ...TYPE.date,
    textAlign: 'center',
    marginTop: LAYOUT.gap,
  },
  strip: { marginTop: 'auto', marginBottom: LAYOUT.stripBottomGap },
});
