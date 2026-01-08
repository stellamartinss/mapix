import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Always return dark mode as true
  const [isDark] = useState(true);

  useEffect(() => {
    // Force dark mode on mount
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  }, []);

  // Toggle does nothing - always stays dark
  const toggleDarkMode = () => {};

  return { isDark, toggleDarkMode };
}
