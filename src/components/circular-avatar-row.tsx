import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';

type Item = { id: string; name: string; imageUrl: string };
type Props = { items: readonly Item[] };

export default function CircularAvatarRow({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.content}
    >
      {items.map((item) => (
        <View key={item.id} style={s.item}>
          <Image
            source={{ uri: item.imageUrl }}
            style={s.avatar}
            contentFit="cover"
          />
          <Text style={s.label} numberOfLines={2}>{item.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.screenH,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  item: { alignItems: 'center', width: 64 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.iconBg,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT.avatarLabel,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
