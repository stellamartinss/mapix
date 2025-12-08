import PropTypes from 'prop-types'
import { haversineDistance } from '../utils/geo'

function BetModeResults({ players, realPosition, playerGuesses, onPlayAgain }) {
  // Calcular distâncias e ordenar jogadores
  const results = players
    .map((player) => {
      const guess = playerGuesses[player.id]
      if (!guess) return null

      const distance = haversineDistance(realPosition, guess)
      return {
        ...player,
        guess,
        distance,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance) // Ordenar por distância (menor = melhor)

  const winner = results[0]
  const totalBet = players.reduce((sum, p) => sum + p.bet, 0)
  const prize = totalBet * 0.8
  const houseCut = totalBet * 0.2

  return (
    <div className="bet-results">
      <div className="bet-results-header">
        <h2>Resultados da Rodada</h2>
      </div>

      <div className="winner-announcement">
        <div className="winner-crown">👑</div>
        <h3>{winner.name} venceu!</h3>
        <p className="winner-distance">Distância: {winner.distance.toFixed(2)} km</p>
        <div className="winner-prize">
          <span className="prize-label">Prêmio:</span>
          <span className="prize-value">R$ {prize.toFixed(2)}</span>
        </div>
      </div>

      <div className="results-table">
        <div className="results-table-header">
          <span>Posição</span>
          <span>Jogador</span>
          <span>Aposta</span>
          <span>Distância</span>
        </div>
        {results.map((result, index) => {
          const isWinner = index === 0
          return (
            <div key={result.id} className={`results-table-row ${isWinner ? 'winner-row' : ''}`}>
              <span className="position-badge">{index + 1}º</span>
              <span className="player-name-result">{result.name}</span>
              <span className="bet-amount-result">R$ {result.bet.toFixed(2)}</span>
              <span className="distance-result">{result.distance.toFixed(2)} km</span>
            </div>
          )
        })}
      </div>

      <div className="bet-financial-summary">
        <div className="financial-item">
          <span>Total apostado:</span>
          <strong>R$ {totalBet.toFixed(2)}</strong>
        </div>
        <div className="financial-item winner-item">
          <span>{winner.name} recebe:</span>
          <strong>R$ {prize.toFixed(2)}</strong>
        </div>
        <div className="financial-item house-item">
          <span>Banca recebe:</span>
          <span>R$ {houseCut.toFixed(2)}</span>
        </div>
      </div>

      <div className="bet-results-actions">
        <button type="button" className="primary" onClick={onPlayAgain}>
          Nova Rodada
        </button>
      </div>
    </div>
  )
}

BetModeResults.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      bet: PropTypes.number.isRequired,
    }),
  ).isRequired,
  realPosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  playerGuesses: PropTypes.objectOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
  ).isRequired,
  onPlayAgain: PropTypes.func.isRequired,
}

export default BetModeResults

