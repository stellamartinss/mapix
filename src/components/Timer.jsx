import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';

/**
 * Componente Timer - Exibe o tempo restante da rodada
 */
const Timer = ({ timeLeft }) => {
  const [isLowTime, setIsLowTime] = useState(false);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 30) {
      setIsLowTime(true);
    } else {
      setIsLowTime(false);
    }
  }, [timeLeft]);

  if (timeLeft === null) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-all ${
        isLowTime
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-gray-700 text-gray-100'
      }`}
    >
      <Clock className="w-5 h-5" />
      <span>{formattedTime}</span>
    </div>
  );
};

Timer.propTypes = {
  timeLeft: PropTypes.number
};

export default Timer;
