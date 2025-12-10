import { useState } from 'react'
import PropTypes from 'prop-types'

const BET_VALUES = [1, 2, 3]

function BetModeSetup({ onStartGame, onCancel }) {
  const [numPlayers, setNumPlayers] = useState(2)
  const [players, setPlayers] = useState([
    { id: '1', name: 'Jogador 1', bet: 1 },
    { id: '2', name: 'Jogador 2', bet: 1 },
  ])

  const handleAddPlayer = () => {
    if (numPlayers >= 8) return // Limite de 8 jogadores
    const newId = String(numPlayers + 1)
    setPlayers([...players, { id: newId, name: `Jogador ${newId}`, bet: 1 }])
    setNumPlayers(numPlayers + 1)
  }

  const handleRemovePlayer = (id) => {
    if (numPlayers <= 2) return // Mínimo de 2 jogadores
    setPlayers(players.filter((p) => p.id !== id))
    setNumPlayers(numPlayers - 1)
  }

  const handlePlayerNameChange = (id, name) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  const handlePlayerBetChange = (id, bet) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, bet: Number(bet) } : p)))
  }

  const totalBet = players.reduce((sum, p) => sum + p.bet, 0)
  const prize = totalBet * 0.8
  const houseCut = totalBet * 0.2

  const handleStart = () => {
    onStartGame(players)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="m-0 text-2xl text-slate-900 dark:text-slate-100">Configurar Modo Aposta</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Cada jogador aposta R$ 1, R$ 2 ou R$ 3. O mais próximo ganha 80% do prêmio.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {players.map((player) => (
          <div key={player.id} className="grid md:grid-cols-[1fr_auto_auto] grid-cols-1 gap-3 items-center p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
            <input
              type="text"
              className="py-2.5 px-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] dark:focus:border-blue-600 dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
              value={player.name}
              onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
              placeholder="Nome do jogador"
            />
            <div className="flex gap-1.5 md:w-auto w-full">
              {BET_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`flex-1 md:flex-initial px-4 py-2 border-2 rounded-lg font-semibold min-w-[60px] transition-all ${
                    player.bet === value
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500'
                  }`}
                  onClick={() => handlePlayerBetChange(player.id, value)}
                >
                  R$ {value}
                </button>
              ))}
            </div>
            {numPlayers > 2 && (
              <button
                type="button"
                className="px-3 py-2 border border-red-500 bg-white dark:bg-slate-800 text-red-500 rounded-lg font-semibold min-w-[40px] transition-all hover:bg-red-500 hover:text-white"
                onClick={() => handleRemovePlayer(player.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center text-sm">
          <span>Total apostado:</span>
          <strong className="text-base text-slate-900 dark:text-slate-100">R$ {totalBet.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Prêmio (80%):</span>
          <strong className="text-green-500 text-lg">R$ {prize.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Banca (20%):</span>
          <span>R$ {houseCut.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex md:flex-row flex-col gap-3 justify-end">
        <button type="button" className="bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 border border-slate-900 dark:border-slate-50 rounded-lg px-4 py-3 font-semibold transition-all hover:bg-slate-800 dark:hover:bg-slate-200 hover:border-slate-800 dark:hover:border-slate-200" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAddPlayer}
          disabled={numPlayers >= 8}
          className="bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 border border-slate-900 dark:border-slate-50 rounded-lg px-4 py-3 font-semibold transition-all hover:bg-slate-800 dark:hover:bg-slate-200 hover:border-slate-800 dark:hover:border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          + Adicionar Jogador
        </button>
        <button type="button" onClick={handleStart} className="bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white border border-blue-500 dark:border-blue-600 rounded-lg px-4 py-3 font-semibold transition-all hover:translate-y-[-1px] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed">
          Iniciar Partida
        </button>
      </div>
    </div>
  )
}

BetModeSetup.propTypes = {
  onStartGame: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default BetModeSetup

