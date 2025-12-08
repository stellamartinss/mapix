import PropTypes from 'prop-types'

const MODES = {
  CLASSIC: 'classic',
  BET: 'bet',
}

function ModeSelector({ currentMode, onModeChange }) {
  return (
    <div className="mode-selector">
      <button
        type="button"
        className={currentMode === MODES.CLASSIC ? 'mode-btn active' : 'mode-btn'}
        onClick={() => onModeChange(MODES.CLASSIC)}
      >
        <span className="mode-icon">🎯</span>
        <span>Modo Clássico</span>
      </button>
      <button
        type="button"
        className={currentMode === MODES.BET ? 'mode-btn active' : 'mode-btn'}
        onClick={() => onModeChange(MODES.BET)}
      >
        <span className="mode-icon">💰</span>
        <span>Modo Aposta</span>
      </button>
    </div>
  )
}

ModeSelector.propTypes = {
  currentMode: PropTypes.oneOf(['classic', 'bet']).isRequired,
  onModeChange: PropTypes.func.isRequired,
}

export { MODES }
export default ModeSelector

