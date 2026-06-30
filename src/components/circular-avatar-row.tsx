import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';
import StoryRing from '@/components/story-ring';
import StoryViewer from '@/components/story-viewer';
import type { StoryViewerItem } from '@/components/story-viewer';

/** A raw story slide as stored in mock data (no `name` — name comes from parent item). */
type StorySlide = { id: string; imageUrl: string };

/**
 * A single item in the avatar row.
 * `stories` is optional — items without it show no ring and open no viewer.
 */
type AvatarItem = {
  id: string;
  name: string;
  imageUrl: string;
  stories?: readonly StorySlide[];
};

/** Props for CircularAvatarRow. */
type Props = {
  /** Items to render as circular avatars. */
  items: readonly AvatarItem[];
  /**
   * When true, each avatar gets a story ring and tapping opens StoryViewer.
   * Items without a `stories` array are still tappable but show a single ring.
   */
  showStatus?: boolean;
  /**
   * When true, renders a 4-column flex grid instead of a horizontal ScrollView.
   * Use for sections where all items should be visible at once.
   */
  grid?: boolean;
};

const AVATAR_SIZE = 60;
const RING_SIZE   = AVATAR_SIZE + 8;

/** Build the flat slide list that StoryViewer expects from a single AvatarItem. */
function buildViewerItems(item: AvatarItem): StoryViewerItem[] {
  if (item.stories && item.stories.length > 0) {
    return item.stories.map((slide) => ({
      id:       slide.id,
      name:     item.name,
      imageUrl: slide.imageUrl,
    }));
  }
  return [{ id: item.id, name: item.name, imageUrl: item.imageUrl }];
}

export default function CircularAvatarRow({ items, showStatus = false, grid = false }: Props) {
  const [activeViewerIndex, setActiveViewerIndex] = useState<number | null>(null);
  /** Set of item indices whose stories have been fully seen at least once. */
  const [viewedIndices, setViewedIndices] = useState<Set<number>>(new Set());

  const openViewer = (index: number) => setActiveViewerIndex(index);

  const closeViewer = () => {
    if (activeViewerIndex !== null) {
      setViewedIndices((prev) => new Set(prev).add(activeViewerIndex));
    }
    setActiveViewerIndex(null);
  };

  const renderAvatar = (item: AvatarItem, index: number) => {
    const isViewed = viewedIndices.has(index);
    const segmentCount = item.stories?.length ?? 1;

    return (
      <Pressable
        key={item.id}
        style={grid ? s.gridItem : s.scrollItem}
        onPress={() => showStatus && openViewer(index)}
        accessibilityRole="button"
        accessibilityLabel={`Open stories for ${item.name}`}
      >
        <View style={s.avatarWrap}>
          {showStatus && (
            <StoryRing size={RING_SIZE} viewed={isViewed} segments={segmentCount} />
          )}
          <Image
            source={{ uri: item.imageUrl }}
            style={[s.avatar, showStatus && s.avatarWithRing]}
            contentFit="cover"
          />
        </View>
        <Text style={s.label} numberOfLines={2}>{item.name}</Text>
      </Pressable>
    );
  };

  const activeItem = activeViewerIndex !== null ? items[activeViewerIndex] : null;

  return (
    <>
      {grid ? (
        <View style={s.gridContainer}>
          {items.map((item, i) => renderAvatar(item, i))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
        >
          {items.map((item, i) => renderAvatar(item, i))}
        </ScrollView>
      )}

      {showStatus && activeItem != null && (
        <StoryViewer
          items={buildViewerItems(activeItem)}
          startIndex={0}
          visible
          onClose={closeViewer}
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.screenH,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenH,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  scrollItem: { alignItems: 'center', width: RING_SIZE },
  gridItem:   { alignItems: 'center', flex: 1 },
  avatarWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.iconBg,
  },
  // Slightly smaller when the ring is visible — creates the 2dp gap between ring and photo.
  avatarWithRing: {
    width: AVATAR_SIZE - 2,
    height: AVATAR_SIZE - 2,
    borderRadius: (AVATAR_SIZE - 2) / 2,
  },
  label: {
    fontSize: FONT.avatarLabel,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
