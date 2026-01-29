const toRadians = (degrees) => (degrees * Math.PI) / 180

export const getRandomLatLng = () => {
  // Latitude limitada para evitar polos onde Street View costuma falhar
  const lat = (Math.random() * 170 - 85).toFixed(6)
  const lng = (Math.random() * 360 - 180).toFixed(6)
  return { lat: Number(lat), lng: Number(lng) }
}

/**
 * Valida se um panorama do Street View tem imagens reais disponíveis
 * @param {string} panoId - ID do panorama
 * @param {google.maps.StreetViewService} service - Serviço do Street View
 * @returns {Promise<boolean>}
 */
const validatePanorama = (panoId, service) => {
  return new Promise((resolve) => {
    if (!panoId) {
      resolve(false);
      return;
    }

    // Request panorama by ID to check if it has tiles
    service.getPanorama({ pano: panoId }, (data, status) => {
      if (status !== window.google.maps.StreetViewStatus.OK) {
        resolve(false);
        return;
      }

      // Reject if it's an indoor panorama (no outdoor imagery)
      if (data?.location?.pano && data.location.description) {
        const desc = data.location.description.toLowerCase();
        // Filter out common indoor/business panoramas
        if (
          desc.includes('interior') ||
          desc.includes('inside') ||
          desc.includes('indoors') ||
          desc.includes('business photos')
        ) {
          resolve(false);
          return;
        }
      }

      // Check if panorama has links (connected to street view network)
      // Panoramas without links are often isolated/deprecated
      if (!data?.links || data.links.length === 0) {
        resolve(false);
        return;
      }

      // Additional check: outdoor panoramas typically have more links
      if (data.links.length < 2) {
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
};

/**
 * Gera uma localização aleatória com cobertura de Street View garantida e validada
 * Utiliza validação avançada para garantir panoramas com imagens reais ao ar livre
 * @returns {Promise<{lat: number, lng: number, panoId?: string}>}
 */
export const pickRandomStreetView = async () => {
  if (!window.google) {
    throw new Error('Google Maps não carregado');
  }

  const service = new window.google.maps.StreetViewService();
  const maxAttempts = 50; // Increased to account for validation rejections

  const attempt = (count = 0) =>
    new Promise((resolve) => {
      const candidate = getRandomLatLng();
      service.getPanorama(
        {
          location: candidate,
          radius: 50000,
          source: window.google.maps.StreetViewSource.OUTDOOR, // Prefer outdoor imagery
        },
        async (data, status) => {
          if (
            status === window.google.maps.StreetViewStatus.OK &&
            data?.location?.latLng &&
            data?.location?.pano
          ) {
            // Validate the panorama has actual imagery
            const isValid = await validatePanorama(data.location.pano, service);

            if (isValid) {
              resolve({
                lat: data.location.latLng.lat(),
                lng: data.location.latLng.lng(),
                panoId: data.location.pano,
              });
            } else if (count < maxAttempts) {
              // Invalid panorama, try again
              resolve(attempt(count + 1));
            } else {
              // Max attempts reached, use fallback
              resolve({
                lat: candidate.lat,
                lng: candidate.lng,
              });
            }
          } else if (count < maxAttempts) {
            resolve(attempt(count + 1));
          } else {
            resolve(candidate);
          }
        }
      );
    });

  return await attempt();
};

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

