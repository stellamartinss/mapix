import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import { useTranslation } from '../hooks/useTranslation';

const containerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
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
  onHideToggle,
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
    <div className='map-wrapper relative' style={{ position: 'relative' }}>
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
      {onHideToggle && (
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onHideToggle();
          }}
          className='absolute top-4 right-4 px-3 py-1 text-lg rounded-full bg-slate-600 hover:bg-yellow-700 text-white hover:text-slate-600 
                 text-white'
          style={{ zIndex: 1000 }}
        >
          ×
        </button>
      )}
      {distanceKm === null && (
        <button
          type='button'
          onClick={onConfirm}
          disabled={disableConfirm}
          className='absolute bottom-4 right-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg px-4 py-3 font-semibold text-white transition-all hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed z-10'
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
  onHideToggle: PropTypes.func,
  disableInteraction: PropTypes.bool,
};

GuessMap.defaultProps = {
  showResult: false,
  linePath: [],
  onConfirm: undefined,
  disableConfirm: true,
  distanceKm: null,
  onHideToggle: undefined,
  disableInteraction: false,
};

export default GuessMap;
