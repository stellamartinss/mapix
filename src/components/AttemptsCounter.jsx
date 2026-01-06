import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'

function AttemptsCounter() {
  const { isPremium, attemptsLeft, isBlocked, isGuest } = useAuth()
  const { t } = useTranslation()

  // Não mostrar se for premium (ilimitado)
  if (isPremium) return null

  // Não mostrar se não houver informação de tentativas
  if (attemptsLeft === null) return null

  return (
    <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full border-2 text-sm transition-all ${
      isBlocked
        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
    }`}>
      <span className="text-base">🎯</span>
      <span className="font-medium">
        {isBlocked ? (
          <strong className="text-red-600 dark:text-red-400">
            {t('noAttemptsLeft')}
          </strong>
        ) : (
          <>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{attemptsLeft}</strong>{' '}
            {attemptsLeft === 1 ? t('attempt') : t('attempts')}{' '}
            {attemptsLeft === 1 ? t('remaining') : t('remainingPlural')}
            {isGuest && ` ${t('guestMode')}`}
          </>
        )}
      </span>
    </div>
  )
}

export default AttemptsCounter

