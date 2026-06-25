// ponytail: web/unknown-platform fallback — .ios.tsx and .android.tsx take over on device
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BRAND } from '@/utils/tokens';

export default function OnboardingActions() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.primary}>
        <Text style={styles.primaryText}>Continue with Apple</Text>
      </Pressable>
      <Pressable style={styles.secondary}>
        <Text style={styles.secondaryText}>Restore from iCloud</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, marginTop: 8 },
  primary: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '600', color: BRAND },
  secondary: { height: 44, justifyContent: 'center', alignItems: 'center' },
  secondaryText: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },
});
