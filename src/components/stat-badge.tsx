import { Text, View } from 'react-native';

import { Icon } from '@/components/icon';

interface StatBadgeProps {
  /** SF Symbol name (e.g. `flame.fill`, `clock`). */
  icon: string;
  /** Pre-formatted value (e.g. `9,543`, `8h 35m`). */
  label: string;
  /** Text + icon colour. */
  color?: string;
}

/** An icon + label pair used for playlist stats (play count, duration). */
export function StatBadge({ icon, label, color = 'rgba(255,255,255,0.85)' }: StatBadgeProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon name={icon} size={13} color={color} />
      <Text style={{ fontSize: 12, color, fontVariant: ['tabular-nums'] }}>{label}</Text>
    </View>
  );
}
