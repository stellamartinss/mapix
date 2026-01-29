import { useState } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Componente Lobby - Tela inicial do modo multiplayer
 * Permite criar ou entrar em salas
 */
const Lobby = ({ onCreateRoom, onJoinRoom, loading, error }) => {
  const [mode, setMode] = useState(null); // 'create' | 'join' | null
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [duration, setDuration] = useState(120);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    try {
      await onCreateRoom(playerName.trim(), duration);
    } catch (err) {
      console.error('Erro ao criar sala:', err);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;

    try {
      await onJoinRoom(roomCode.trim(), playerName.trim());
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
    }
  };

  // Tela inicial - escolher modo
  if (!mode) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Users className="mx-auto h-16 w-16 text-indigo-600 dark:text-indigo-400" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Modo Multiplayer
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Jogue com seus amigos em tempo real
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center justify-center px-4 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
            >
              <Users className="mr-2 h-5 w-5" />
              Criar Sala
            </button>

            <button
              onClick={() => setMode('join')}
              className="w-full flex items-center justify-center px-4 py-4 border-2 border-indigo-600 dark:border-indigo-400 text-base font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
            >
              Entrar em Sala
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de criar sala
  if (mode === 'create') {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-auto">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <button
            onClick={() => setMode(null)}
            className="mb-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Voltar
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Criar Nova Sala
          </h2>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duração da Rodada
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={60}>1 minuto</option>
                <option value={120}>2 minutos</option>
                <option value={180}>3 minutos</option>
                <option value={300}>5 minutos</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !playerName.trim()}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Sala'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulário de entrar em sala
  if (mode === 'join') {
    return (
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-auto">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <button
            onClick={() => setMode(null)}
            className="mb-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Voltar
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Entrar em Sala
          </h2>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label htmlFor="joinPlayerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                id="joinPlayerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                maxLength={20}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código da Sala
              </label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                maxLength={6}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !playerName.trim() || !roomCode.trim()}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }
};

Lobby.propTypes = {
  onCreateRoom: PropTypes.func.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default Lobby;

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
