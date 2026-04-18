import { useEffect, useMemo, useState } from 'react';

const THEME_STORE_KEY = 'raven.theme.v1';

export type ThemePresetId = 'dawn' | 'forest' | 'ink' | 'midnight';

export type ThemeVarKey =
  | 'bg'
  | 'text'
  | 'muted'
  | 'primary'
  | 'tertiary'
  | 'surface-low'
  | 'surface-high'
  | 'panel'
  | 'panel-border';

export type ThemePreset = {
  id: ThemePresetId;
  label: string;
  vars: Record<ThemeVarKey, string>;
};

type ThemeStore = {
  presetId: ThemePresetId;
  overrides: Partial<Record<ThemeVarKey, string>>;
};

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dawn',
    label: 'Dawn Ledger',
    vars: {
      bg: '#f8f9fa',
      text: '#191c1d',
      muted: '#434655',
      primary: '#004ac6',
      tertiary: '#943700',
      'surface-low': '#f3f4f5',
      'surface-high': '#e7e8e9',
      panel: 'rgba(255, 255, 255, 0.88)',
      'panel-border': 'rgba(115, 118, 134, 0.12)',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight Dossier',
    vars: {
      bg: '#0a0c10',
      text: '#e2e8f0',
      muted: '#94a3b8',
      primary: '#60a5fa',
      tertiary: '#fbbf24',
      'surface-low': '#1e293b',
      'surface-high': '#334155',
      panel: 'rgba(15, 23, 42, 0.85)',
      'panel-border': 'rgba(255, 255, 255, 0.1)',
    },
  },
  {
    id: 'forest',
    label: 'Forest Dispatch',
    vars: {
      bg: '#f2f6f2',
      text: '#162118',
      muted: '#3f5345',
      primary: '#1f7a4f',
      tertiary: '#915f2f',
      'surface-low': '#e6ede7',
      'surface-high': '#d7e1d8',
      panel: 'rgba(255, 255, 255, 0.9)',
      'panel-border': 'rgba(63, 83, 69, 0.12)',
    },
  },
  {
    id: 'ink',
    label: 'Ink Gazette',
    vars: {
      bg: '#f4f5f8',
      text: '#181b26',
      muted: '#4e5468',
      primary: '#2f4b9a',
      tertiary: '#8a4632',
      'surface-low': '#e9ebf1',
      'surface-high': '#dde1eb',
      panel: 'rgba(255, 255, 255, 0.88)',
      'panel-border': 'rgba(78, 84, 104, 0.12)',
    },
  },
];

function readThemeStore(): ThemeStore {
  try {
    const raw = localStorage.getItem(THEME_STORE_KEY);
    if (!raw) return { presetId: 'dawn', overrides: {} };
    const parsed = JSON.parse(raw) as ThemeStore;
    const validPreset = THEME_PRESETS.some(
      (item) => item.id === parsed?.presetId
    );
    return {
      presetId: validPreset ? parsed.presetId : 'dawn',
      overrides: parsed?.overrides ?? {},
    };
  } catch {
    return { presetId: 'dawn', overrides: {} };
  }
}

function writeThemeStore(value: ThemeStore) {
  localStorage.setItem(THEME_STORE_KEY, JSON.stringify(value));
}

export type ThemeState = {
  presets: ThemePreset[];
  presetId: ThemePresetId;
  resolvedVars: Record<ThemeVarKey, string>;
  overrides: Partial<Record<ThemeVarKey, string>>;
  setPreset: (presetId: ThemePresetId) => void;
  setVar: (key: ThemeVarKey, value: string) => void;
  resetOverrides: () => void;
};

export function useTheme(): ThemeState {
  const [themeStore, setThemeStore] = useState<ThemeStore>(readThemeStore);

  const preset = useMemo(
    () =>
      THEME_PRESETS.find((item) => item.id === themeStore.presetId) ??
      THEME_PRESETS[0],
    [themeStore.presetId]
  );

  const resolvedVars = useMemo(
    () => ({
      ...preset.vars,
      ...themeStore.overrides,
    }),
    [preset.vars, themeStore.overrides]
  );

  useEffect(() => {
    const root = document.documentElement;
    (Object.entries(resolvedVars) as [ThemeVarKey, string][]).forEach(
      ([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      }
    );

    // Add .dark class for midnight theme
    if (themeStore.presetId === 'midnight') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedVars, themeStore.presetId]);

  useEffect(() => {
    writeThemeStore(themeStore);
  }, [themeStore]);

  const setPreset = (presetId: ThemePresetId) => {
    setThemeStore((prev) => ({ ...prev, presetId }));
  };

  const setVar = (key: ThemeVarKey, value: string) => {
    setThemeStore((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [key]: value,
      },
    }));
  };

  const resetOverrides = () => {
    setThemeStore((prev) => ({ ...prev, overrides: {} }));
  };

  return {
    presets: THEME_PRESETS,
    presetId: themeStore.presetId,
    resolvedVars,
    overrides: themeStore.overrides,
    setPreset,
    setVar,
    resetOverrides,
  };
}
