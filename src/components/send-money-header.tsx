import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { ANIMATION_OPTIONS, type AnimationStyle } from '@/components/amount-display';
import { font } from '@/lib/fonts';
import { colors } from '@/theme/tokens';

/**
 * The pink "Send Money" pill shown as the navigation bar title.
 *
 * Pass as `headerTitle: () => <HeaderPill />` in the screen's `Stack.Screen`
 * options so it sits centered in the native header.
 */
export function HeaderPill() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: colors.accentSoft,
        borderRadius: 999,
      }}>
      <Image source="sf:paperplane.fill" tintColor={colors.accent} style={{ width: 14, height: 14 }} />
      <Text style={{ color: colors.accent, fontFamily: font.semibold, fontSize: 15 }}>Send Money</Text>
    </View>
  );
}

export interface AnimationMenuProps {
  /** Currently selected animation style. */
  value: AnimationStyle;
  /** Called when the user picks a different style. */
  onChange: (style: AnimationStyle) => void;
}

/**
 * Right-side header toolbar holding the animation picker (the `…` button).
 *
 * iOS only — `Stack.Toolbar` renders nothing on Android/web. The whole
 * `Stack.Toolbar` subtree must live in a single component (Expo Router cannot
 * collect `Stack.Toolbar.*` children spread across components).
 */
export function AnimationMenu({ value, onChange }: AnimationMenuProps) {
  const styleKeys = Object.keys(ANIMATION_OPTIONS) as AnimationStyle[];

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="ellipsis">
        <Stack.Toolbar.Menu inline title="Animation">
          {styleKeys.map((styleKey) => (
            <Stack.Toolbar.MenuAction
              key={styleKey}
              icon={ANIMATION_OPTIONS[styleKey].icon}
              isOn={value === styleKey}
              onPress={() => onChange(styleKey)}>
              {ANIMATION_OPTIONS[styleKey].label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
