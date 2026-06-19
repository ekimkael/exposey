import { Pressable, Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { colors } from '@/theme/tokens';

export interface ContinueButtonProps {
  /** Tap handler. No-op by default (there is no next screen yet). */
  onPress?: () => void;
}

/**
 * Primary "Continue" call-to-action, rendered with each platform's native
 * button so it matches OS conventions:
 *
 * - **iOS** → SwiftUI `Button` (`@expo/ui/swift-ui`)
 * - **Android** → Jetpack Compose `Button` (`@expo/ui/jetpack-compose`)
 * - **web** → plain React Native `Pressable` fallback
 *
 * The native variants require a custom dev build (`npx expo run:ios|android`);
 * they do NOT render in Expo Go. Their labels use the system font — the JS
 * `font` family only applies to the web fallback. The platform modules are
 * `require`d lazily so each bundle only pulls in what it uses.
 */
export function ContinueButton({ onPress }: ContinueButtonProps) {
  if (process.env.EXPO_OS === 'ios') {
    const { Host, Button } = require('@expo/ui/swift-ui');
    const { buttonStyle, controlSize, tint, frame } = require('@expo/ui/swift-ui/modifiers');
    return (
      <Host matchContents>
        <Button
          label="Continue"
          onPress={onPress}
          modifiers={[buttonStyle('borderedProminent'), controlSize('large'), tint(colors.text), frame({ minWidth: 200 })]}
        />
      </Host>
    );
  }

  if (process.env.EXPO_OS === 'android') {
    const { Host, Button, Text: ComposeText } = require('@expo/ui/jetpack-compose');
    return (
      <Host matchContents>
        <Button onClick={onPress} colors={{ containerColor: colors.text, contentColor: colors.surface }}>
          <ComposeText>Continue</ComposeText>
        </Button>
      </Host>
    );
  }

  // Web fallback.
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          paddingHorizontal: 48,
          paddingVertical: 16,
          backgroundColor: colors.text,
          borderRadius: 999,
          opacity: pressed ? 0.8 : 1,
        })}>
        <Text style={{ color: colors.surface, fontSize: 16, fontFamily: font.semibold }}>Continue</Text>
      </Pressable>
    </View>
  );
}
