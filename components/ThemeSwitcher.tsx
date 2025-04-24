// ThemeSwitcher.tsx (new component)
"use client"; // Ensure this runs client-side only
import { useEffect, useState } from 'react';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  }, []);

  if (!theme) {
    return null; // Avoid rendering until the theme is determined
  }

  return <div className={theme}></div>;
};

export default ThemeSwitcher;
