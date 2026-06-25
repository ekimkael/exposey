/**
 * CTA buttons rendered as native Jetpack Compose Material3 views
 * via `@expo/ui/jetpack-compose`.
 * Press fires a haptic tap; no navigation is wired (UI showcase only).
 *
 * @platform android
 * @module components/onboarding-actions
 */
import { View, StyleSheet } from 'react-native';
import { Button, TextButton } from '@expo/ui/jetpack-compose';
import * as Haptics from 'expo-haptics';

export default function OnboardingActions() {
  return (
    <View style={styles.container}>
      <Button onClick={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
        Continue with Google
      </Button>
      <TextButton onClick={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
        Restore from Cloud
      </TextButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, marginTop: 8 },
});
