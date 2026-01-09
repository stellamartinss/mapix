import { useTranslation } from '../hooks/useTranslation';

export default function MusicToggle({ isMusicEnabled, onToggle }) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onToggle}
      className="toggle-button"
      aria-label={isMusicEnabled ? t('disableMusic') : t('enableMusic')}
      title={isMusicEnabled ? t('disableMusic') : t('enableMusic')}
    >
      <span className="toggle-icon">{isMusicEnabled ? '🔊' : '🔇'}</span>
    </button>
  );
}
