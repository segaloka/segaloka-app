'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  defaultLocale,
  getLocaleDirection,
  isLocale,
  type Locale
} from '@/config/locales';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface AppPreferences {
  locale: Locale;
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemePreference) => void;
}

const AppPreferenceContext = createContext<AppPreferences | null>(null);

const LOCALE_STORAGE_KEY = 'segaloka.admin.locale';
const THEME_STORAGE_KEY = 'segaloka.admin.theme.v2';

function isThemePreference(
  value: string | null
): value is ThemePreference {
  return (
    value === 'light' ||
    value === 'dark' ||
    value === 'system'
  );
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

function resolveTheme(
  preference: ThemePreference
): ResolvedTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }

  return preference;
}

export function AppProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [theme, setThemeState] =
    useState<ThemePreference>('light');
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>('light');

  const applyLocale = useCallback((nextLocale: Locale) => {
    const root = document.documentElement;

    root.lang = nextLocale;
    root.dir = getLocaleDirection(nextLocale);
    root.dataset.locale = nextLocale;
  }, []);

  const applyTheme = useCallback(
    (preference: ThemePreference) => {
      const nextResolved = resolveTheme(preference);
      const root = document.documentElement;

      root.dataset.theme = nextResolved;
      root.dataset.themePreference = preference;
      root.style.colorScheme = nextResolved;

      setResolvedTheme(nextResolved);
    },
    []
  );

  useEffect(() => {
    const storedLocale =
      window.localStorage.getItem(LOCALE_STORAGE_KEY);

    const nextLocale = isLocale(storedLocale)
      ? storedLocale
      : defaultLocale;

    const storedTheme =
      window.localStorage.getItem(THEME_STORAGE_KEY);

    const nextTheme = isThemePreference(storedTheme)
      ? storedTheme
      : 'light';

    setLocaleState(nextLocale);
    setThemeState(nextTheme);

    applyLocale(nextLocale);
    applyTheme(nextTheme);
  }, [applyLocale, applyTheme]);

  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    media.addEventListener('change', handleSystemThemeChange);

    return () => {
      media.removeEventListener(
        'change',
        handleSystemThemeChange
      );
    };
  }, [applyTheme, theme]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);

      window.localStorage.setItem(
        LOCALE_STORAGE_KEY,
        nextLocale
      );

      applyLocale(nextLocale);
    },
    [applyLocale]
  );

  const setTheme = useCallback(
    (nextTheme: ThemePreference) => {
      setThemeState(nextTheme);

      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextTheme
      );

      applyTheme(nextTheme);
    },
    [applyTheme]
  );

  const value = useMemo<AppPreferences>(
    () => ({
      locale,
      theme,
      resolvedTheme,
      setLocale,
      setTheme
    }),
    [
      locale,
      resolvedTheme,
      setLocale,
      setTheme,
      theme
    ]
  );

  return (
    <AppPreferenceContext.Provider value={value}>
      {children}
    </AppPreferenceContext.Provider>
  );
}

export function useAppPreferences(): AppPreferences {
  const context = useContext(AppPreferenceContext);

  if (!context) {
    throw new Error(
      'useAppPreferences must be used inside AppProvider.'
    );
  }

  return context;
}
