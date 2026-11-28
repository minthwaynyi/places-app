import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const THEME_KEY = 'places_app_theme';

const getSystemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'light' || saved === 'dark' ? saved : getSystemTheme();
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (!localStorage.getItem(THEME_KEY)) setTheme(getSystemTheme());
  };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
  const next: Theme = theme === 'light' ? 'dark' : 'light';
  setTheme(next);
  localStorage.setItem(THEME_KEY, next);
  };
  

  return (
    <button
      type="button"
      onClick={toggle}
    >
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </button>
  );
};
