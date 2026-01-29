import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from '../hooks/useTranslation';
import OnboardingTypewriter from './OnboardingTypewriter';
import { Users } from 'lucide-react';

import './styles/OnboardingTypewriter.css';

function StartScreen({
  onStart,
  isBlocked,
  attemptsLeft,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
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

          {isBlocked ? (
            <div className='p-5 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-900 rounded-xl text-red-900 dark:text-red-300'>
              <p className='my-2'>{t('roundLimitMessage')}</p>
              <p className='my-2'>{t('upgrade')}</p>
            </div>
          ) : (
            <>
              {attemptsLeft !== null && (
                <div className='py-3 px-5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400'>
                  <span>
                    {t('attemptsRemaining')}:{' '}
                    <strong className='text-slate-900 dark:text-slate-100 font-bold'>
                      {attemptsLeft}
                    </strong>
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className='flex flex-col gap-3 w-full max-w-md'>
          <button
            className='onboarding-cta-inline w-full'
            onClick={onStart}
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
            Modo Multiplayer
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
