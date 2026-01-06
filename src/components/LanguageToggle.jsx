import { useTranslation } from '../hooks/useTranslation';

export default function LanguageToggle() {
  const { language, changeLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    changeLanguage(language === 'pt' ? 'en' : 'pt');
  };

  return (
    <button
      onClick={toggleLanguage}
      className='px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-900 dark:text-white font-semibold text-sm'
      title={language === 'pt' ? t('switchToEnglish') : t('switchToPortuguese')}
    >
      {language === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
    </button>
  );
}
