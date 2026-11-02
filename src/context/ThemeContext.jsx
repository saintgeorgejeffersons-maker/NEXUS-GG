import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const THEMES = [
  { id: 'neon',     label: 'Neon',     description: 'Vibrant cyan & green accents',  preview: '#00d4ff' },
  { id: 'minimal',  label: 'Minimal',  description: 'Clean dark, subtle grey tones', preview: '#e0e0e0' },
  { id: 'gold',     label: 'Gold',     description: 'Warm dark with golden accents',  preview: '#d4a017' },
  { id: 'midnight', label: 'Midnight', description: 'Deep navy with soft purple',     preview: '#8b7cf8' },
];

const ThemeContext = createContext(null);

function applyTheme(themeId) {
  const html = document.documentElement;
  THEMES.forEach(({ id }) => html.classList.remove(`theme-${id}`));
  html.classList.add(`theme-${themeId}`);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('neon');

  // Apply theme class on mount and change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback(async (themeId, userId) => {
    setThemeState(themeId);
    applyTheme(themeId);
    // Persist to DB if user is logged in
    if (userId) {
      try {
        await supabase.from('profiles').update({ theme: themeId }).eq('id', userId);
      } catch (_) {}
    }
  }, []);

  // Load theme from profile (called after login)
  const loadThemeFromProfile = useCallback((profileTheme) => {
    const valid = THEMES.find((t) => t.id === profileTheme);
    const themeId = valid ? profileTheme : 'neon';
    setThemeState(themeId);
    applyTheme(themeId);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, loadThemeFromProfile }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
