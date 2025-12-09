import { GoogleMap, Marker, Polyline } from '@react-google-maps/api'
import PropTypes from 'prop-types'

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
  overflow: 'hidden',
}

const defaultCenter = { lat: 0, lng: 0 }

function GuessMap({ guessPosition, realPosition, showResult, linePath, onGuess }) {
  const handleClick = (event) => {
    const lat = event.latLng?.lat()
    const lng = event.latLng?.lng()
    if (typeof lat === 'number' && typeof lng === 'number') {
      onGuess({ lat, lng })
    }
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
        {guessPosition ? <Marker position={guessPosition} label="?" /> : null}
        {showResult && realPosition ? (
          <Marker position={realPosition} label="🎯" />
        ) : null}
        {showResult && linePath.length ? (
          <Polyline
            path={linePath}
            options={{
              strokeColor: '#4285F4',
              strokeOpacity: 0.9,
              strokeWeight: 2,
            }}
          />
        ) : null}
      </GoogleMap>
      <p className="hint">Clique em qualquer lugar do mapa para fazer seu palpite.</p>
    </div>
  )
}

GuessMap.propTypes = {
  guessPosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  realPosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  showResult: PropTypes.bool,
  linePath: PropTypes.arrayOf(
    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  ),
  onGuess: PropTypes.func.isRequired,
}

GuessMap.defaultProps = {
  showResult: false,
  linePath: [],
}

export default GuessMap


