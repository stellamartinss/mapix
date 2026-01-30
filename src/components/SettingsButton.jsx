import { useTranslation } from '../hooks/useTranslation';

export default function SettingsButton({
  setIsSettingsVisible,
  isSettingsVisible,
}) {
  const {t} = useTranslation();
  
  return (
    <button
      className='settings-btn'
      onClick={() => setIsSettingsVisible(!isSettingsVisible)}
      aria-label={t('settings') || 'Configurações'}
      title={t('settings') || 'Configurações'}
    >
      ⚙️
    </button>
  );
}
