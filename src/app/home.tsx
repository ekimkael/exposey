import { Image } from 'expo-image';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFlow } from '@/lib/flow-context';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** A single holding shown in the assets list. */
interface Asset {
  name: string;
  ticker: string;
  price: string;
  /** Day change in percent; sign drives the colour. */
  change: number;
}

/** Mock portfolio — replace with real data when wiring a backend. */
const ASSETS: Asset[] = [
  { name: 'Apple', ticker: 'AAPL', price: '$192.43', change: 1.2 },
  { name: 'Tesla', ticker: 'TSLA', price: '$245.10', change: -0.8 },
  { name: 'Bitcoin', ticker: 'BTC', price: '$67,420', change: 3.1 },
  { name: 'Amazon', ticker: 'AMZN', price: '$178.22', change: 0.5 },
];

/**
 * Home dashboard shown after onboarding completes.
 *
 * A greeting, an accent balance card, and the user's holdings. Terminal screen
 * of the flow — no header, no back gesture.
 */
export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useFlow();
  const name = profile.firstName.trim() || 'there';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 20, gap: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: font.regular, fontSize: 14, color: colors.textMuted }}>Welcome back</Text>
          <Text style={{ fontFamily: font.bold, fontSize: 24, color: colors.text }}>Hi, {name} 👋</Text>
        </View>
        <Image source={require('@/assets/images/logo-octagon.svg')} style={{ width: 36, height: 36 }} />
      </View>

      <View
        style={{
          backgroundColor: colors.accent,
          borderRadius: 24,
          borderCurve: 'continuous',
          padding: 22,
          gap: 8,
        }}>
        <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.accentText, opacity: 0.7 }}>
          Total balance
        </Text>
        <Text selectable style={{ fontFamily: font.bold, fontSize: 38, color: colors.accentText }}>
          $24,580.42
        </Text>
        <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.accentText }}>+2.4% today</Text>
      </View>

      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 18, color: colors.text, marginBottom: 8 }}>Your assets</Text>
        {ASSETS.map((asset, i) => (
          <View key={asset.ticker}>
            <AssetRow asset={asset} />
            {i < ASSETS.length - 1 ? <View style={{ height: 1, backgroundColor: colors.divider }} /> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** One holding row: ticker badge, name, price, and signed day change. */
function AssetRow({ asset }: { asset: Asset }) {
  const { colors } = useTheme();
  const up = asset.change >= 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          borderCurve: 'continuous',
          backgroundColor: colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.text }}>{asset.ticker.slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 16, color: colors.text }}>{asset.name}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 13, color: colors.textMuted }}>{asset.ticker}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] }}>
          {asset.price}
        </Text>
        <Text style={{ fontFamily: font.medium, fontSize: 13, color: up ? colors.accent : colors.danger }}>
          {up ? '+' : ''}
          {asset.change.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}
