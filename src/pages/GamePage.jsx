import { useCallback, useMemo, useState, useEffect } from 'react';
import LastGuesses from '../components/LastGuesses';
import GuessMap from '../components/GuessMap';
import StreetView from '../components/StreetView';
import GuessFeedback from '../components/GuessFeedback';
import StartScreen from '../components/StartScreen';
import LanguageToggle from '../components/LanguageToggle';
import CountdownTimer from '../components/CountdownTimer';
import RoundLimitReached from '../components/RoundLimitReached';
import FloatingPanel from '../components/FloatingPanel';
import FloatingButton from '../components/FloatingButton';
import SettingsButton from '../components/SettingsButton';
import HowToPlayButton from '../components/HowToPlayButton';
import MusicToggle from '../components/MusicToggle';
import { useAuth } from '../hooks/useAuth';
import { useRoundLimit } from '../hooks/useRoundLimit';
import { useTranslation } from '../hooks/useTranslation';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import {
  calculateScore,
  haversineDistance,
  pickRandomStreetView,
} from '../utils/geo';
import './styles/GamePage.css';
import PlayAgain from '../components/PlayAgain';

export default function GamePage() {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isHowToPlayVisible, setIsHowToPlayVisible] = useState(false);

  const { attemptsLeft } = useAuth();
  const {
    hasReachedLimit,
    canPlayNewRound,
    incrementRounds,
    getRemainingRounds,
  } = useRoundLimit();
  const { t } = useTranslation();
  const { isMusicEnabled, isPlaying, play, pause, stop, toggleMusic } = useBackgroundMusic();

  const [realPosition, setRealPosition] = useState(null);
  const [guessPosition, setGuessPosition] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const handlePickRandomStreetView = useCallback(async () => {
    if (!window.google) return;

    setLoading(true);
    setGuessPosition(null);
    setDistanceKm(null);
    setLastScore(null);
    setTimerActive(false);
    setHasTimedOut(false);

    try {
      const location = await pickRandomStreetView();
      setRealPosition(location);
      setTimerActive(true);
    } catch (error) {
      console.error('Erro ao gerar localização:', error);
      // Fallback to a random location if something goes wrong
      setRealPosition({ lat: 0, lng: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStartGame = useCallback(() => {
    if (!canPlayNewRound()) {
      return;
    }
    handlePickRandomStreetView();
    // Start music when user clicks start (user interaction allows autoplay)
    if (isMusicEnabled && !isPlaying) {
      play();
    }
  }, [handlePickRandomStreetView, canPlayNewRound, isMusicEnabled, isPlaying, play]);

  const handleGuess = useCallback(() => {
    if (!realPosition || !guessPosition) return;
    setTimerActive(false);
    incrementRounds();
    const distance = haversineDistance(realPosition, guessPosition);
    const score = calculateScore(distance);
    setDistanceKm(distance);
    setLastScore(score);
    setHistory((prev) => [
      {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        distanceKm: distance,
        score,
        guess: guessPosition,
        real: realPosition,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }, [guessPosition, realPosition, incrementRounds]);

  const handleTimeout = useCallback(() => {
    setTimerActive(false);
    setHasTimedOut(true);
    incrementRounds();
    pause();
  }, [incrementRounds, pause]);

  const handlePlayAgain = useCallback(() => {
    if (!canPlayNewRound()) {
      return;
    }
    setIsMapVisible(false);
    setIsHistoryVisible(false);
    handlePickRandomStreetView();
    // Resume music if it was paused
    if (isMusicEnabled && !isPlaying) {
      play();
    }
  }, [handlePickRandomStreetView, canPlayNewRound, isMusicEnabled, isPlaying, play]);

  const handleGuessConfirm = useCallback(() => {
    handleGuess();
    pause();
    // Keep map visible after confirming guess
  }, [handleGuess, pause]);

  const linePath = useMemo(() => {
    if (!realPosition || !guessPosition || distanceKm === null) return [];
    return [realPosition, guessPosition];
  }, [distanceKm, realPosition, guessPosition]);

  return (
    <div className='game-container'>
      {!realPosition && !loading && !hasReachedLimit && setIsSettingsVisible && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
          }}
        >
          <HowToPlayButton
            setIsHowToPlayVisible={setIsHowToPlayVisible}
            isHowToPlayVisible={isHowToPlayVisible}
          />
          <SettingsButton
            setIsSettingsVisible={setIsSettingsVisible}
            isSettingsVisible={isSettingsVisible}
          />
        </div>
      )}
      {/* Full-screen Street View */}
      <div className='streetview-fullscreen'>
        {hasReachedLimit ? (
          <div className='overlay-message'>
            <RoundLimitReached />
          </div>
        ) : !realPosition && !loading ? (
          <div className='overlay-message'>
            <StartScreen
              onStart={handleStartGame}
              attemptsLeft={attemptsLeft}
              setIsSettingsVisible={setIsSettingsVisible}
              isSettingsVisible={isSettingsVisible}
              setIsHowToPlayVisible={setIsHowToPlayVisible}
              isHowToPlayVisible={isHowToPlayVisible}
            />
          </div>
        ) : (
          <>
            <StreetView position={realPosition} loading={loading} />

            {/* Countdown Timer - Top Left */}
            {timerActive && (
              <div className='timer-overlay'>
                <CountdownTimer
                  key={realPosition?.lat + '-' + realPosition?.lng}
                  duration={75}
                  onTimeout={handleTimeout}
                  isActive={timerActive}
                />
              </div>
            )}

            {/* Timeout Message - Center */}
            {hasTimedOut && distanceKm === null && (
              <div className='timeout-overlay'>
                <div className='timeout-message'>{t('timeout')}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Always Visible Game Info Bar - Top */}
      {realPosition && !loading && (
        <div className='game-info-bar'>
          <div className='game-info-left'>
            <div className='game-info-item'>
              <span className='game-info-label'>{t('appName')}</span>
              {!hasReachedLimit && (
                <span className='game-info-value'>
                  {getRemainingRounds()} {t('roundsRemaining')}
                </span>
              )}
            </div>

            {/* Desktop: Feedback fica aqui ao lado */}
            {distanceKm !== null && (
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
            {!timerActive && (
              <PlayAgain onPlayAgain={handlePlayAgain} disabled={loading} />
            )}
            <HowToPlayButton
              setIsHowToPlayVisible={setIsHowToPlayVisible}
              isHowToPlayVisible={isHowToPlayVisible}
            />
            <SettingsButton
              setIsSettingsVisible={setIsSettingsVisible}
              isSettingsVisible={isSettingsVisible}
            />
          </div>

          {/* Mobile: Feedback ocupa linha inteira abaixo */}
          {distanceKm !== null && (
            <div className='game-info-feedback-mobile'>
              <GuessFeedback distanceKm={distanceKm} score={lastScore} />
            </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons */}
      {realPosition && !loading && (
        <>
          {/* Map Toggle Button - Bottom Right */}
          <FloatingButton
            icon='🗺️'
            label={t('map') || 'Mapa'}
            position='bottom-right'
            onClick={() => setIsMapVisible(!isMapVisible)}
            active={isMapVisible}
            showText={true}
            disabled={hasTimedOut}
          />

          {/* History Button - Bottom Left */}
          <FloatingButton
            icon='📜'
            label={t('history') || 'Histórico'}
            position='bottom-left'
            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
            badge={history.length > 0 ? history.length : null}
            active={isHistoryVisible}
            showText={true}
          />
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
            onGuess={setGuessPosition}
            onConfirm={handleGuessConfirm}
            disableConfirm={!guessPosition || loading || hasReachedLimit}
            disableInteraction={hasReachedLimit}
            distanceKm={distanceKm}
          />
        </FloatingPanel>
      )}

      {/* Floating Panel - History */}
      <FloatingPanel
        isOpen={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        position='left'
        title={t('lastGuesses')}
      >
        <LastGuesses history={history} />
      </FloatingPanel>

      {/* Floating Panel - Settings */}
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
          <div className='setting-item'>
            <label>{t('music') || 'Música de Fundo'}</label>
            <MusicToggle 
              isMusicEnabled={isMusicEnabled} 
              onToggle={toggleMusic} 
            />
          </div>
        </div>
      </FloatingPanel>

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
    </div>
  );
}
