import { useState } from 'react';
import { Users } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Componente Lobby - Tela inicial do modo multiplayer
 * Permite criar ou entrar em salas
 */
function Lobby({
  onCreateRoom,
  onJoinRoom,
  loading,
  error,
  initialRoomCode = null,
  onBack = null,
}) {
  const { t } = useTranslation();

  const [mode, setMode] = useState(initialRoomCode ? 'join' : null); // 'create' | 'join' | null
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [duration, setDuration] = useState(120);

  const handleBackClick = () => {
    setMode(null);
    if (onBack) {
      onBack();
    }
  };

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
      <div className='h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-hidden'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <Users className='mx-auto h-16 w-16 text-indigo-600 dark:text-indigo-400' />
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900 dark:text-white'>
              {t('multiplayer_multiplayerMode')}
            </h2>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('multiplayer_description')}
            </p>
          </div>

          <div className='space-y-4'>
            <button
              onClick={() => setMode('create')}
              className='w-full flex items-center justify-center px-4 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors'
            >
              <Users className='mr-2 h-5 w-5' />
              {t('buttons_createRoom')}
            </button>

            <button
              onClick={() => setMode('join')}
              className='w-full flex items-center justify-center px-4 py-4 border-2 border-indigo-600 dark:border-indigo-400 text-base font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors'
            >
              {t('buttons_joinRoom')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de criar sala
  if (mode === 'create') {
    return (
      <div className='h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-auto'>
        <div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8'>
          <button
            onClick={handleBackClick}
            className='mb-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          >
            {t('buttons_back')}
          </button>

          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
            {t('buttons_createRoom')}
          </h2>

          <form onSubmit={handleCreateRoom} className='space-y-4'>
            <div>
              <label
                htmlFor='playerName'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                {t('labels_playerName')}
              </label>
              <input
                type='text'
                id='playerName'
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder='Digite seu nome'
                maxLength={20}
                required
                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              />
            </div>

            <div>
              <label
                htmlFor='duration'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                {t('labels_duration')}
              </label>
              <select
                id='duration'
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value={60}>{t('durationOptions_oneMinute')}</option>
                <option value={120}>{t('durationOptions_twoMinutes')}</option>
                <option value={180}>{t('durationOptions_threeMinutes')}</option>
                <option value={300}>{t('durationOptions_fiveMinutes')}</option>
              </select>
            </div>

            {error && (
              <div className='bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading || !playerName.trim()}
              className='w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {loading
                ? t('buttons_creating')
                : t('buttons_createRoom')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Formulário de entrar em sala
  if (mode === 'join') {
    return (
      <div className='h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-auto'>
        <div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8'>
          <button
            onClick={handleBackClick}
            className='mb-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          >
            {t('buttons_back')}
          </button>

          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
            {t('multiplayer_joinRoom')}
          </h2>

          <form onSubmit={handleJoinRoom} className='space-y-4'>
            <div>
              <label
                htmlFor='joinPlayerName'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                {t('labels_playerName')}
              </label>
              <input
                type='text'
                id='joinPlayerName'
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder='Digite seu nome'
                maxLength={20}
                required
                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              />
            </div>

            <div>
              <label
                htmlFor='roomCode'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                {t('labels_roomCode')}
              </label>
              <input
                type='text'
                id='roomCode'
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder='Ex: ABC123'
                maxLength={6}
                required
                disabled={!!initialRoomCode}
                className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase disabled:opacity-60 disabled:cursor-not-allowed'
              />
              {initialRoomCode && (
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  {t('hints_roomCodeFromLink')}
                </p>
              )}
            </div>

            {error && (
              <div className='bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading || !playerName.trim() || !roomCode.trim()}
              className='w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? t('buttons_entering') : t('buttons_joinRoom')}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

Lobby.propTypes = {
  onCreateRoom: PropTypes.func.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  initialRoomCode: PropTypes.string,
  onBack: PropTypes.func,
};

export default Lobby;
