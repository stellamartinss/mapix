import PropTypes from 'prop-types'

function UpgradeModal({ onClose, onUpgrade }) {
  const handleUpgrade = async () => {
    if (onUpgrade) {
      await onUpgrade()
    }
  }

  const getMidnightUTC = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCDate(midnight.getUTCDate() + 1)
    midnight.setUTCHours(0, 0, 0, 0)
    return midnight.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <div className="modal-header">
          <div className="modal-icon">🔒</div>
          <h2>Limite Diário Atingido</h2>
          <p className="modal-subtitle">
            Você já usou suas 3 tentativas gratuitas hoje.
          </p>
        </div>

        <div className="premium-benefits">
          <h3>Desbloqueie com Premium:</h3>
          <ul>
            <li>
              <span className="benefit-icon">✨</span>
              <span>Jogos ilimitados</span>
            </li>
            <li>
              <span className="benefit-icon">📊</span>
              <span>Estatísticas avançadas</span>
            </li>
            <li>
              <span className="benefit-icon">🏆</span>
              <span>Rankings e competições</span>
            </li>
            <li>
              <span className="benefit-icon">🎮</span>
              <span>Modos temáticos exclusivos</span>
            </li>
            <li>
              <span className="benefit-icon">🔒</span>
              <span>Salas privadas</span>
            </li>
          </ul>
        </div>

        <div className="modal-actions">
          <button className="primary large" onClick={handleUpgrade}>
            Upgrade por US$ 6,99/mês
          </button>
          <button className="ghost" onClick={onClose}>
            Talvez depois
          </button>
        </div>

        <p className="hint reset-info">
          Suas tentativas resetam às 00:00 UTC ({getMidnightUTC()} horário local)
        </p>
      </div>
    </div>
  )
}

UpgradeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func,
}

export default UpgradeModal

