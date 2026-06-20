import { createContext, use, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/theme/tokens';

/** User-facing theme preference. `'system'` follows the OS setting. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Resolved colour scheme actually applied to the UI. */
export type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  /** The user's preference. */
  mode: ThemeMode;
  /** Update the preference. */
  setMode: (mode: ThemeMode) => void;
  /** The resolved scheme after applying `'system'`. */
  scheme: ColorScheme;
  /** Active palette for `scheme`. */
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provides the active theme to the tree.
 *
 * Holds the user preference (`mode`) in state and resolves `'system'` against
 * the live OS scheme via `useColorScheme()`. Wrap the app once near the root.
 *
 * ponytail: preference is in-memory only — not persisted across launches.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme: ColorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState<ThemeMode>('system');

  const scheme: ColorScheme = mode === 'system' ? systemScheme : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, scheme, colors: scheme === 'dark' ? darkColors : lightColors }),
    [mode, scheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

/** Access the active theme. Throws if used outside a {@link ThemeProvider}. */
export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
