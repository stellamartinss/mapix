import PropTypes from 'prop-types'

const MODES = {
  CLASSIC: 'classic',
  BET: 'bet',
}

function ModeSelector({ currentMode, onModeChange }) {
  return (
    <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        className={`flex items-center gap-1.5 px-4 py-2 bg-transparent border-none rounded-lg font-medium transition-all ${
          currentMode === MODES.CLASSIC
            ? 'bg-slate-900 dark:bg-slate-50 text-slate-300 dark:text-slate-900'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        onClick={() => onModeChange(MODES.CLASSIC)}
      >
        <span className="text-lg">🎯</span>
        <span>Modo Clássico</span>
      </button>
      <button
        type="button"
        className={`flex items-center gap-1.5 px-4 py-2 bg-transparent border-none rounded-lg font-medium transition-all ${
          currentMode === MODES.BET
            ? 'bg-slate-900 dark:bg-slate-50 text-slate-300 dark:text-slate-900'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        onClick={() => onModeChange(MODES.BET)}
      >
        <span className="text-lg">💰</span>
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

