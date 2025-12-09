import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuessHistory from '../components/GuessHistory';
import GuessMap from '../components/GuessMap';
import Result from '../components/Result';
import StreetView from '../components/StreetView';
import ModeSelector, { MODES } from '../components/ModeSelector';
import BetModeSetup from '../components/BetMode/BetModeSetup';
import BetModeResults from '../components/BetMode/BetModeResults';
import BetGuessMap from '../components/BetMode/BetGuessMap';
import UpgradeModal from '../components/UpgradeModal';
import PremiumBadge from '../components/PremiumBadge';
import AttemptsCounter from '../components/AttemptsCounter';
import StartScreen from '../components/StartScreen';
import DarkModeToggle from '../components/DarkModeToggle';
import { useAuth } from '../hooks/useAuth';
import {
  calculateScore,
  getRandomLatLng,
  haversineDistance,
} from '../utils/geo';

// Estados do Modo Aposta
const BET_STATES = {
  SETUP: 'setup',
  PLAYING: 'playing',
  RESULTS: 'results',
};

export default function GamePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(MODES.CLASSIC);
  const [isHidden, setIsHidden] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    isPremium,
    isBlocked,
    attemptsLeft,
    useAttempt: attemptFunction,
    upgrade,
    logout,
  } = useAuth();

  const [realPosition, setRealPosition] = useState(null);
  const [guessPosition, setGuessPosition] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [betState, setBetState] = useState(BET_STATES.SETUP);
  const [betPlayers, setBetPlayers] = useState([]);
  const [currentPlayerGuess, setCurrentPlayerGuess] = useState(null);
  const [allBetGuesses, setAllBetGuesses] = useState({});
  const [currentBetPlayerIndex, setCurrentBetPlayerIndex] = useState(0);

  const pickRandomStreetView = useCallback(async () => {
    if (!window.google) return;

    if (mode === MODES.CLASSIC && !isPremium) {
      try {
        const attemptResult = await attemptFunction();
        if (!attemptResult.success || attemptResult.blocked) {
          setShowUpgradeModal(true);
          return;
        }
      } catch (error) {
        console.error('Failed to use attempt:', error);
        setShowUpgradeModal(true);
        return;
      }
    }

    setLoading(true);
    setGuessPosition(null);
    setDistanceKm(null);
    setLastScore(null);
    setCurrentPlayerGuess(null);
    setAllBetGuesses({});
    setCurrentBetPlayerIndex(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPremium]);

  const handleStartGame = useCallback(() => {
    pickRandomStreetView();
  }, [pickRandomStreetView]);

  const handleGuess = useCallback(() => {
    if (!realPosition || !guessPosition) return;
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
  }, [guessPosition, realPosition]);

  const handlePlayAgain = useCallback(() => {
    if (mode === MODES.BET) {
      setBetState(BET_STATES.SETUP);
      setAllBetGuesses({});
      setCurrentBetPlayerIndex(0);
      setCurrentPlayerGuess(null);
    }
    pickRandomStreetView();
  }, [pickRandomStreetView, mode]);

  const handleHideToggle = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  const linePath = useMemo(() => {
    if (!realPosition || !guessPosition || distanceKm === null) return [];
    return [realPosition, guessPosition];
  }, [distanceKm, realPosition, guessPosition]);

  const handleBetModeStart = useCallback((players) => {
    setBetPlayers(players);
    setBetState(BET_STATES.PLAYING);
    setCurrentBetPlayerIndex(0);
    setCurrentPlayerGuess(null);
    setAllBetGuesses({});
  }, []);

  const handleBetModeCancel = useCallback(() => {
    setBetState(BET_STATES.SETUP);
    setBetPlayers([]);
  }, []);

  const handleBetGuess = useCallback(
    (guessPos) => {
      const currentPlayer = betPlayers[currentBetPlayerIndex];
      if (!currentPlayer || allBetGuesses[currentPlayer.id]) return;

      setCurrentPlayerGuess(guessPos);
      setAllBetGuesses((prev) => ({
        ...prev,
        [currentPlayer.id]: guessPos,
      }));
    },
    [betPlayers, currentBetPlayerIndex, allBetGuesses]
  );

  const handleBetNextPlayer = useCallback(() => {
    if (currentBetPlayerIndex < betPlayers.length - 1) {
      const nextIndex = currentBetPlayerIndex + 1;
      setCurrentBetPlayerIndex(nextIndex);
      const nextPlayer = betPlayers[nextIndex];
      if (nextPlayer && allBetGuesses[nextPlayer.id]) {
        setCurrentPlayerGuess(allBetGuesses[nextPlayer.id]);
      } else {
        setCurrentPlayerGuess(null);
      }
    }
  }, [betPlayers, currentBetPlayerIndex, allBetGuesses]);

  const handleBetRoundComplete = useCallback(() => {
    setBetState(BET_STATES.RESULTS);
  }, []);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    if (newMode === MODES.CLASSIC) {
      setBetState(BET_STATES.SETUP);
      setBetPlayers([]);
      setAllBetGuesses({});
      setCurrentPlayerGuess(null);
    } else {
      setGuessPosition(null);
      setDistanceKm(null);
      setLastScore(null);
    }
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const currentBetPlayer = betPlayers[currentBetPlayerIndex];
  const allBetPlayersGuessed =
    betPlayers.length > 0 && betPlayers.every((p) => allBetGuesses[p.id]);

  return (
    <>
      <header className='header'>
        <div>
          <p className='eyebrow'>Mapix</p>
          <h1>Encontre onde o Street View está</h1>
        </div>
        <div className='header-actions'>
          {mode === MODES.CLASSIC && !isPremium && <AttemptsCounter />}
          {isPremium && <PremiumBadge />}
          {/* <DarkModeToggle /> */}
          <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
          {mode === MODES.CLASSIC && realPosition && (
            <button
              className='ghost'
              type='button'
              onClick={handlePlayAgain}
              disabled={loading || isBlocked}
            >
              Jogar novamente
            </button>
          )}
          <button className='ghost' type='button' onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={async () => {
            const result = await upgrade();
            if (result.success && result.checkoutUrl) {
              window.location.href = result.checkoutUrl;
            }
          }}
        />
      )}

      <section className='panel'>
        {!realPosition && !loading ? (
          <StartScreen
            onStart={handleStartGame}
            isBlocked={isBlocked}
            attemptsLeft={attemptsLeft}
          />
        ) : (
          <StreetView position={realPosition} loading={loading} />
        )}
      </section>

      <button onClick={handleHideToggle}>Mostrar mapa de palpites</button>

      {mode === MODES.CLASSIC && realPosition && (
        <>            
          <section
            className='panel'
            style={{ position: 'fixed', bottom: '0', right: '24px', display: isHidden ? 'none' : 'block' }}
          >
            <Result
              distanceKm={distanceKm}
              score={lastScore}
              disableConfirm={!guessPosition || loading}
              onConfirm={handleGuess}
              onPlayAgain={handlePlayAgain}
              onHideToggle={handleHideToggle}
            />
            <GuessMap
              guessPosition={guessPosition}
              realPosition={realPosition}
              showResult={distanceKm !== null}
              linePath={linePath}
              onGuess={setGuessPosition}
            />
          </section>

          <section className='panel'>
            <div className='panel-header'>
              <h2>Últimos palpites</h2>
              <p className='hint'>Mostrando os 5 mais recentes</p>
            </div>
            <GuessHistory entries={history.slice(0, 5)} />
          </section>
        </>
      )}

      {mode === MODES.BET && (
        <>
          {betState === BET_STATES.SETUP && (
            <section className='panel'>
              <BetModeSetup
                onStartGame={handleBetModeStart}
                onCancel={handleBetModeCancel}
              />
            </section>
          )}

          {betState === BET_STATES.PLAYING && (
            <>
              <section className='panel'>
                <div className='bet-game'>
                  <div className='bet-game-status'>
                    <h3>
                      {allBetPlayersGuessed
                        ? 'Todos fizeram seus palpites!'
                        : `${
                            currentBetPlayer?.name || ''
                          } está fazendo seu palpite`}
                    </h3>
                    <div className='players-progress'>
                      {betPlayers.map((player, index) => {
                        const hasGuessed = !!allBetGuesses[player.id];
                        const isCurrent =
                          index === currentBetPlayerIndex &&
                          !allBetPlayersGuessed;
                        return (
                          <div
                            key={player.id}
                            className={`player-progress-item ${
                              hasGuessed ? 'done' : ''
                            } ${isCurrent ? 'current' : ''}`}
                          >
                            <span className='player-progress-name'>
                              {player.name}
                            </span>
                            <span className='player-progress-bet'>
                              R$ {player.bet}
                            </span>
                            {hasGuessed && <span className='checkmark'>✓</span>}
                            {isCurrent && !hasGuessed && (
                              <span className='current-indicator'>→</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {!allBetPlayersGuessed && currentBetPlayer && (
                    <div className='bet-game-actions'>
                      <p className='hint'>
                        É a vez de <strong>{currentBetPlayer.name}</strong>.
                        Faça seu palpite no mapa abaixo.
                      </p>
                    </div>
                  )}
                  {currentPlayerGuess &&
                    currentBetPlayer &&
                    !allBetPlayersGuessed && (
                      <div className='bet-game-actions'>
                        <button
                          type='button'
                          className='primary'
                          onClick={handleBetNextPlayer}
                        >
                          {currentBetPlayerIndex < betPlayers.length - 1
                            ? 'Próximo Jogador'
                            : 'Ver Resultados'}
                        </button>
                      </div>
                    )}
                  {allBetPlayersGuessed && (
                    <div className='bet-game-actions'>
                      <button
                        type='button'
                        className='primary'
                        onClick={handleBetRoundComplete}
                      >
                        Ver Resultados
                      </button>
                    </div>
                  )}
                </div>
              </section>
              <section className='panel'>
                <BetGuessMap
                  currentPlayerGuess={currentPlayerGuess}
                  allPlayerGuesses={allBetGuesses}
                  players={betPlayers}
                  realPosition={null}
                  showResults={false}
                  allowGuess={
                    !allBetPlayersGuessed &&
                    currentBetPlayer &&
                    !allBetGuesses[currentBetPlayer.id]
                  }
                  onGuess={handleBetGuess}
                />
              </section>
            </>
          )}

          {betState === BET_STATES.RESULTS && (
            <>
              <section className='panel'>
                <BetGuessMap
                  currentPlayerGuess={null}
                  allPlayerGuesses={allBetGuesses}
                  players={betPlayers}
                  realPosition={realPosition}
                  showResults={true}
                  onGuess={() => {}}
                />
              </section>
              <section className='panel'>
                <BetModeResults
                  players={betPlayers}
                  realPosition={realPosition}
                  playerGuesses={allBetGuesses}
                  onPlayAgain={handlePlayAgain}
                />
              </section>
            </>
          )}
        </>
      )}
    </>
  );
}
