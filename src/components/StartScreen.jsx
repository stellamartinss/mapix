import PropTypes from 'prop-types';
import { useTranslation } from '../hooks/useTranslation';
import SettingsButton from './SettingsButton';

function StartScreen({
  onStart,
  isBlocked,
  attemptsLeft,
  setIsSettingsVisible,
  isSettingsVisible,
}) {
  const { t } = useTranslation();

  return (
    <>
      {setIsSettingsVisible && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          <SettingsButton
            setIsSettingsVisible={setIsSettingsVisible}
            isSettingsVisible={isSettingsVisible}
          />
        </div>
      )}
      <div className='min-h-[400px] grid place-items-center py-12 px-6'>
        <div className='max-w-[600px] text-center flex flex-col gap-6'>
          <div className='text-6xl mb-2 md:text-8xl'>🗺️</div>
          <h2 className='m-0 text-2xl md:text-3xl text-slate-900 dark:text-slate-100'>
            {t('welcomeTitle')}
          </h2>
          <p className='m-0 text-base text-slate-500 dark:text-slate-400 leading-relaxed'>
            {t('welcomeDescription')}
          </p>

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
              <button
                className='dark:bg-yellow-500 bg-green-500 dark:hover:bg-yellow-600 hover:bg-green-600 rounded-lg px-4 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
                onClick={onStart}
                type='button'
              >
                🎯 {t('startGame')}
              </button>
            </>
          )}

          <div className='mt-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl text-left md:p-8'>
            <h3 className='m-0 mb-4 text-lg text-slate-900 dark:text-slate-100 text-center'>
              {t('howToPlay')}:
            </h3>
            <ol className='m-0 pl-6 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <li className='my-2'>{t('step1')}</li>
              <li className='my-2'>{t('step2')}</li>
              <li className='my-2'>{t('step3')}</li>
            </ol>
          </div>
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
};

StartScreen.defaultProps = {
  isBlocked: false,
  attemptsLeft: null,
  setIsSettingsVisible: null,
  isSettingsVisible: false,
};

export default StartScreen;
