import { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Users } from 'lucide-react';
import GuessMap from './GuessMap';
import StreetView from './StreetView';
import Timer from './Timer';
import MultiplayerResult from './MultiplayerResult';

/**
 * Componente Room - Gerencia a sala durante o jogo
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

  const handleMapClick = (position) => {
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

  const playersWhoGuessed = players.filter((p) => p.guess).length;
  const totalPlayers = players.length;

  return (
    <div className='h-full w-full flex flex-col bg-gray-900 overflow-hidden'>
      {/* Header com Timer e Info */}
      <div className='bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <code className='text-lg font-mono font-bold text-indigo-400'>
              {room.code}
            </code>
          </div>

          <div className='flex items-center gap-2 text-gray-300'>
            <Users className='w-5 h-5' />
            <span className='text-sm'>
              {playersWhoGuessed}/{totalPlayers} palpites
            </span>
          </div>
        </div>

        <Timer timeLeft={timeLeft} />

        <button
          onClick={onLeave}
          disabled={loading}
          className='px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50'
        >
          Sair
        </button>
      </div>
      {/* Área de jogo */}
      <div className='flex-1 flex overflow-hidden min-h-0'>
        {/* Street View - lado esquerdo */}
        <div className='w-1/2 h-full relative overflow-hidden'>
          <StreetView position={room.location} loading={!room.location} />

          {hasGuessed && (
            <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in'>
              <CheckCircle className='w-5 h-5' />
              <span className='font-medium'>Palpite enviado!</span>
            </div>
          )}
        </div>

        {/* Mapa de palpite - lado direito */}
        <div className='w-1/2 h-full relative overflow-hidden'>
          <GuessMap
            onGuess={handleMapClick}
            guessPosition={selectedPosition}
            disableInteraction={hasGuessed}
            disableConfirm={true}
          />

          {/* Botão de confirmar palpite */}
          {!hasGuessed && (
            <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10'>
              <button
                onClick={handleSubmitGuess}
                disabled={!selectedPosition || submitting}
                className='px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105'
              >
                {submitting ? 'Enviando...' : 'Confirmar Palpite'}
              </button>
            </div>
          )}

          {hasGuessed && (
            <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg'>
              <p className='text-center text-sm'>
                Aguardando outros jogadores...
              </p>
              <p className='text-center text-xs text-gray-400 mt-1'>
                {playersWhoGuessed}/{totalPlayers} jogadores
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de jogadores (sidebar minimizada) */}
      <div className='absolute top-20 right-4 bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs'>
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
    </div>
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
