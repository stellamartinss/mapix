import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function UpgradeModal({ onClose, onUpgrade }) {
  const { isGuest } = useAuth()
  const navigate = useNavigate()

  const handleUpgrade = async () => {
    if (isGuest) {
      // Redirecionar para login se for convidado
      navigate('/login')
    } else if (onUpgrade) {
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
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 dark:bg-black/85 grid place-items-center z-[1000] p-5 animate-[fadeIn_0.2s_ease]" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-[500px] w-full shadow-2xl relative animate-[slideUp_0.3s_ease] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-700 border-none w-8 h-8 rounded-lg grid place-items-center cursor-pointer text-slate-500 dark:text-slate-400 text-lg transition-all hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100" onClick={onClose} aria-label="Fechar">
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3 block">🔒</div>
          <h2 className="m-0 mb-2 text-2xl text-slate-900 dark:text-slate-100">
            {isGuest ? 'Tentativas Esgotadas' : 'Limite Diário Atingido'}
          </h2>
          <p className="m-0 text-slate-500 dark:text-slate-400 text-base">
            {isGuest 
              ? 'Você usou suas 3 tentativas gratuitas. Faça login ou crie uma conta para continuar jogando!'
              : 'Você já usou suas 3 tentativas gratuitas hoje.'
            }
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 my-6">
          <h3 className="m-0 mb-4 text-lg text-slate-900 dark:text-slate-100">Desbloqueie com Premium:</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
              <span className="text-xl w-6 text-center">✨</span>
              <span>Jogos ilimitados</span>
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
              <span className="text-xl w-6 text-center">📊</span>
              <span>Estatísticas avançadas</span>
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
              <span className="text-xl w-6 text-center">🏆</span>
              <span>Rankings e competições</span>
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
              <span className="text-xl w-6 text-center">🎮</span>
              <span>Modos temáticos exclusivos</span>
            </li>
            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
              <span className="text-xl w-6 text-center">🔒</span>
              <span>Salas privadas</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button className="px-6 py-4 text-base w-full bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white border border-blue-500 dark:border-blue-600 rounded-lg transition-all hover:translate-y-[-1px] hover:bg-gradient-to-br hover:from-blue-600 hover:to-green-600 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleUpgrade}>
            {isGuest ? 'Fazer Login / Criar Conta' : 'Upgrade por US$ 6,99/mês'}
          </button>
          <button className="bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 border border-slate-900 dark:border-slate-50 rounded-lg px-4 py-3 font-semibold transition-all hover:bg-slate-800 dark:hover:bg-slate-200 hover:border-slate-800 dark:hover:border-slate-200" onClick={onClose}>
            Talvez depois
          </button>
        </div>

        {!isGuest && (
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Suas tentativas resetam às 00:00 UTC ({getMidnightUTC()} horário local)
          </p>
        )}
      </div>
    </div>
  )
}

UpgradeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpgrade: PropTypes.func,
}

export default UpgradeModal

