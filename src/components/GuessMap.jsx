import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import { useTranslation } from '../hooks/useTranslation';
import './styles/GuessMap.css';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 0, lng: 0 };

function GuessMap({
  guessPosition,
  realPosition,
  showResult,
  linePath,
  onGuess,
  onConfirm,
  disableConfirm,
  distanceKm,
  disableInteraction,
}) {
  const { t } = useTranslation();
  
  const handleClick = (event) => {
    if (disableInteraction) return;
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (typeof lat === 'number' && typeof lng === 'number') {
      onGuess({ lat, lng });
    }
  };

  return (
    <div className='guess-map-container'>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={2}
        onClick={handleClick}
        options={{
          // CRITICAL: gestureHandling "greedy" allows single-finger panning on mobile
          // This removes the "use two fingers" message and enables one-finger map navigation
          gestureHandling: 'greedy',
          // Disable all default UI controls for clean game interface
          disableDefaultUI: true,
          // Touch and interaction settings
          draggable: true,
          draggableCursor: 'crosshair',
          // Zoom settings
          minZoom: 2,
          maxZoom: 20,
          // Disable double-click zoom to prevent accidental zoom
          disableDoubleClickZoom: true,
          // Disable scroll wheel zoom for consistent touch behavior
          scrollwheel: false,
          // Disable keyboard shortcuts for game-like UX
          keyboardShortcuts: false,
          zIndex: 1,
        }}
      >
        {guessPosition ? <Marker position={guessPosition} label='?' /> : null}
        {showResult && realPosition ? (
          <Marker position={realPosition} label='🎯' />
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
      {distanceKm === null && (
        <button
          type='button'
          onClick={onConfirm}
          disabled={disableConfirm}
          className='guess-map-confirm-btn'
        >
          {t('confirmGuess')}
        </button>
      )}
    </div>
  );
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
    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number })
  ),
  onGuess: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  disableConfirm: PropTypes.bool,
  distanceKm: PropTypes.number,
  disableInteraction: PropTypes.bool,
};

GuessMap.defaultProps = {
  showResult: false,
  linePath: [],
  onConfirm: undefined,
  disableConfirm: true,
  distanceKm: null,
  disableInteraction: false,
};

export default GuessMap;
