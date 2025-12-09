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
    <div className="bet-setup">
      <div className="bet-setup-header">
        <h2>Configurar Modo Aposta</h2>
        <p className="hint">
          Cada jogador aposta R$ 1, R$ 2 ou R$ 3. O mais próximo ganha 80% do prêmio.
        </p>
      </div>

      <div className="players-list">
        {players.map((player) => (
          <div key={player.id} className="player-input-row">
            <input
              type="text"
              className="player-name-input"
              value={player.name}
              onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
              placeholder="Nome do jogador"
            />
            <div className="bet-buttons">
              {BET_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={player.bet === value ? 'bet-btn active' : 'bet-btn'}
                  onClick={() => handlePlayerBetChange(player.id, value)}
                >
                  R$ {value}
                </button>
              ))}
            </div>
            {numPlayers > 2 && (
              <button
                type="button"
                className="remove-player-btn"
                onClick={() => handleRemovePlayer(player.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bet-summary">
        <div className="summary-row">
          <span>Total apostado:</span>
          <strong>R$ {totalBet.toFixed(2)}</strong>
        </div>
        <div className="summary-row">
          <span>Prêmio (80%):</span>
          <strong className="prize-amount">R$ {prize.toFixed(2)}</strong>
        </div>
        <div className="summary-row">
          <span>Banca (20%):</span>
          <span>R$ {houseCut.toFixed(2)}</span>
        </div>
      </div>

      <div className="bet-setup-actions">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleAddPlayer}
          disabled={numPlayers >= 8}
          className="ghost"
        >
          + Adicionar Jogador
        </button>
        <button type="button" onClick={handleStart} className="primary">
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

