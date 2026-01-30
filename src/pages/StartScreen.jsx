import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from '../hooks/useTranslation';
import OnboardingTypewriter from '../components/OnboardingTypewriter';
import SettingsButton from '../components/SettingsButton';
import FloatingPanel from '../components/FloatingPanel';
import LanguageToggle from '../components/LanguageToggle';
import { Users } from 'lucide-react';
import { useState } from 'react';

import '../../src/components/styles/OnboardingTypewriter.css';

function StartScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <>
      <div className='game-info-bar_transparent '>
        <div className='game-info-left'></div>

        <div className='game-info-right'>
          <SettingsButton
            setIsSettingsVisible={setIsSettingsVisible}
            isSettingsVisible={isSettingsVisible}
          />
        </div>
      </div>

      <FloatingPanel
        isOpen={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        position='top'
        title={t('settings') || 'Configurações'}
      >
        <div className='settings-panel-content'>
          <div className='setting-item'>
            <label>{t('language') || 'Idioma'}</label>
            <LanguageToggle />
          </div>
        </div>
      </FloatingPanel>
      <div className='grid place-items-center py-12 px-6'>
        <div className='max-w-[600px] text-center flex flex-col gap-6'>
          <div className='text-6xl mb-2 md:text-8xl'>
            <img
              src='/icon-192.png'
              alt='Mapix Logo'
              className='mx-auto w-24 h-24 md:w-40 md:h-40 rounded-full'
            />
          </div>

          <OnboardingTypewriter />
        </div>
        <div className='flex flex-col gap-3 w-full max-w-md'>
          <button
            className='onboarding-cta-inline w-full'
            onClick={handleStartGame}
            type='button'
            aria-label={t('onboardingCTA')}
          >
            {t('onboardingCTA')}
          </button>

          <button
            className='flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors w-full'
            onClick={() => navigate('/multiplayer')}
            type='button'
            aria-label='Modo Multiplayer'
          >
            <Users className='w-5 h-5' />
            {t('multiplayer_multiplayerMode')}
          </button>
        </div>
      </div>
    </>
  );
}

StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  isBlocked: PropTypes.bool,
  attemptsLeft: PropTypes.number,
  setIsSettingsVisible: PropTypes.func,
  isSettingsVisible: PropTypes.bool,
  setIsHowToPlayVisible: PropTypes.func,
  isHowToPlayVisible: PropTypes.bool,
};

StartScreen.defaultProps = {
  isBlocked: false,
  attemptsLeft: null,
  setIsSettingsVisible: null,
  isSettingsVisible: false,
  setIsHowToPlayVisible: null,
  isHowToPlayVisible: false,
};

export default StartScreen;
