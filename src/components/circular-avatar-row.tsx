import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, FONT } from '@/utils/trip-tokens';

type Item = { id: string; name: string; imageUrl: string };
type Props = { items: readonly Item[]; showStatus?: boolean };

const AVATAR = 64;
const RING = AVATAR + 6; // ring slightly larger than avatar
const R = RING / 2 - 2;  // radius leaving room for stroke
const CIRCUMFERENCE = 2 * Math.PI * R;
const DASH = 4;
const GAP = 3;

/** Dashed SVG ring — WhatsApp/Snap story indicator */
function StatusRing() {
  return (
    <Svg
      width={RING}
      height={RING}
      style={s.ring}
      viewBox={`0 0 ${RING} ${RING}`}
    >
      <Circle
        cx={RING / 2}
        cy={RING / 2}
        r={R}
        fill="none"
        stroke={COLORS.brand}
        strokeWidth={2}
        strokeDasharray={`${DASH} ${GAP}`}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function CircularAvatarRow({ items, showStatus = false }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.content}
    >
      {items.map((item) => (
        <View key={item.id} style={s.item}>
          <View style={s.avatarWrap}>
            {showStatus && <StatusRing />}
            <Image
              source={{ uri: item.imageUrl }}
              style={s.avatar}
              contentFit="cover"
            />
          </View>
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
  item: { alignItems: 'center', width: RING },
  avatarWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  ring: {
    position: 'absolute',
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: COLORS.iconBg,
  },
  label: {
    fontSize: FONT.avatarLabel,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
