import { useAuth } from '../hooks/useAuth'

function PremiumBadge() {
  const { isPremium } = useAuth()

  if (!isPremium) return null

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 rounded-full text-white font-semibold text-sm shadow-lg shadow-amber-400/30 dark:shadow-amber-500/40">
      <span className="text-base">⭐</span>
      <span className="uppercase tracking-wide text-xs">Premium</span>
    </div>
  )
}

export default PremiumBadge

