import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverflowStrip } from '@/components/coverflow-strip';
import { READING_LOG } from '@/data/reading-log';

/** Side inset on the hero, measured off the reference at ~12.7% of the screen. */
const HERO_INSET = 50;
const HERO_ASPECT = 0.688;
/** Empty space the reference leaves under the strip. */
const STRIP_BOTTOM_GAP = 73;

export default function ReadingLogScreen() {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(0);
  const handleSelect = useCallback((index: number) => setSelected(index), []);
  const entry = READING_LOG[selected];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <SymbolView name="xmark" size={20} tintColor="#fff" />
        <Text style={styles.title}>Read at least 10 pages</Text>
        <SymbolView name="trash" size={20} tintColor="#fff" />
      </View>

      <Image
        source={entry.scene}
        style={[styles.hero, { width: width - HERO_INSET * 2 }]}
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
  screen: { flex: 1, backgroundColor: '#000' },
  header: {
    height: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '600' },
  hero: { aspectRatio: HERO_ASPECT, alignSelf: 'center', marginTop: 20, borderRadius: 20 },
  date: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20 },
  strip: { marginTop: 'auto', marginBottom: STRIP_BOTTOM_GAP },
});
