import React, { createContext, useContext, useEffect } from 'react';
import { useUIStore } from '../store';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useUIStore();

  const getResolvedTheme = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') return 'light';
    return t;
  };

  const resolvedTheme = getResolvedTheme(theme);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = getResolvedTheme(theme);
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
