import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContinueButton } from '@/components/continue-button';
import { applyKey, splitAmount } from '@/lib/amount';
import { font } from '@/lib/fonts';

const PINK = '#E946A8';
const AVAILABLE = 500.65;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

function HeaderPill() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FCEAF5', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 }}>
      <Image source="sf:paperplane.fill" tintColor={PINK} style={{ width: 14, height: 14 }} />
      <Text style={{ color: PINK, fontFamily: font.semibold, fontSize: 15 }}>Send Money</Text>
    </View>
  );
}

export default function SendMoney() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [amount, setAmount] = useState('100.25');
  const { dollars, cents } = splitAmount(amount);
  const exceeded = parseFloat(amount || '0') > AVAILABLE;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingBottom: insets.bottom }}>
      <Stack.Screen options={{ headerTitle: () => <HeaderPill />, headerBackVisible: false }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.left" onPress={() => router.back()} />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="ellipsis" onPress={() => {}} />
      </Stack.Toolbar>

      {/* Recipient card */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, marginBottom: 6 }}>
          <Text style={{ color: '#9A9A9A', fontSize: 13, fontFamily: font.regular }}>Recipient Name/Bank</Text>
          <Text style={{ color: '#9A9A9A', fontSize: 13, fontFamily: font.regular }}>Bank Account</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 16, fontFamily: font.bold, color: '#111' }}>Aliko Mohammed Dangote</Text>
            <Text style={{ fontSize: 14, color: '#9A9A9A', fontFamily: font.regular }}>Grey Finance</Text>
          </View>
          <Text selectable style={{ fontSize: 15, color: '#444', fontFamily: font.regular, fontVariant: ['tabular-nums'] }}>
            2893902383
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, gap: 6 }}>
        <Text selectable style={{ fontSize: 64, fontFamily: font.bold, fontVariant: ['tabular-nums'] }}>
          <Text style={{ color: '#111' }}>${dollars}</Text>
          <Text style={{ color: '#B8B8B8' }}>{cents}</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Image source="sf:creditcard" tintColor="#9A9A9A" style={{ width: 18, height: 14 }} />
          <Text style={{ color: '#9A9A9A', fontSize: 15, fontFamily: font.regular }}>
            Available: <Text style={{ color: '#111', fontFamily: font.bold }}>${AVAILABLE.toFixed(2)}</Text>
          </Text>
        </View>
      </View>

      {/* Error message */}
      {exceeded && (
        <View style={{ marginHorizontal: 20, marginBottom: 8, backgroundColor: '#FFF0F0', borderRadius: 12, borderCurve: 'continuous', paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source="sf:exclamationmark.circle.fill" tintColor="#E0312A" style={{ width: 16, height: 16 }} />
          <Text style={{ color: '#E0312A', fontSize: 13, fontFamily: font.medium }}>
            Montant supérieur au solde disponible
          </Text>
        </View>
      )}

      {/* Keypad */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, opacity: exceeded ? 0.35 : 1 }}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => {
              // always allow del to unblock
              if (exceeded && k !== 'del') return;
              setAmount((v) => applyKey(v, k));
            }}
            style={({ pressed }) => ({
              width: '33.333%',
              height: 70,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed && (!exceeded || k === 'del') ? 0.4 : 1,
            })}>
            <View style={{ width: '88%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: '#F4F4F4' }}>
              {k === 'del' ? (
                <Image source="sf:delete.left" tintColor="#111" style={{ width: 24, height: 22 }} />
              ) : (
                <Text style={{ fontSize: 26, fontFamily: font.medium, color: '#111' }}>{k}</Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>

      {/* Continue */}
      <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <ContinueButton />
      </View>
    </View>
  );
}
