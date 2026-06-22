import { Stack } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { type LayoutChangeEvent, type ViewToken, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { PlaylistCard } from '@/components/playlist-card';
import { layout } from '@/constants/layout';
import { CATEGORIES, PLAYLISTS, palette, type Category, type Playlist } from '@/constants/playlists';

/** A card is "active" once it covers at least this much of the viewport. */
const ACTIVE_VISIBILITY_PERCENT = 60;

/**
 * Featured screen — a vertical, snapping feed of playlist cards. The card
 * snapped to the top autoplays its preview; scrolling scales the neighbours
 * down. The header is the native stack header: a hamburger button and a native
 * category menu on the left, list/search actions on the right.
 */
export default function FeaturedScreen() {
  const [category, setCategory] = useState<Category>('Featured');
  const [activeId, setActiveId] = useState(PLAYLISTS[0]?.id);
  const [areaHeight, setAreaHeight] = useState(0);

  // Card fills most of the area below the header, leaving a peek of the next.
  const cardHeight = Math.round(areaHeight * layout.feed.cardHeightRatio);
  const snap = cardHeight + layout.feed.cardGap;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: ACTIVE_VISIBILITY_PERCENT }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0]?.item as Playlist | undefined;
    if (first) setActiveId(first.id);
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: Playlist; index: number }) => (
      <PlaylistCard
        playlist={item}
        active={item.id === activeId}
        scrollY={scrollY}
        index={index}
        height={cardHeight}
        snap={snap}
      />
    ),
    [activeId, scrollY, cardHeight, snap],
  );

  const onAreaLayout = (e: LayoutChangeEvent) => setAreaHeight(e.nativeEvent.layout.height);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }} onLayout={onAreaLayout}>
      <Stack.Screen options={{ headerShown: true, title: '', headerShadowVisible: false }} />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="line.3.horizontal" onPress={() => {}} />
        <Stack.Toolbar.Menu title={category}>
          {CATEGORIES.map((c) => (
            <Stack.Toolbar.MenuAction key={c} isOn={c === category} onPress={() => setCategory(c)}>
              {c}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="square.grid.2x2" onPress={() => {}} />
        <Stack.Toolbar.Button icon="magnifyingglass" onPress={() => {}} />
      </Stack.Toolbar>

      {areaHeight > 0 && (
        <Animated.FlatList
          data={PLAYLISTS}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          snapToInterval={snap}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ItemSeparatorComponent={() => <View style={{ height: layout.feed.cardGap }} />}
          contentContainerStyle={{
            paddingHorizontal: layout.feed.horizontalPadding,
            paddingTop: 8,
            paddingBottom: layout.feed.cardGap,
          }}
        />
      )}
    </View>
  );
}
