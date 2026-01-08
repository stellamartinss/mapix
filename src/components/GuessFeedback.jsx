import { useTranslation } from '../hooks/useTranslation';
import './styles/GuessFeedback.css';

function GuessFeedback({ distanceKm, score }) {
  const { t } = useTranslation();
  
  const getFeedback = (score) => {
    if (score >= 4900) return { text: t('perfect'), color: 'feedback-green' };
    if (score >= 4500) return { text: t('excellent'), color: 'feedback-green' };
    if (score >= 4000) return { text: t('veryGood'), color: 'feedback-blue' };
    if (score >= 3000) return { text: t('good'), color: 'feedback-blue' };
    if (score >= 2000) return { text: t('fair'), color: 'feedback-yellow' };
    if (score >= 1000) return { text: t('weak'), color: 'feedback-orange' };
    return { text: t('veryFar'), color: 'feedback-red' };
  };

  const feedback = distanceKm !== null ? getFeedback(score) : null;

  return (
    <div className='guess-feedback-container'>
      {distanceKm === null ? (
        <></>
      ) : (
        <div className='guess-feedback-content'>
          <p className='guess-feedback-stats'>
            <span className='guess-feedback-label'>{t('distanceBetweenPoints')}</span>{' '}
            <strong className='guess-feedback-value'>{distanceKm.toFixed(2)} km</strong>
            <span className='guess-feedback-separator'>·</span>
            <span className='guess-feedback-label'>{t('scoreLabel')}</span>{' '}
            <strong className='guess-feedback-value'>{score}</strong>
          </p>
          {feedback && (
            <p className={`guess-feedback-message ${feedback.color}`}>
              {feedback.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default GuessFeedback;
