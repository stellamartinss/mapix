import { useAuth } from '../hooks/useAuth'

function PremiumBadge() {
  const { isPremium } = useAuth()

  if (!isPremium) return null

  return (
    <div className="premium-badge">
      <span className="premium-icon">⭐</span>
      <span className="premium-text">Premium</span>
    </div>
  )
}

export default PremiumBadge

