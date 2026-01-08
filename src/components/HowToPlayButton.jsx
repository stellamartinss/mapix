import { useTranslation } from '../hooks/useTranslation';

export default function HowToPlayButton({
  setIsHowToPlayVisible,
  isHowToPlayVisible,
}) {
  const {t} = useTranslation();
  return (
    <button
      className='how-to-play-btn'
      onClick={() => setIsHowToPlayVisible(!isHowToPlayVisible)}
      aria-label={t('howToPlayTitle') || 'Como Jogar'}
      title={t('howToPlayTitle') || 'Como Jogar'}
    >
      ❓
    </button>
  );
}
