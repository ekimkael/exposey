import { Stack } from 'expo-router';
import type { SFSymbol } from 'sf-symbols-typescript';

import { useTheme, type ThemeMode } from '@/theme/theme-context';

/** Theme entries (preference → label + SF Symbol). */
const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: SFSymbol }[] = [
  { mode: 'system', label: 'System', icon: 'circle.lefthalf.filled' },
  { mode: 'light', label: 'Light', icon: 'sun.max.fill' },
  { mode: 'dark', label: 'Dark', icon: 'moon.fill' },
];

/**
 * Theme switcher rendered as a native header toolbar menu — the same pattern as
 * the Send Money screen's toolbar. The trigger is a native nav-bar button (its
 * icon reflects the current mode); tapping it opens a dropdown with a checkmark
 * on the active mode. Being a pure native menu, it never raises the keyboard.
 *
 * iOS only — `Stack.Toolbar` renders nothing on Android/web. Must be rendered
 * inside the screen component (Expo Router collects the toolbar children there).
 */
export function ThemeMenu() {
  const { mode, setMode } = useTheme();
  const current = THEME_OPTIONS.find((o) => o.mode === mode) ?? THEME_OPTIONS[0];

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon={current.icon}>
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
    </Stack.Toolbar>
  );
}
