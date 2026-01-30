import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import StreetView from './StreetView';
import GuessMap from './GuessMap';
import CountdownTimer from './CountdownTimer';
import GuessFeedback from './GuessFeedback';
import FloatingButton from './FloatingButton';
import FloatingPanel from './FloatingPanel';
import LastGuesses from './LastGuesses';
import PlayAgain from './PlayAgain';
import HowToPlayButton from './HowToPlayButton';
import SettingsButton from './SettingsButton';
import LanguageToggle from '../components/LanguageToggle';
import MusicToggle from '../components/MusicToggle';
import { useTranslation } from '../hooks/useTranslation';

/**
 * GameplayView - Shared gameplay UI component
 * 
 * This component handles the core gameplay experience:
 * - Street View rendering
 * - Guess map UI
 * - Timer display
 * - Floating panels (map, history, settings)
 * - Feedback display
 * 
 * Can be used for both single-player and multiplayer modes
 */
const GameplayView = ({
  // Core game state
  realPosition,
  guessPosition,
  onGuessChange,
  loading = false,
  
  // Round state
  distanceKm = null,
  lastScore = null,
  hasGuessed = false,
  
  // Timer
  showTimer = false,
  timerDuration = 75,
  timerActive = false,
  onTimeout,
  hasTimedOut = false,
  customTimer = null, // For multiplayer custom timer component
  
  // Actions
  onGuessConfirm,
  onPlayAgain,
  disableConfirm = false,
  disableInteraction = false,
  disablePlayAgain = false,
  
  // History (for single-player)
  history = [],
  showHistory = true,
  
  // Top bar content
  topBarLeft = null,
  topBarRight = null,
  showFeedbackInTopBar = true,
  
  // Settings
  showSettings = true,
  isMusicEnabled = false,
  onToggleMusic = null,
  
  // Overlay content (for start screen, limits, etc.)
  overlayContent = null,
  
  // Additional content to render
  additionalContent = null,
}) => {
  const { t } = useTranslation();
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isHowToPlayVisible, setIsHowToPlayVisible] = useState(false);

  const linePath = useMemo(() => {
    if (!realPosition || !guessPosition || distanceKm === null) return [];
    return [realPosition, guessPosition];
  }, [distanceKm, realPosition, guessPosition]);

  const handleMapClick = (position) => {
    if (disableInteraction || hasGuessed) return;
    onGuessChange?.(position);
  };

  const handleConfirmClick = () => {
    if (disableConfirm || !guessPosition) return;
    onGuessConfirm?.();
  };

  return (
    <div className='game-container'>
      {/* Street View Container */}
      <div className='streetview-fullscreen'>
        {overlayContent ? (
          <div className='overlay-message'>{overlayContent}</div>
        ) : (
          <>
            <StreetView position={realPosition} loading={loading} />

            {/* Timer Overlay */}
            {showTimer && timerActive && !customTimer && (
              <div className='timer-overlay'>
                <CountdownTimer
                  key={realPosition?.lat + '-' + realPosition?.lng}
                  duration={timerDuration}
                  onTimeout={onTimeout}
                  isActive={timerActive}
                />
              </div>
            )}

            {/* Custom Timer (for multiplayer) */}
            {customTimer}

            {/* Timeout Message */}
            {hasTimedOut && distanceKm === null && (
              <div className='timeout-overlay'>
                <div className='timeout-message'>{t('timeout')}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Bar - Game Info */}
      {realPosition && !loading && !overlayContent && (
        <div className='game-info-bar'>
          <div className='game-info-left'>
            {topBarLeft}

            {/* Desktop: Feedback */}
            {showFeedbackInTopBar && distanceKm !== null && (
              <div className='game-info-item game-info-feedback game-info-feedback-desktop'>
                <GuessFeedback distanceKm={distanceKm} score={lastScore} />
              </div>
            )}

            {hasTimedOut && distanceKm === null && (
              <div className='game-info-item game-info-timeout'>
                <span className='timeout-badge'>{t('timeout')}</span>
              </div>
            )}
          </div>

          <div className='game-info-right'>
            {topBarRight}
            {onPlayAgain && !timerActive && (
              <PlayAgain onPlayAgain={onPlayAgain} disabled={disablePlayAgain} />
            )}
            <HowToPlayButton
              setIsHowToPlayVisible={setIsHowToPlayVisible}
              isHowToPlayVisible={isHowToPlayVisible}
            />
            {showSettings && (
              <SettingsButton
                setIsSettingsVisible={setIsSettingsVisible}
                isSettingsVisible={isSettingsVisible}
              />
            )}
          </div>

          {/* Mobile: Feedback */}
          {showFeedbackInTopBar && distanceKm !== null && (
            <div className='game-info-feedback-mobile'>
              <GuessFeedback distanceKm={distanceKm} score={lastScore} />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons */}
      {realPosition && !loading && !overlayContent && (
        <>
          {/* Map Toggle Button */}
          <FloatingButton
            icon='🗺️'
            label={t('map') || 'Mapa'}
            position='bottom-right'
            onClick={() => setIsMapVisible(!isMapVisible)}
            active={isMapVisible}
            showText={true}
            disabled={hasTimedOut || disableInteraction}
          />

          {/* History Button (only for single-player) */}
          {showHistory && (
            <FloatingButton
              icon='📜'
              label={t('history') || 'Histórico'}
              position='bottom-left'
              onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              badge={history.length > 0 ? history.length : null}
              active={isHistoryVisible}
              showText={true}
            />
          )}
        </>
      )}

      {/* Floating Panel - Map */}
      {realPosition && !loading && (
        <FloatingPanel
          isOpen={isMapVisible}
          onClose={() => setIsMapVisible(false)}
          position='right'
          title={t('makeYourGuess') || 'Faça seu palpite'}
        >
          <GuessMap
            isOpen={isMapVisible}
            onClose={() => setIsMapVisible(false)}
            position='right'
            guessPosition={guessPosition}
            realPosition={realPosition}
            showResult={distanceKm !== null}
            linePath={linePath}
            onGuess={handleMapClick}
            onConfirm={handleConfirmClick}
            disableConfirm={!guessPosition || disableConfirm || hasGuessed}
            disableInteraction={disableInteraction || hasGuessed}
            distanceKm={distanceKm}
          />
        </FloatingPanel>
      )}

      {/* Floating Panel - History (single-player only) */}
      {showHistory && (
        <FloatingPanel
          isOpen={isHistoryVisible}
          onClose={() => setIsHistoryVisible(false)}
          position='left'
          title={t('lastGuesses')}
        >
          <LastGuesses history={history} />
        </FloatingPanel>
      )}

      {/* Floating Panel - Settings */}
      {showSettings && (
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
            {onToggleMusic && (
              <div className='setting-item'>
                <label>{t('music') || 'Música de Fundo'}</label>
                <MusicToggle isMusicEnabled={isMusicEnabled} onToggle={onToggleMusic} />
              </div>
            )}
          </div>
        </FloatingPanel>
      )}

      {/* Floating Panel - How to Play */}
      <FloatingPanel
        isOpen={isHowToPlayVisible}
        onClose={() => setIsHowToPlayVisible(false)}
        position='top'
        title={t('howToPlayTitle') || 'Como Jogar'}
      >
        <div className='how-to-play-content'>
          <p className='how-to-play-intro'>
            {t('howToPlayIntro') ||
              'Bem-vindo ao Mapin! Seu objetivo é identificar o local mostrado no Street View.'}
          </p>

          <div className='how-to-play-step'>
            <div className='how-to-play-step-title'>
              {t('howToPlayStep1Title') || '1️⃣ Observe'}
            </div>
            <div className='how-to-play-step-desc'>
              {t('howToPlayStep1Desc') ||
                'Examine cuidadosamente a imagem do Street View. Procure por pontos de referência, placas, arquitetura, vegetação e qualquer pista visual.'}
            </div>
          </div>

          <div className='how-to-play-step'>
            <div className='how-to-play-step-title'>
              {t('howToPlayStep2Title') || '2️⃣ Analise'}
            </div>
            <div className='how-to-play-step-desc'>
              {t('howToPlayStep2Desc') ||
                'Use as pistas disponíveis para reduzir as possíveis localizações. Pense no país, região ou cidade.'}
            </div>
          </div>

          <div className='how-to-play-step'>
            <div className='how-to-play-step-title'>
              {t('howToPlayStep3Title') || '3️⃣ Marque'}
            </div>
            <div className='how-to-play-step-desc'>
              {t('howToPlayStep3Desc') ||
                'Clique no mapa onde você acha que é a localização. Seja o mais preciso possível.'}
            </div>
          </div>

          <div className='how-to-play-step'>
            <div className='how-to-play-step-title'>
              {t('howToPlayStep4Title') || '4️⃣ Confirme'}
            </div>
            <div className='how-to-play-step-desc'>
              {t('howToPlayStep4Desc') ||
                'Clique em "É aqui!" para enviar seu palpite antes do tempo acabar (75 segundos).'}
            </div>
          </div>

          <div className='how-to-play-footer'>
            <p>
              {t('howToPlayScoring') ||
                '🎯 Pontuação: Quanto mais próximo seu palpite, maior sua pontuação! Palpites perfeitos ganham pontos máximos.'}
            </p>
            <p>
              {t('howToPlayTips') ||
                '💡 Dicas: Preste atenção no idioma das placas, tipos de veículos, paisagem e estilo arquitetônico.'}
            </p>
          </div>
        </div>
      </FloatingPanel>

      {/* Additional Content */}
      {additionalContent}
    </div>
  );
};

GameplayView.propTypes = {
  // Core game state
  realPosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  guessPosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  onGuessChange: PropTypes.func,
  loading: PropTypes.bool,

  // Round state
  distanceKm: PropTypes.number,
  lastScore: PropTypes.number,
  hasGuessed: PropTypes.bool,

  // Timer
  showTimer: PropTypes.bool,
  timerDuration: PropTypes.number,
  timerActive: PropTypes.bool,
  onTimeout: PropTypes.func,
  hasTimedOut: PropTypes.bool,
  customTimer: PropTypes.node,

  // Actions
  onGuessConfirm: PropTypes.func,
  onPlayAgain: PropTypes.func,
  disableConfirm: PropTypes.bool,
  disableInteraction: PropTypes.bool,
  disablePlayAgain: PropTypes.bool,

  // History
  history: PropTypes.array,
  showHistory: PropTypes.bool,

  // Top bar
  topBarLeft: PropTypes.node,
  topBarRight: PropTypes.node,
  showFeedbackInTopBar: PropTypes.bool,

  // Settings
  showSettings: PropTypes.bool,
  isMusicEnabled: PropTypes.bool,
  onToggleMusic: PropTypes.func,

  // Overlay
  overlayContent: PropTypes.node,

  // Additional
  additionalContent: PropTypes.node,
};

export default GameplayView;
