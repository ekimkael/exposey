import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import StoryRing from '@/components/story-ring';
import StoryViewer from '@/components/story-viewer';

type StorySlide = { id: string; imageUrl: string };
type Item = { id: string; name: string; imageUrl: string; stories?: readonly StorySlide[] };
type Props = { items: readonly Item[]; showStatus?: boolean; grid?: boolean };

const AVATAR = 60;
const RING_SIZE = AVATAR + 8;

export default function CircularAvatarRow({ items, showStatus = false, grid = false }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  // track which stories have been viewed
  const [viewed, setViewed] = useState<Set<number>>(new Set());

  const openStory = (i: number) => setViewerIndex(i);

  const closeStory = () => {
    if (viewerIndex !== null) {
      setViewed((prev) => new Set(prev).add(viewerIndex));
    }
    setViewerIndex(null);
  };

  return (
    <>
      {grid ? (
        <View style={s.gridContent}>
          {items.map((item, i) => (
            <Pressable key={item.id} style={s.gridItem} onPress={() => showStatus && openStory(i)}>
              <View style={s.avatarWrap}>
                {showStatus && <StoryRing size={RING_SIZE} viewed={viewed.has(i)} segments={item.stories?.length ?? 1} />}
                <Image source={{ uri: item.imageUrl }} style={[s.avatar, showStatus && s.avatarOffset]} contentFit="cover" />
              </View>
              <Text style={s.label} numberOfLines={2}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.content}>
          {items.map((item, i) => (
            <Pressable key={item.id} style={s.item} onPress={() => showStatus && openStory(i)}>
              <View style={s.avatarWrap}>
                {showStatus && <StoryRing size={RING_SIZE} viewed={viewed.has(i)} segments={item.stories?.length ?? 1} />}
                <Image source={{ uri: item.imageUrl }} style={[s.avatar, showStatus && s.avatarOffset]} contentFit="cover" />
              </View>
              <Text style={s.label} numberOfLines={2}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {showStatus && viewerIndex !== null && (() => {
        const item = items[viewerIndex];
        const storyItems = item?.stories
          ? (item.stories as StorySlide[]).map((s) => ({ id: s.id, name: item.name, imageUrl: s.imageUrl }))
          : [{ id: item?.id ?? '', name: item?.name ?? '', imageUrl: item?.imageUrl ?? '' }];
        return (
          <StoryViewer
            items={storyItems}
            startIndex={0}
            visible
            onClose={closeStory}
          />
        );
      })()}
    </>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.screenH,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  item: { alignItems: 'center', width: RING_SIZE },
  avatarWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: COLORS.iconBg,
  },
  avatarOffset: {
    // 2px gap between avatar and ring stroke
    width: AVATAR - 2,
    height: AVATAR - 2,
    borderRadius: (AVATAR - 2) / 2,
  },
  label: {
    fontSize: FONT.avatarLabel,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  gridContent: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenH,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  gridItem: { alignItems: 'center', flex: 1 },
});
