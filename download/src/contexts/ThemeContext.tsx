
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "taskpilot-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme state for SSR, will be updated on client
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // This effect runs only on the client
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    let initialTheme: Theme;
    if (storedTheme) {
      initialTheme = storedTheme;
    } else {
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setThemeState(initialTheme);

    // Apply the initial theme to the document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
    localStorage.setItem(THEME_STORAGE_KEY, initialTheme);

  }, []);


  useEffect(() => {
    // This effect synchronizes theme changes to localStorage and DOM
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
