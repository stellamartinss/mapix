import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

function StreetView({ position, loading }) {
  const containerRef = useRef(null);
  const panoramaRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!window.google || !containerRef.current || !position) {
      return;
    }

    // Sempre recriar o panorama para garantir que seja renderizado
    if (panoramaRef.current) {
      panoramaRef.current = null;
    }

    try {
      panoramaRef.current = new window.google.maps.StreetViewPanorama(
        containerRef.current,
        {
          position: position,
          addressControl: false,
          fullscreenControl: true,
          panControl: true,
          linksControl: true,
          motionTracking: false,
          zoomControl: true,
          enableCloseButton: false,
        }
      );
    } catch (error) {
      console.error('Erro ao criar Street View:', error);
    }

    return () => {
      if (panoramaRef.current) {
        panoramaRef.current = null;
      }
    };
  }, [position]);

  if (loading) {
    return (
      <div className='w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 grid place-items-center text-slate-600 dark:text-slate-400 text-center'>
        {t('generatingRandomPoint')}
      </div>
    );
  }

  if (!position) {
    return (
      <div className='w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 grid place-items-center text-slate-600 dark:text-slate-400 text-center'>
        {t('loadingStreetView')}
      </div>
    );
  }

  return (
    <div
      className='w-full h-full overflow-hidden'
      ref={containerRef}
      style={{ backgroundColor: '#1a1a1a' }}
    />
  );
}

StreetView.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  loading: PropTypes.bool,
};

export default StreetView;
