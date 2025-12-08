import { useAuth } from '../hooks/useAuth'

function AttemptsCounter() {
  const { isPremium, attemptsLeft, isBlocked } = useAuth()

  // Não mostrar se for premium (ilimitado)
  if (isPremium) return null

  // Não mostrar se não houver informação de tentativas
  if (attemptsLeft === null) return null

  return (
    <div className={`attempts-counter ${isBlocked ? 'blocked' : ''}`}>
      <span className="attempts-icon">🎯</span>
      <span className="attempts-text">
        {isBlocked ? (
          <strong>Sem tentativas restantes</strong>
        ) : (
          <>
            <strong>{attemptsLeft}</strong> tentativa{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''} hoje
          </>
        )}
      </span>
    </div>
  )
}

export default AttemptsCounter

