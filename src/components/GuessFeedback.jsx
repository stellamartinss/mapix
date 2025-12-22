function GuessFeedback({ distanceKm, score }) {
  const getFeedback = (score) => {
    if (score >= 4900) return { text: '🎯 Perfeito! Você acertou na mosca!', color: 'text-green-600 dark:text-green-400' };
    if (score >= 4500) return { text: '🌟 Excelente! Muito próximo!', color: 'text-green-600 dark:text-green-400' };
    if (score >= 4000) return { text: '👏 Muito bom! Bom trabalho!', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 3000) return { text: '👍 Bom! Você está no caminho certo!', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 2000) return { text: '😐 Razoável. Pode melhorar!', color: 'text-yellow-600 dark:text-yellow-400' };
    if (score >= 1000) return { text: '😕 Fraco. Tente se aproximar mais!', color: 'text-orange-600 dark:text-orange-400' };
    return { text: '😢 Muito longe! Tente novamente!', color: 'text-red-600 dark:text-red-400' };
  };

  const feedback = distanceKm !== null ? getFeedback(score) : null;

  return (
    <div className='text-slate-900 dark:text-slate-100'>
      {distanceKm === null ? (
        <></>
      ) : (
        <div className='py-3 px-5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm'>
          <p className='text-slate-600 dark:text-slate-300'>
            Distância entre os pontos:{' '}
            <strong>{distanceKm.toFixed(2)} km</strong> · Pontuação:{' '}
            <strong>{score}</strong>
          </p>
          {feedback && (
            <p className={`mt-2 font-semibold ${feedback.color}`}>
              {feedback.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default GuessFeedback;
