import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/**
 * Inline error banner shown above the keypad when the entered amount exceeds
 * the available balance. The caller is responsible for conditional rendering.
 *
 * @param message - Human-readable error text.
 */
export function ErrorBanner({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.dangerSoft }]}>
      <Image source="sf:exclamationmark.circle.fill" tintColor={colors.danger} style={styles.icon} />
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  icon: { width: 16, height: 16 },
  text: { fontSize: 13, fontFamily: font.medium },
});
