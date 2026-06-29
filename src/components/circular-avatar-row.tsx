import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import StoryRing from '@/components/story-ring';
import StoryViewer from '@/components/story-viewer';

type Item = { id: string; name: string; imageUrl: string };
type Props = { items: readonly Item[]; showStatus?: boolean };

const AVATAR = 60;
const RING_SIZE = AVATAR + 8;

export default function CircularAvatarRow({ items, showStatus = false }: Props) {
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {items.map((item, i) => (
          <Pressable key={item.id} style={s.item} onPress={() => showStatus && openStory(i)}>
            <View style={s.avatarWrap}>
              {showStatus && (
                <StoryRing size={RING_SIZE} viewed={viewed.has(i)} />
              )}
              <Image
                source={{ uri: item.imageUrl }}
                style={[s.avatar, showStatus && s.avatarOffset]}
                contentFit="cover"
              />
            </View>
            <Text style={s.label} numberOfLines={2}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {showStatus && (
        <StoryViewer
          items={items as Item[]}
          startIndex={viewerIndex ?? 0}
          visible={viewerIndex !== null}
          onClose={closeStory}
        />
      )}
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
});
