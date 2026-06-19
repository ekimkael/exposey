import { Pressable, Text, View } from 'react-native';

// Native Continue CTA: SwiftUI button on iOS, Jetpack Compose on Android, RN fallback on web.
// ponytail: requires a custom dev build (npx expo run:ios/android) — @expo/ui native views don't render in Expo Go or web.
export function ContinueButton({ onPress }: { onPress?: () => void }) {
  if (process.env.EXPO_OS === 'ios') {
    const { Host, Button } = require('@expo/ui/swift-ui');
    const { buttonStyle, controlSize, tint, frame } = require('@expo/ui/swift-ui/modifiers');
    return (
      <Host matchContents>
        <Button
          label="Continue"
          onPress={onPress}
          modifiers={[buttonStyle('borderedProminent'), controlSize('large'), tint('#111'), frame({ minWidth: 200 })]}
        />
      </Host>
    );
  }

  if (process.env.EXPO_OS === 'android') {
    const { Host, Button, Text: UIText } = require('@expo/ui/jetpack-compose');
    return (
      <Host matchContents>
        <Button onClick={onPress} colors={{ containerColor: '#111', contentColor: '#fff' }}>
          <UIText>Continue</UIText>
        </Button>
      </Host>
    );
  }

  // web fallback
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ backgroundColor: '#111', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 999, opacity: pressed ? 0.8 : 1 })}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Continue</Text>
      </Pressable>
    </View>
  );
}
