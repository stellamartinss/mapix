import { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Users } from 'lucide-react';
import GameplayView from '../GameplayView';
import MultiplayerResult from './MultiplayerResult';
import CountdownTimer from '../CountdownTimer';

/**
 * Componente Room - Gerencia a sala durante o jogo
 * Agora usa GameplayView para renderizar a UI de gameplay
 */
const Room = ({
  room,
  players,
  playerId,
  timeLeft,
  hasGuessed,
  isCreator,
  onSubmitGuess,
  onLeave,
  onPlayAgain,
  loading,
}) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [_, setTimerActive] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Se a sala terminou, mostra o resultado com mapa
  if (room.status === 'finished') {
    return (
      <MultiplayerResult
        room={room}
        players={players}
        playerId={playerId}
        isCreator={isCreator}
        onLeave={onLeave}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  const handleGuessChange = (position) => {
    if (hasGuessed) return;
    setSelectedPosition(position);
  };

  const handleSubmitGuess = async () => {
    if (!selectedPosition || hasGuessed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmitGuess(selectedPosition);
    } catch (err) {
      console.error('Erro ao enviar palpite:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeout = () => {
    setTimerActive(false);
    setHasTimedOut(true);
    // incrementRounds();
    // pause();
  };

  const playersWhoGuessed = players.filter((p) => p.guess).length;
  const totalPlayers = players.length;

  //  Custom timer component for multiplayer
  const customTimer = (
    <div className='timer-overlay'>
      <CountdownTimer
        key={room.location?.lat + '-' + room.location?.lng}
        duration={timeLeft}
        onTimeout={handleTimeout}
        isActive={true}
      />
    </div>
  );

  // Top bar left content - Room code and players info
  const topBarLeft = (
    <>
      <div className='game-info-item'>
        <code className='text-lg font-mono font-bold text-indigo-400'>
          {room.code}
        </code>
      </div>
      <div className='game-info-item'>
        <Users className='w-5 h-5' />
        <span className='text-sm'>
          {playersWhoGuessed}/{totalPlayers} palpites
        </span>
      </div>
    </>
  );

  // Top bar right content - Leave button
  const topBarRight = (
    <button
      onClick={onLeave}
      disabled={loading}
      className='px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50'
    >
      Sair
    </button>
  );

  // Additional content - Players list sidebar
  const additionalContent = (
    <>
      {hasGuessed && (
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50'>
          <CheckCircle className='w-5 h-5' />
          <span className='font-medium'>Palpite enviado!</span>
        </div>
      )}

      {hasGuessed && (
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg'>
          <p className='text-center text-sm'>Aguardando outros jogadores...</p>
          <p className='text-center text-xs text-gray-400 mt-1'>
            {playersWhoGuessed}/{totalPlayers} jogadores
          </p>
        </div>
      )}

      <div className='absolute top-20 right-4 bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs z-40'>
        <h3 className='text-sm font-semibold text-white mb-2'>Jogadores</h3>
        <div className='space-y-1'>
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between text-sm p-2 rounded ${
                player.id === playerId
                  ? 'bg-indigo-900/50 text-indigo-300'
                  : 'text-gray-300'
              }`}
            >
              <span className='truncate'>{player.name}</span>
              {player.guess && (
                <CheckCircle className='w-4 h-4 text-green-400 flex-shrink-0 ml-2' />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <GameplayView
      // Core game state
      realPosition={room.location}
      guessPosition={selectedPosition}
      onGuessChange={handleGuessChange}
      loading={!room.location}
      hasTimedOut={hasTimedOut}
      // Round state
      hasGuessed={hasGuessed}
      // Timer - using custom timer
      showTimer={false}
      customTimer={customTimer}
      // Actions
      onGuessConfirm={handleSubmitGuess}
      disableConfirm={!selectedPosition || submitting}
      disableInteraction={hasGuessed}
      // History - disabled for multiplayer
      showHistory={false}
      // Top bar
      topBarLeft={topBarLeft}
      topBarRight={topBarRight}
      showFeedbackInTopBar={false}
      // Settings - disabled for multiplayer (can be enabled if needed)
      showSettings={false}
      // Additional content
      additionalContent={additionalContent}
    />
  );
};

Room.propTypes = {
  room: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  playerId: PropTypes.string.isRequired,
  timeLeft: PropTypes.number,
  hasGuessed: PropTypes.bool.isRequired,
  isCreator: PropTypes.bool.isRequired,
  onSubmitGuess: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default Room;
