import { useCallback, useMemo, useState } from 'react';
import LastGuesses from '../components/LastGuesses';
import GuessMap from '../components/GuessMap';
import Result from '../components/Result';
import StreetView from '../components/StreetView';
import AttemptsCounter from '../components/AttemptsCounter';
import GuessFeedback from '../components/GuessFeedback';
import StartScreen from '../components/StartScreen';
import DarkModeToggle from '../components/DarkModeToggle';
import LanguageToggle from '../components/LanguageToggle';
import CountdownTimer from '../components/CountdownTimer';
import RoundLimitReached from '../components/RoundLimitReached';
import FloatingPanel from '../components/FloatingPanel';
import FloatingButton from '../components/FloatingButton';
import { useAuth } from '../hooks/useAuth';
import { useRoundLimit } from '../hooks/useRoundLimit';
import { useTranslation } from '../hooks/useTranslation';
import {
  calculateScore,
  getRandomLatLng,
  haversineDistance,
} from '../utils/geo';
import './styles/GamePage.css';
import PlayAgain from '../components/PlayAgain';

export default function GamePage() {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const { attemptsLeft } = useAuth();
  const {
    hasReachedLimit,
    canPlayNewRound,
    incrementRounds,
    getRemainingRounds,
  } = useRoundLimit();
  const { t } = useTranslation();

  const [realPosition, setRealPosition] = useState(null);
  const [guessPosition, setGuessPosition] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const pickRandomStreetView = useCallback(async () => {
    if (!window.google) return;

    setLoading(true);
    setGuessPosition(null);
    setDistanceKm(null);
    setLastScore(null);
    setTimerActive(false);
    setHasTimedOut(false);
    setTimerActive(false);
    setHasTimedOut(false);

    const service = new window.google.maps.StreetViewService();
    const maxAttempts = 50; // Increased to account for validation rejections

    // Helper function to validate if panorama has actual imagery
    const validatePanorama = (panoId) => {
      return new Promise((resolve) => {
        if (!panoId) {
          resolve(false);
          return;
        }

        // Request panorama by ID to check if it has tiles
        service.getPanorama({ pano: panoId }, (data, status) => {
          if (status !== window.google.maps.StreetViewStatus.OK) {
            resolve(false);
            return;
          }

          // Reject if it's an indoor panorama (no outdoor imagery)
          if (data?.location?.pano && data.location.description) {
            const desc = data.location.description.toLowerCase();
            // Filter out common indoor/business panoramas
            if (
              desc.includes('interior') ||
              desc.includes('inside') ||
              desc.includes('indoors') ||
              desc.includes('business photos')
            ) {
              resolve(false);
              return;
            }
          }

          // Check if panorama has links (connected to street view network)
          // Panoramas without links are often isolated/deprecated
          if (!data?.links || data.links.length === 0) {
            resolve(false);
            return;
          }

          // Additional check: outdoor panoramas typically have more links
          if (data.links.length < 2) {
            resolve(false);
            return;
          }

          resolve(true);
        });
      });
    };

    const attempt = (count = 0) =>
      new Promise((resolve) => {
        const candidate = getRandomLatLng();
        service.getPanorama(
          {
            location: candidate,
            radius: 50000,
            source: window.google.maps.StreetViewSource.OUTDOOR, // Prefer outdoor imagery
          },
          async (data, status) => {
            if (
              status === window.google.maps.StreetViewStatus.OK &&
              data?.location?.latLng &&
              data?.location?.pano
            ) {
              // Validate the panorama has actual imagery
              const isValid = await validatePanorama(data.location.pano);

              if (isValid) {
                resolve({
                  lat: data.location.latLng.lat(),
                  lng: data.location.latLng.lng(),
                  panoId: data.location.pano,
                });
              } else if (count < maxAttempts) {
                // Invalid panorama, try again
                resolve(attempt(count + 1));
              } else {
                // Max attempts reached, use fallback
                resolve({
                  lat: candidate.lat,
                  lng: candidate.lng,
                });
              }
            } else if (count < maxAttempts) {
              resolve(attempt(count + 1));
            } else {
              resolve(candidate);
            }
          }
        );
      });

    const location = await attempt();
    setRealPosition(location);
    setLoading(false);
    setTimerActive(true);
  }, []);

  const handleStartGame = useCallback(() => {
    if (!canPlayNewRound()) {
      return;
    }
    pickRandomStreetView();
  }, [pickRandomStreetView, canPlayNewRound]);

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
  }, [incrementRounds]);

  const handlePlayAgain = useCallback(() => {
    if (!canPlayNewRound()) {
      return;
    }
    setIsMapVisible(false);
    setIsHistoryVisible(false);
    pickRandomStreetView();
  }, [pickRandomStreetView, canPlayNewRound]);

  const handleGuessConfirm = useCallback(() => {
    handleGuess();
    // Keep map visible after confirming guess
  }, [handleGuess]);

  const linePath = useMemo(() => {
    if (!realPosition || !guessPosition || distanceKm === null) return [];
    return [realPosition, guessPosition];
  }, [distanceKm, realPosition, guessPosition]);

  return (
    <div className='game-container'>
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
            />
          </div>
        ) : (
          <>
            <StreetView position={realPosition} loading={loading} />

            {/* Countdown Timer - Top Left */}
            {timerActive && (
              <div className='timer-overlay'>
                <CountdownTimer
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
            <button
              className='settings-btn'
              onClick={() => setIsSettingsVisible(!isSettingsVisible)}
              aria-label={t('settings') || 'Configurações'}
              title={t('settings') || 'Configurações'}
            >
              ⚙️
            </button>
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
          {/* <div className="setting-item">
            <label>{t('theme') || 'Tema'}</label>
            <DarkModeToggle />
          </div> */}
        </div>
      </FloatingPanel>
    </div>
  );
}
