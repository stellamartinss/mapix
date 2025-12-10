import PropTypes from 'prop-types'
import { haversineDistance } from '../../utils/geo'

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
    <div className="flex flex-col gap-6">
      <div className="bet-results-header">
        <h2 className="m-0 text-2xl text-slate-900 dark:text-slate-100">Resultados da Rodada</h2>
      </div>

      <div className="text-center p-6 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-950 border-2 border-amber-500 dark:border-amber-600 rounded-2xl">
        <div className="text-5xl mb-3">👑</div>
        <h3 className="m-0 mb-2 text-3xl text-slate-900 dark:text-amber-100">{winner.name} venceu!</h3>
        <p className="m-0 mb-3 text-base text-slate-600 dark:text-amber-200">Distância: {winner.distance.toFixed(2)} km</p>
        <div className="flex flex-col items-center gap-1 mt-4">
          <span className="text-sm text-slate-500 dark:text-amber-300">Prêmio:</span>
          <span className="text-3xl font-bold text-green-500">R$ {prize.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_120px] md:grid-cols-[60px_1fr_100px_120px] gap-3 p-3 bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-600 dark:text-slate-400">
          <span>Posição</span>
          <span>Jogador</span>
          <span>Aposta</span>
          <span>Distância</span>
        </div>
        {results.map((result, index) => {
          const isWinner = index === 0
          return (
            <div key={result.id} className={`grid grid-cols-[60px_1fr_100px_120px] md:grid-cols-[60px_1fr_100px_120px] gap-3 p-3 items-center border-b border-slate-200 dark:border-slate-700 last:border-b-0 ${
              isWinner ? 'bg-green-50 dark:bg-green-950' : 'bg-white dark:bg-slate-800'
            }`}>
              <span className={`font-bold text-center py-1.5 px-0 rounded-lg ${
                isWinner ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>{index + 1}º</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{result.name}</span>
              <span className="text-center text-slate-600 dark:text-slate-400">R$ {result.bet.toFixed(2)}</span>
              <span className="text-right font-semibold text-slate-900 dark:text-slate-100">{result.distance.toFixed(2)} km</span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center py-2 text-base">
          <span className="text-slate-600 dark:text-slate-400">Total apostado:</span>
          <strong className="text-lg text-slate-900 dark:text-slate-100">R$ {totalBet.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500">
          <span className="text-green-900 dark:text-green-400 font-semibold">{winner.name} recebe:</span>
          <strong className="text-green-500 text-xl">R$ {prize.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
          <span className="text-red-900 dark:text-red-400">Banca recebe:</span>
          <span className="text-red-600 dark:text-red-500 font-semibold">R$ {houseCut.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button type="button" className="bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white border border-blue-500 dark:border-blue-600 rounded-lg px-4 py-3 font-semibold transition-all hover:translate-y-[-1px] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed" onClick={onPlayAgain}>
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

