import PropTypes from 'prop-types';
import PlayAgain from './PlayAgain';

function Result({
  distanceKm,
  score,
  disableConfirm,
  onConfirm,
  onPlayAgain,
  onHideToggle,
}) {
  return (
    <div className='grid md:grid-cols-[auto_1fr_auto] grid-cols-1 gap-3 items-center w-full md:w-[500px]'>
      {distanceKm === null ? (
        <button type='button' onClick={onConfirm} disabled={disableConfirm} className='border border-slate-300 dark:border-slate-600 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg px-4 py-3 font-semibold text-slate-900 dark:text-slate-200 transition-all hover:translate-y-[-1px] hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'>
          Confirmar palpite
        </button>
      ) : (
        <PlayAgain onPlayAgain={onPlayAgain} disableConfirm={disableConfirm} />
      )}
      <div className='text-slate-900 dark:text-slate-100'>
        {distanceKm === null ? (
          <></>
        ) : (
          <p>
            Distância entre os pontos:{' '}
            <strong>{distanceKm.toFixed(2)} km</strong> · Pontuação:{' '}
            <strong>{score}</strong>
          </p>
        )}
      </div>
      <button type='button' onClick={() => onHideToggle()} className='px-2 py-1 text-xs rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all'>
        —
      </button>
    </div>
  );
}

Result.propTypes = {
  distanceKm: PropTypes.number,
  score: PropTypes.number,
  disableConfirm: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
};

Result.defaultProps = {
  distanceKm: null,
  score: null,
  disableConfirm: true,
};

export default Result;
