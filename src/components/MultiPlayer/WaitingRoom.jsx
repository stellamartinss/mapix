import { useState } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Componente WaitingRoom - Sala de espera antes do jogo começar
 * Mostra os jogadores que entraram e permite ao criador iniciar
 */

export const WaitingRoom = ({ room, players, isCreator, onStartGame, onLeave, loading }) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/multiplayer/${room.code}`;
    navigator.clipboard.writeText(roomLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-auto">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sala de Espera
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Código da Sala:</span>
            <code className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {room.code}
            </code>
            <button
              onClick={copyRoomCode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              onClick={copyRoomLink}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">Link copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar link da sala</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compartilhe o link ou código com seus amigos
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Jogadores ({players.length})
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {player.name}
                  </span>
                  {player.isCreator && (
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                      Criador
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {isCreator ? (
            <button
              onClick={onStartGame}
              disabled={loading || players.length < 2}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Iniciando...' : 'Iniciar Jogo'}
            </button>
          ) : (
            <div className="text-center py-3 text-gray-600 dark:text-gray-400">
              Aguardando o criador iniciar o jogo...
            </div>
          )}

          <button
            onClick={onLeave}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sair da Sala
          </button>
        </div>

        {players.length < 2 && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Aguardando mais jogadores para começar...
          </p>
        )}
      </div>
    </div>
  );
};

WaitingRoom.propTypes = {
  room: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  isCreator: PropTypes.bool.isRequired,
  onStartGame: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default WaitingRoom;