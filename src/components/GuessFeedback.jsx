import { useTranslation } from '../hooks/useTranslation';

function GuessFeedback({ distanceKm, score }) {
  const { t } = useTranslation();
  
  const getFeedback = (score) => {
    if (score >= 4900) return { text: t('perfect'), color: 'text-green-600 dark:text-green-400' };
    if (score >= 4500) return { text: t('excellent'), color: 'text-green-600 dark:text-green-400' };
    if (score >= 4000) return { text: t('veryGood'), color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 3000) return { text: t('good'), color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 2000) return { text: t('fair'), color: 'text-yellow-600 dark:text-yellow-400' };
    if (score >= 1000) return { text: t('weak'), color: 'text-orange-600 dark:text-orange-400' };
    return { text: t('veryFar'), color: 'text-red-600 dark:text-red-400' };
  };

  const feedback = distanceKm !== null ? getFeedback(score) : null;

  return (
    <div className='text-slate-900 dark:text-slate-100'>
      {distanceKm === null ? (
        <></>
      ) : (
        <div className='py-3 px-5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm'>
          <p className='text-slate-600 dark:text-slate-300'>
            {t('distanceBetweenPoints')}{' '}
            <strong>{distanceKm.toFixed(2)} km</strong> · {t('scoreLabel')}{' '}
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
