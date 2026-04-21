"use client";

import { useEffect, useState } from 'react';

const THEME_KEY = 'mindset-theme';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      const next = stored || document.documentElement.dataset.theme || 'dark';
      setTheme(next);
      document.documentElement.dataset.theme = next;
    } catch {
      setTheme('dark');
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  }

  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={toggleTheme} aria-label="Basculer le thème">
      {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
    </button>
  );
}
