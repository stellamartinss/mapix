const toRadians = (degrees) => (degrees * Math.PI) / 180

export const getRandomLatLng = () => {
  // Latitude limitada para evitar polos onde Street View costuma falhar
  const lat = (Math.random() * 170 - 85).toFixed(6)
  const lng = (Math.random() * 360 - 180).toFixed(6)
  return { lat: Number(lat), lng: Number(lng) }
}

export const haversineDistance = (from, to) => {
  const R = 6371 // raio da Terra em km
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calcula pontuação baseada na distância (Modo Clássico)
 * Nova fórmula: max(0, 5000 - (distância_km ^ 0.9))
 * - Pontuação máxima: 5000 pontos (distância = 0)
 * - Quanto maior a distância, menor a pontuação
 * - Mais generosa em longas distâncias comparado à fórmula exponencial
 * 
 * Exemplos:
 * - 0 km    → 5000 pontos
 * - 100 km  → 4900 pontos
 * - 1000 km → 4000 pontos
 * - 5000 km → 500 pontos
 */
export const calculateScore = (distanceKm) => {
  const maxScore = 5000
  // Nova fórmula: max(0, 5000 - (distância_km ^ 0.9))
  const score = maxScore - Math.pow(distanceKm, 0.9)
  return Math.max(0, Math.round(score)) // Garante que nunca seja negativo
}

