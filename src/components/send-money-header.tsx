import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { ANIMATION_OPTIONS, type AnimationStyle } from '@/components/amount-display';
import { font } from '@/lib/fonts';
import { useTheme, type ThemeMode } from '@/theme/theme-context';

/** Theme picker entries (preference → label + SF Symbol). */
const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: SFSymbol }[] = [
  { mode: 'system', label: 'System', icon: 'gearshape' },
  { mode: 'light', label: 'Light', icon: 'sun.max' },
  { mode: 'dark', label: 'Dark', icon: 'moon' },
];

/**
 * The pink "Send Money" pill shown as the navigation bar title.
 *
 * Pass as `headerTitle: () => <HeaderPill />` in the screen's `Stack.Screen`
 * options so it sits centered in the native header.
 */
export function HeaderPill() {
  const { colors } = useTheme();
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

export interface HeaderMenuProps {
  /** Currently selected entry animation. */
  animationStyle: AnimationStyle;
  /** Called when the user picks a different animation. */
  onAnimationChange: (style: AnimationStyle) => void;
}

/**
 * Right-side header toolbar (`…`) holding two pickers: entry animation and
 * theme. Theme state is read/written through {@link useTheme} directly, so the
 * caller only wires the animation choice.
 *
 * iOS only — `Stack.Toolbar` renders nothing on Android/web. Every
 * `Stack.Toolbar.*` element must live in this single component (Expo Router
 * cannot collect children spread across components).
 */
export function HeaderMenu({ animationStyle, onAnimationChange }: HeaderMenuProps) {
  const { mode, setMode } = useTheme();
  const animationKeys = Object.keys(ANIMATION_OPTIONS) as AnimationStyle[];

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="ellipsis">
        <Stack.Toolbar.Menu inline title="Animation">
          {animationKeys.map((key) => (
            <Stack.Toolbar.MenuAction
              key={key}
              icon={ANIMATION_OPTIONS[key].icon}
              isOn={animationStyle === key}
              onPress={() => onAnimationChange(key)}>
              {ANIMATION_OPTIONS[key].label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>

        <Stack.Toolbar.Menu inline title="Theme">
          {THEME_OPTIONS.map((option) => (
            <Stack.Toolbar.MenuAction
              key={option.mode}
              icon={option.icon}
              isOn={mode === option.mode}
              onPress={() => setMode(option.mode)}>
              {option.label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
