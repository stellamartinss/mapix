import PropTypes from 'prop-types'

function GuessHistory({ entries }) {
  const getFeedbackStyle = (score) => {
    if (score >= 4900) return { 
      emoji: '🎯', 
      text: 'Perfeito!',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-200 dark:bg-green-900',
      textColor: 'text-green-700 dark:text-green-300'
    };
    if (score >= 4500) return { 
      emoji: '🌟', 
      text: 'Excelente',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-200 dark:bg-green-900',
      textColor: 'text-green-700 dark:text-green-300'
    };
    if (score >= 4000) return { 
      emoji: '👏', 
      text: 'Muito bom',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-200 dark:bg-blue-900',
      textColor: 'text-blue-700 dark:text-blue-300'
    };
    if (score >= 3000) return { 
      emoji: '👍', 
      text: 'Bom',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-200 dark:bg-blue-900',
      textColor: 'text-blue-700 dark:text-blue-300'
    };
    if (score >= 2000) return { 
      emoji: '😐', 
      text: 'Razoável',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      badge: 'bg-yellow-200 dark:bg-yellow-900',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    };
    if (score >= 1000) return { 
      emoji: '😕', 
      text: 'Fraco',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800',
      badge: 'bg-orange-200 dark:bg-orange-900',
      textColor: 'text-orange-700 dark:text-orange-300'
    };
    return { 
      emoji: '😢', 
      text: 'Muito longe',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      badge: 'bg-red-200 dark:bg-red-900',
      textColor: 'text-red-700 dark:text-red-300'
    };
  };

  if (!entries.length) {
    return <p className="text-slate-500 dark:text-slate-400 text-sm">Ainda sem palpites. Faça um para ver o histórico.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      {entries.slice(0, 5).map((item, idx) => {
        const feedback = getFeedbackStyle(item.score);
        return (
          <div key={item.id} className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center p-2.5 px-3 border ${feedback.border} rounded-xl ${feedback.bg}`}>
            <div className={`font-bold text-xs text-slate-900 dark:text-slate-200 py-1.5 px-2.5 rounded-lg ${feedback.badge}`}>#{idx + 1}</div>
            <div className="flex flex-col gap-1">
              <p className="m-0 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                Distância: {item.distanceKm.toFixed(2)} km · Pontos: {item.score}
              </p>
              <p className={`m-0 text-xs font-medium ${feedback.textColor}`}>
                {feedback.emoji} {feedback.text}
              </p>
              <p className="m-0 text-slate-600 dark:text-slate-400 text-xs">
                Palpite: {item.guess.lat.toFixed(2)}, {item.guess.lng.toFixed(2)} · Real:{' '}
                {item.real.lat.toFixed(2)}, {item.real.lng.toFixed(2)}
              </p>
            </div>
            <span className="text-slate-600 dark:text-slate-400 text-xs">
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        );
      })}
    </div>
  )
}

GuessHistory.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      distanceKm: PropTypes.number.isRequired,
      score: PropTypes.number.isRequired,
      guess: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }).isRequired,
      real: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }).isRequired,
      createdAt: PropTypes.number.isRequired,
    }),
  ).isRequired,
}

export default GuessHistory

