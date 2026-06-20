import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { SocialButton } from '@/components/social-button';
import { TextField } from '@/components/text-field';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * Login screen — "Glad to see you again".
 *
 * Email + password fields, an "Or continue with" divider over the Google /
 * Apple providers, and a "Sign up" link. The primary button stays disabled
 * until both fields have content, then continues into country selection.
 */
export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, gap: 24 }}
        keyboardDismissMode="interactive">
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 30, color: colors.text }}>Glad to see you again</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 15, color: colors.textMuted }}>Log in to your account.</Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextField
            icon="envelope"
            placeholder="Your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextField icon="lock" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <PrimaryButton label="Log in" disabled={!canSubmit} onPress={() => router.push('/country')} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
          <Text style={{ fontFamily: font.regular, fontSize: 13, color: colors.textMuted }}>Or continue with</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SocialButton label="Google" onPress={() => router.push('/country')} />
          <SocialButton label="Apple" icon="apple.logo" onPress={() => router.push('/country')} />
        </View>
      </ScrollView>

      <Pressable onPress={() => router.push('/country')} style={{ alignSelf: 'center', paddingBottom: insets.bottom + 12 }}>
        <Text style={{ fontFamily: font.regular, fontSize: 14, color: colors.textMuted }}>
          Don&apos;t have an account? <Text style={{ fontFamily: font.semibold, color: colors.text }}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}
