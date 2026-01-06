import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useTranslation } from '../hooks/useTranslation';

export default function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const { t } = useTranslation();

  return (
    <span
      onClick={toggleDarkMode}
      className=" px-3 py-2.5 flex items-center justify-center transition-all hover:translate-y-[-1px] "
      aria-label={isDark ? t('enableLightMode') : t('enableDarkMode')}
      title={isDark ? t('lightMode') : t('darkMode')}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </span>
  );
}
