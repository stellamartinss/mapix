import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
  overflow: 'hidden',
}

function StreetView({ position, loading }) {
  const containerRef = useRef(null)
  const panoramaRef = useRef(null)

  useEffect(() => {
    if (!window.google || !containerRef.current || !position) return

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
        },
      )
    } else {
      panoramaRef.current.setPosition(position)
    }

    return () => {
      // clean up the panorama instance on unmount
      panoramaRef.current = null
    }
  }, [position])

  if (loading) {
    return <div className="placeholder">Gerando um ponto aleatório...</div>
  }

  if (!position) {
    return (
      <div className="placeholder">Carregando Street View. Aguarde um instante.</div>
    )
  }

  return <div style={containerStyle} ref={containerRef} />
}

StreetView.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  loading: PropTypes.bool,
}

export default StreetView

