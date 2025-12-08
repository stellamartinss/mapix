import { useCallback, useEffect, useMemo, useState } from 'react'
import { LoadScript } from '@react-google-maps/api'
import GuessHistory from './components/GuessHistory'
import GuessMap from './components/GuessMap'
import Result from './components/Result'
import StreetView from './components/StreetView'
import { calculateScore, getRandomLatLng, haversineDistance } from './utils/geo'
import './App.css'

const libraries = ['places']

function App() {
  const [apiReady, setApiReady] = useState(false)
  const [realPosition, setRealPosition] = useState(null)
  const [guessPosition, setGuessPosition] = useState(null)
  const [distanceKm, setDistanceKm] = useState(null)
  const [lastScore, setLastScore] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const pickRandomStreetView = useCallback(async () => {
    if (!window.google) return

    setLoading(true)
    setGuessPosition(null)
    setDistanceKm(null)
    setLastScore(null)

    const service = new window.google.maps.StreetViewService()
    const maxAttempts = 25

    const attempt = (count = 0) =>
      new Promise((resolve) => {
        const candidate = getRandomLatLng()
        service.getPanorama(
          { location: candidate, radius: 50000 },
          (data, status) => {
            if (
              status === window.google.maps.StreetViewStatus.OK &&
              data?.location?.latLng
            ) {
              resolve({
                lat: data.location.latLng.lat(),
                lng: data.location.latLng.lng(),
              })
            } else if (count < maxAttempts) {
              resolve(attempt(count + 1))
            } else {
              // fallback to the last random point if coverage is scarce
              resolve(candidate)
            }
          },
        )
      })

    const location = await attempt()
    setRealPosition(location)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (apiReady) {
      pickRandomStreetView()
    }
  }, [apiReady, pickRandomStreetView])

  const handleGuess = useCallback(() => {
    if (!realPosition || !guessPosition) return
    const distance = haversineDistance(realPosition, guessPosition)
    const score = calculateScore(distance)
    setDistanceKm(distance)
    setLastScore(score)
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
    ])
  }, [guessPosition, realPosition])

  const handlePlayAgain = useCallback(() => {
    pickRandomStreetView()
  }, [pickRandomStreetView])

  const linePath = useMemo(() => {
    if (!realPosition || !guessPosition || distanceKm === null) return []
    return [realPosition, guessPosition]
  }, [distanceKm, realPosition, guessPosition])

  if (!apiKey) {
    return (
      <div className="app app--centered">
        <h1>Mini GeoGuessr</h1>
        <p>
          Adicione sua chave do Google Maps em um arquivo <code>.env</code> com:{' '}
          <code>VITE_GOOGLE_MAPS_API_KEY=</code>
        </p>
      </div>
    )
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={() => setApiReady(true)}
    >
      <div className="app">
        <header className="header">
          <div>
            <p className="eyebrow">Mini GeoGuessr</p>
            <h1>Encontre onde o Street View está</h1>
          </div>
          <button
            className="ghost"
            type="button"
            onClick={handlePlayAgain}
            disabled={loading}
          >
            Jogar novamente
          </button>
        </header>

        <section className="panel">
          <StreetView position={realPosition} loading={loading} />
        </section>

        <section className="panel">
          <GuessMap
            guessPosition={guessPosition}
            realPosition={realPosition}
            showResult={distanceKm !== null}
            linePath={linePath}
            onGuess={setGuessPosition}
          />
          <Result
            distanceKm={distanceKm}
            score={lastScore}
            disableConfirm={!guessPosition || loading}
            onConfirm={handleGuess}
            onPlayAgain={handlePlayAgain}
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Últimos palpites</h2>
            <p className="hint">Mostrando os 5 mais recentes</p>
          </div>
          <GuessHistory entries={history.slice(0, 5)} />
        </section>
      </div>
    </LoadScript>
  )
}

export default App
