import PropTypes from 'prop-types'

function GuessHistory({ entries }) {
  if (!entries.length) {
    return <p className="hint">Ainda sem palpites. Faça um para ver o histórico.</p>
  }

  return (
    <div className="history">
      {entries.slice(0, 5).map((item, idx) => (
        <div key={item.id} className="history-row">
          <div className="history-rank">#{idx + 1}</div>
          <div className="history-info">
            <p className="history-title">
              Distância: {item.distanceKm.toFixed(2)} km · Pontos: {item.score}
            </p>
            <p className="history-sub">
              Palpite: {item.guess.lat.toFixed(2)}, {item.guess.lng.toFixed(2)} · Real:{' '}
              {item.real.lat.toFixed(2)}, {item.real.lng.toFixed(2)}
            </p>
          </div>
          <span className="history-time">
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

