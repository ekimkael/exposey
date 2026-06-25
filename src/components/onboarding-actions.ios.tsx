/**
 * CTA buttons rendered as native SwiftUI views via `@expo/ui/swift-ui`.
 * Press fires a haptic tap; no navigation is wired (UI showcase only).
 *
 * @platform ios
 * @module components/onboarding-actions
 */
import { View, StyleSheet } from 'react-native';
import { Host, Button } from '@expo/ui/swift-ui';
import * as Haptics from 'expo-haptics';

export default function OnboardingActions() {
  return (
    <View style={styles.container}>
      {/* ponytail: SwiftUI Button takes on system appearance; custom pill styling not exposed */}
      <Host style={styles.primaryHost}>
        <Button
          label=" Continue with Apple"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        />
      </Host>
      <Host style={styles.secondaryHost}>
        <Button
          label="Restore from iCloud"
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, marginTop: 8 },
  primaryHost: { height: 50 },
  secondaryHost: { height: 44 },
});
