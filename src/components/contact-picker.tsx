import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type Recipient } from '@/components/recipient-card';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

interface ContactPickerProps {
  visible: boolean;
  contacts: Recipient[];
  onSelect: (contact: Recipient) => void;
  onClose: () => void;
}

export function ContactPicker({ visible, contacts, onSelect, onClose }: ContactPickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
        <View style={[styles.header, { borderBottomColor: colors.surfaceMuted }]}>
          <Text style={[styles.title, { color: colors.text }]}>Contacts</Text>
          <Pressable onPress={onClose} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Text style={[styles.close, { color: colors.accent }]}>Done</Text>
          </Pressable>
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.phone}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.surfaceMuted }]} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { onSelect(item); onClose(); }}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
              <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.avatarLetter, { color: colors.accent }]}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.phone, { color: colors.textMuted }]}>{item.phone}</Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontFamily: font.semibold },
  close: { fontSize: 16, fontFamily: font.medium },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 16, fontFamily: font.semibold },
  name: { fontSize: 15, fontFamily: font.medium },
  phone: { fontSize: 13, fontFamily: font.regular, marginTop: 1 },
});
