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

export const calculateScore = (distanceKm) => {
  const maxScore = 5000
  const decay = 0.0015
  return Math.round(maxScore * Math.exp(-decay * distanceKm))
}

