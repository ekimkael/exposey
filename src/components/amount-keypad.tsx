import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { DELETE_KEY } from '@/lib/amount';
import { font } from '@/lib/fonts';
import { useTheme } from '@/theme/theme-context';

/** Keys rendered in the 3-column grid, in visual order. */
const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', DELETE_KEY] as const;

/** Opacity applied to disabled keys while the balance is exceeded. */
const DISABLED_OPACITY = 0.35;
/** Opacity applied to a key while it is pressed. */
const PRESSED_OPACITY = 0.4;

export interface AmountKeypadProps {
  /** Called with the pressed key. Parent applies it via `applyKey`. */
  onKeyPress: (key: string) => void;
  /**
   * When `true`, every key except {@link DELETE_KEY} is dimmed and inert so the
   * user can only delete back down to a valid amount.
   */
  locked: boolean;
}

/**
 * Numeric keypad for amount entry.
 *
 * Presentational: it owns no amount state, only forwarding presses to
 * `onKeyPress`. The backspace key stays fully active even when `locked`.
 */
export function AmountKeypad({ onKeyPress, locked }: AmountKeypadProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 }}>
      {KEYPAD_KEYS.map((key) => {
        const isDelete = key === DELETE_KEY;
        const isDisabled = locked && !isDelete;

        return (
          <Pressable
            key={key}
            disabled={isDisabled}
            onPress={() => onKeyPress(key)}
            style={({ pressed }) => ({
              width: '33.333%',
              height: 70,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isDisabled ? DISABLED_OPACITY : pressed ? PRESSED_OPACITY : 1,
            })}>
            <View
              style={{
                width: '88%',
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                backgroundColor: colors.keypadKey,
              }}>
              {isDelete ? (
                <Image source="sf:delete.left" tintColor={colors.text} style={{ width: 24, height: 22 }} />
              ) : (
                <Text style={{ fontSize: 26, fontFamily: font.medium, color: colors.text }}>{key}</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
