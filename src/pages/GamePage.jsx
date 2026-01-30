import { useCallback, useEffect, useState } from 'react';
import GameplayView from '../components/GameplayView';
import StartScreen from './StartScreen';
import RoundLimitReached from '../components/RoundLimitReached';
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

export default function GamePage() {
  const { attemptsLeft } = useAuth();
  const {
    hasReachedLimit,
    canPlayNewRound,
    incrementRounds,
    getRemainingRounds,
  } = useRoundLimit();
  const { t } = useTranslation();
  const { isMusicEnabled, isPlaying, play, pause, toggleMusic } =
    useBackgroundMusic();

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
  }, [
    handlePickRandomStreetView,
    canPlayNewRound,
    isMusicEnabled,
    isPlaying,
    play,
  ]);

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
    handlePickRandomStreetView();
    // Resume music if it was paused
    if (isMusicEnabled && !isPlaying) {
      play();
    }
  }, [
    handlePickRandomStreetView,
    canPlayNewRound,
    isMusicEnabled,
    isPlaying,
    play,
  ]);

  const handleGuessConfirm = useCallback(() => {
    handleGuess();
    pause();
    // Keep map visible after confirming guess
  }, [handleGuess, pause]);

  const overlayContent = hasReachedLimit ? <RoundLimitReached /> : null;

  useEffect(() => {
    handleStartGame();
  }, []);

  // Top bar left content
  const topBarLeft = (
    <div className='game-info-item'>
      <span className='game-info-label'>{t('appName')}</span>
      {!hasReachedLimit && (
        <span className='game-info-value'>
          {getRemainingRounds()} {t('roundsRemaining')}
        </span>
      )}
    </div>
  );

  return (
    <GameplayView
      realPosition={realPosition}
      guessPosition={guessPosition}
      onGuessChange={setGuessPosition}
      loading={loading}
      distanceKm={distanceKm}
      lastScore={lastScore}
      hasGuessed={false}
      showTimer={true}
      timerDuration={75}
      timerActive={timerActive}
      onTimeout={handleTimeout}
      hasTimedOut={hasTimedOut}
      onGuessConfirm={handleGuessConfirm}
      onPlayAgain={handlePlayAgain}
      disableConfirm={!guessPosition || loading || hasReachedLimit}
      disableInteraction={hasReachedLimit}
      disablePlayAgain={loading}
      history={history}
      showHistory={true}
      topBarLeft={topBarLeft}
      showFeedbackInTopBar={true}
      showSettings={true}
      isMusicEnabled={isMusicEnabled}
      onToggleMusic={toggleMusic}
      overlayContent={overlayContent}
    />
  );
}
