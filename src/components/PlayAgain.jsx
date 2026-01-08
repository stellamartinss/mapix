import { useTranslation } from '../hooks/useTranslation';
import './styles/PlayAgain.css';

function PlayAgain({ onPlayAgain, disableConfirm }) {
  const { t } = useTranslation();
  
  return (
    <button
      type='button'
      onClick={onPlayAgain}
      disabled={disableConfirm}
      className='play-again-btn'
    >
      {t('playAgain')}
    </button>
  );
}

export default PlayAgain;
