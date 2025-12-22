import { useCallback, useMemo, useState } from 'react';
import LastGuesses from '../components/LastGuesses';
import GuessMap from '../components/GuessMap';
import Result from '../components/Result';
import StreetView from '../components/StreetView';
import AttemptsCounter from '../components/AttemptsCounter';
import GuessFeedback from '../components/GuessFeedback';
import StartScreen from '../components/StartScreen';
import DarkModeToggle from '../components/DarkModeToggle';
import { useAuth } from '../hooks/useAuth';
import {
  calculateScore,
  getRandomLatLng,
  haversineDistance,
} from '../utils/geo';
import './styles/GamePage.css';
import PlayAgain from '../components/PlayAgain';

const pinMapStyle = {
  position: 'fixed',
  bottom: '0',
  right: '0',
  zIndex: '10',
};

const darkModeToggle = { position: 'absolute', top: '24px', right: '24px' };

export default function GamePage() {
  const [isHidden, setIsHidden] = useState(true);
  const [displayLastGuesses, setDisplayLastGuesses] = useState(false);

  const { attemptsLeft } = useAuth();

  const [realPosition, setRealPosition] = useState(null);
  const [guessPosition, setGuessPosition] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [lastScore, setLastScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickRandomStreetView = useCallback(async () => {
    if (!window.google) return;

    setLoading(true);
    setGuessPosition(null);
    setDistanceKm(null);
    setLastScore(null);

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
  }, []);

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
    pickRandomStreetView();
  }, [pickRandomStreetView]);

  const handleHideToggle = () => {
    setIsHidden((prev) => !prev);
  };

  const linePath = useMemo(() => {
    if (!realPosition || !guessPosition || distanceKm === null) return [];
    return [realPosition, guessPosition];
  }, [distanceKm, realPosition, guessPosition]);

  const onHandleDisplayLastGuesses = () => {
    setDisplayLastGuesses((prev) => !prev);
  };

  return (
    <div class='min-h-screen grid place-items-center p-6'>
      <div style={darkModeToggle}>
        <div className='flex md:flex-row flex-col md:items-center items-start gap-2'>
          <DarkModeToggle />
        </div>
      </div>
      <div className='w-full flex flex-col gap-8'>
        {/* HEADER */}
        <header className='flex md:flex-row flex-col md:items-center items-start justify-between gap-6'>
          <div>
            <p className='uppercase tracking-wide text-xs text-slate-300 m-0 mb-1'>
              Mapix
            </p>
            <h1 className='m-0 text-3xl font-bold text-slate-900 dark:text-white'>
              Encontre onde o Street View está
            </h1>
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3 md:w-auto w-full'>
            <GuessFeedback distanceKm={distanceKm} score={lastScore} />

            {realPosition && !loading && (
              <PlayAgain onPlayAgain={handlePlayAgain} disabled={loading} />
            )}
          </div>
        </header>

        {/* STREET VIEW / START */}
        <section
          className={`${
            !realPosition && !loading ? 'bg-white/10' : ''
          } rounded-3xl p-6 flex flex-col gap-3`}
        >
          {!realPosition && !loading ? (
            <StartScreen
              onStart={handleStartGame}
              attemptsLeft={attemptsLeft}
            />
          ) : (
            <div className='flex w-full gap-4'>
              <div className='w-[80%]'>
                <StreetView position={realPosition} loading={loading} />
              </div>

              <div className='w-[20%]'>
                <LastGuesses
                  history={history}
                  onHandleDisplayLastGuesses={onHandleDisplayLastGuesses}
                />
              </div>
            </div>
          )}
        </section>

        {/* CLASSIC MODE */}
        {realPosition && !loading && (
          <div className='w-full flex justify-center'>
            {isHidden ? (
              <section
                className='bg-white dark:bg-gray-800 border border-white/20 rounded-2xl p-6 shadow-xl flex flex-col gap-4'
                style={pinMapStyle}
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
            ) : (
              <section className='' style={pinMapStyle}>
                <button
                  onClick={handleHideToggle}
                  className='bg-gray-800 dark:bg-white text-white dark:text-gray-800 rounded-lg px-4 py-3 font-semibold transition-all hover:bg-white/30 hover:shadow-xl'
                >
                  <p>Dê seu palpite</p>
                  <div className='text-6xl'>🗺️</div>
                </button>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
