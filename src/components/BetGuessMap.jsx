import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import PropTypes from 'prop-types'

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
  overflow: 'hidden',
}

const defaultCenter = { lat: 0, lng: 0 }

function BetGuessMap({
  currentPlayerGuess,
  allPlayerGuesses,
  players,
  realPosition,
  showResults,
  allowGuess,
  onGuess,
}) {
  const handleClick = (event) => {
    if (showResults || !allowGuess) return // Não permitir cliques durante resultados ou quando não for a vez
    const lat = event.latLng?.lat()
    const lng = event.latLng?.lng()
    if (typeof lat === 'number' && typeof lng === 'number') {
      onGuess({ lat, lng })
    }
  }

  // Criar marcadores para cada jogador
  const markers = []
  if (currentPlayerGuess && !showResults) {
    markers.push({
      position: currentPlayerGuess,
      label: '?',
      key: 'current',
    })
  }

  // Adicionar marcadores de todos os jogadores quando mostrar resultados
  if (showResults && allPlayerGuesses) {
    Object.entries(allPlayerGuesses).forEach(([playerId, guess]) => {
      const player = players.find((p) => p.id === playerId)
      if (player) {
        markers.push({
          position: guess,
          label: player.name.charAt(0).toUpperCase(),
          key: playerId,
        })
      }
    })
  }

  // Adicionar marcador da posição real quando mostrar resultados
  if (showResults && realPosition) {
    markers.push({
      position: realPosition,
      label: '🎯',
      key: 'real',
    })
  }

  // Criar linhas entre palpites e posição real durante resultados
  const polylines = []
  if (showResults && realPosition && allPlayerGuesses) {
    Object.entries(allPlayerGuesses).forEach(([playerId, guess]) => {
      const player = players.find((p) => p.id === playerId)
      if (player) {
        polylines.push({
          path: [realPosition, guess],
          options: {
            strokeColor: '#4285F4',
            strokeOpacity: 0.6,
            strokeWeight: 2,
          },
          key: playerId,
        })
      }
    })
  }

  return (
    <div className="map-wrapper">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={2}
        onClick={handleClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          minZoom: 2,
        }}
      >
        {markers.map((marker) => (
          <Marker key={marker.key} position={marker.position} label={marker.label} />
        ))}
        {polylines.map((polyline) => (
          <Polyline key={polyline.key} path={polyline.path} options={polyline.options} />
        ))}
      </GoogleMap>
      <p className="hint">
        {showResults
          ? 'Resultados finais. Veja quem foi mais próximo!'
          : 'Clique em qualquer lugar do mapa para fazer seu palpite.'}
      </p>
    </div>
  )
}

BetGuessMap.propTypes = {
  currentPlayerGuess: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  allPlayerGuesses: PropTypes.objectOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
  ),
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
  realPosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  showResults: PropTypes.bool,
  allowGuess: PropTypes.bool,
  onGuess: PropTypes.func.isRequired,
}

BetGuessMap.defaultProps = {
  showResults: false,
  allowGuess: true,
}

export default BetGuessMap

