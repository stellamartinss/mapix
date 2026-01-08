import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

function StreetView({ position, loading }) {
  const containerRef = useRef(null);
  const panoramaRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!window.google || !containerRef.current || !position) return;

    if (!panoramaRef.current) {
      panoramaRef.current = new window.google.maps.StreetViewPanorama(
        containerRef.current,
        {
          position,
          addressControl: false,
          fullscreenControl: true,
          panControl: true,
          linksControl: true,
          motionTracking: false,
        }
      );
    } else {
      panoramaRef.current.setPosition(position);
    }

    return () => {
      // clean up the panorama instance on unmount
      panoramaRef.current = null;
    };
  }, [position]);

  if (loading) {
    return (
      <div className='h-[400px] md:rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 grid place-items-center text-slate-600 dark:text-slate-400 text-center'>
        {t('generatingRandomPoint')}
      </div>
    );
  }

  if (!position) {
    return (
      <div className='h-[400px] md:rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 grid place-items-center text-slate-600 dark:text-slate-400 text-center'>
        {t('loadingStreetView')}
      </div>
    );
  }

  return (
    <div
      className='w-full h-full md:rounded-xl overflow-hidden'
      ref={containerRef}
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
