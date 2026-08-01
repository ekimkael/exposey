import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverflowStrip } from '@/components/coverflow-strip';
import { HeroPager } from '@/components/hero-pager';
import { COLORS, LAYOUT, TYPE } from '@/constants/theme';
import { READING_LOG } from '@/data/reading-log';

/** Which list the user is currently dragging, if any. */
type DragSource = 'hero' | 'strip' | null;

/**
 * Reading-log viewer: a swipeable hero photo with its date above a cylindrical
 * filmstrip. Either surface changes the entry, and each follows the other.
 *
 * `selected` is the single source of truth, but two scrollable lists can now
 * drive it, which without a protocol makes them fight: the strip scrolls the
 * hero, whose scroll event scrolls the strip, and so on. `activeSource` breaks
 * the cycle with one rule — a list is never scrolled programmatically while the
 * user is dragging it. It converges rather than loops, because a programmatic
 * scroll settles on the same index, `setSelected` is called with an unchanged
 * value, and React bails out before another scroll can be issued.
 */
export default function ReadingLogScreen() {
  const [selected, setSelected] = useState(0);
  const [activeSource, setActiveSource] = useState<DragSource>(null);
  const entry = READING_LOG[selected];

  const handleSelect = useCallback((index: number) => setSelected(index), []);
  const claimHero = useCallback(() => setActiveSource('hero'), []);
  const claimStrip = useCallback(() => setActiveSource('strip'), []);
  const releaseSource = useCallback(() => setActiveSource(null), []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <SymbolView name="xmark" size={20} tintColor={COLORS.foreground} />
        <Text style={styles.title}>Read at least 10 pages</Text>
        <SymbolView name="trash" size={20} tintColor={COLORS.foreground} />
      </View>

      <HeroPager
        entries={READING_LOG}
        selectedIndex={selected}
        isActiveSource={activeSource === 'hero'}
        onSelect={handleSelect}
        onDragStart={claimHero}
        onDragSettled={releaseSource}
      />
      <Text style={styles.date}>{entry.date}</Text>

      <View style={styles.strip}>
        <CoverflowStrip
          entries={READING_LOG}
          selectedIndex={selected}
          isActiveSource={activeSource === 'strip'}
          onSelect={handleSelect}
          onDragStart={claimStrip}
          onDragSettled={releaseSource}
        />
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
  date: {
    color: COLORS.foreground,
    ...TYPE.date,
    textAlign: 'center',
    marginTop: LAYOUT.gap,
  },
  strip: { marginTop: 'auto', marginBottom: LAYOUT.stripBottomGap },
});
