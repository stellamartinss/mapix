import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '../hooks/useTranslation';
import './styles/OnboardingTypewriter.css';

function OnboardingTypewriter({ onComplete }) {
  const { t } = useTranslation();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showCTA, setShowCTA] = useState(false);

  // Mensagens do onboarding usando useMemo para evitar re-criação
  const messages = useMemo(() => [
    t('onboarding1'),
    t('onboarding2'),
    t('onboarding3'),
    t('onboarding4'),
    t('onboarding5'),
    t('onboarding6'),
    t('onboarding7'),
    t('onboarding8'),
    t('onboarding9'),
    t('onboarding10'),
    t('onboarding11'),
    t('onboarding12'),
    t('onboarding13'),
  ], [t]);

  // Configurações de timing
  const TYPING_SPEED = 50; // ms por caractere
  const MESSAGE_DELAY = 1000; // ms entre mensagens
  const CURSOR_BLINK_SPEED = 530; // ms para piscar o cursor

  // Efeito de piscar do cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, CURSOR_BLINK_SPEED);

    return () => clearInterval(cursorInterval);
  }, [CURSOR_BLINK_SPEED]);

  // Efeito de digitação
  useEffect(() => {
    if (currentMessageIndex >= messages.length) {
      // Todas as mensagens foram exibidas
      setTimeout(() => {
        setShowCTA(true);
      }, 500);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    let charIndex = 0;

    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.substring(0, charIndex + 1));
        charIndex++;
      } else {
        // Mensagem completa
        clearInterval(typingInterval);

        // Aguardar antes da próxima mensagem
        setTimeout(() => {
          setCurrentMessageIndex((prev) => prev + 1);
        }, MESSAGE_DELAY);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex, messages, TYPING_SPEED, MESSAGE_DELAY]);

  const handleCTAClick = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className='onboarding-container'>
      <div className='onboarding-text'>
         <>
            {displayedText}
            {showCursor && <span className='onboarding-cursor'>|</span>}
          </>
      </div>
    </div>
  );
}

OnboardingTypewriter.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default OnboardingTypewriter;
