import PropTypes from 'prop-types'

function Result({ distanceKm, score, disableConfirm, onConfirm, onPlayAgain }) {
  return (
    <div className="result-row">
      <button type="button" onClick={onConfirm} disabled={disableConfirm}>
        Confirmar palpite
      </button>
      <div className="result-text">
        {distanceKm === null ? (
          <p>Faça um palpite e confirme para ver a distância.</p>
        ) : (
          <p>
            Distância entre os pontos: <strong>{distanceKm.toFixed(2)} km</strong> ·
            Pontuação:{' '}
            <strong>{score}</strong>
          </p>
        )}
      </div>
      <button className="ghost" type="button" onClick={onPlayAgain}>
        Jogar novamente
      </button>
    </div>
  )
}

Result.propTypes = {
  distanceKm: PropTypes.number,
  score: PropTypes.number,
  disableConfirm: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
}

Result.defaultProps = {
  distanceKm: null,
  score: null,
  disableConfirm: true,
}

export default Result

