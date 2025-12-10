import PropTypes from 'prop-types'

function GuessHistory({ entries }) {
  if (!entries.length) {
    return <p className="text-slate-500 dark:text-slate-400 text-sm">Ainda sem palpites. Faça um para ver o histórico.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      {entries.slice(0, 5).map((item, idx) => (
        <div key={item.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center p-2.5 px-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div className="font-bold text-slate-900 dark:text-slate-200 py-1.5 px-2.5 rounded-lg bg-slate-200 dark:bg-slate-700">#{idx + 1}</div>
          <div className="flex flex-col gap-1">
            <p className="m-0 font-semibold text-slate-900 dark:text-slate-100">
              Distância: {item.distanceKm.toFixed(2)} km · Pontos: {item.score}
            </p>
            <p className="m-0 text-slate-600 dark:text-slate-400 text-sm">
              Palpite: {item.guess.lat.toFixed(2)}, {item.guess.lng.toFixed(2)} · Real:{' '}
              {item.real.lat.toFixed(2)}, {item.real.lng.toFixed(2)}
            </p>
          </div>
          <span className="text-slate-600 dark:text-slate-400 text-xs">
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ))}
    </div>
  )
}

GuessHistory.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      distanceKm: PropTypes.number.isRequired,
      score: PropTypes.number.isRequired,
      guess: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }).isRequired,
      real: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }).isRequired,
      createdAt: PropTypes.number.isRequired,
    }),
  ).isRequired,
}

export default GuessHistory

