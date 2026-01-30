import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import Lobby from '../components/MultiPlayer/Lobby';
import Room from '../components/MultiPlayer/Room';
import WaitingRoom from '../components/MultiPlayer/WaitingRoom';
import SettingsButton from '../components/SettingsButton';
import LanguageToggle from '../components/LanguageToggle';
import FloatingPanel from '../components/FloatingPanel';
import { useTranslation } from '../hooks/useTranslation';
import { pickRandomStreetView } from '../utils/geo';

export default function MultiplayerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams();

  const {
    room,
    loading,
    error,
    playerId,
    isCreator,
    hasGuessed,
    players,
    timeLeft,
    createRoom,
    joinRoom,
    submitGuess,
    leaveRoom,
    resetRoom,
    startGame,
    reconnectToRoom,
  } = useRoom();

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!urlRoomCode) return;

    const playerIdFromStorage = localStorage.getItem('playerId');
    const playerName = playerIdFromStorage
      ? localStorage.getItem(`playerName_${playerIdFromStorage}`)
      : null;

    if (!playerName) {
      navigate('/multiplayer', { replace: true });
      return;
    }

    reconnectToRoom(urlRoomCode, playerName);
  }, [urlRoomCode, reconnectToRoom, navigate]);

  const handleCreateRoom = useCallback(
    async (playerName, duration) => {
      localStorage.setItem(`playerName_${playerId}`, playerName);
      const roomCode = await createRoom(playerName, duration);
      navigate(`/multiplayer/${roomCode}`, { replace: true });
      return roomCode;
    },
    [createRoom, navigate, playerId],
  );

  const handleJoinRoom = useCallback(
    async (roomCode, playerName) => {
      localStorage.setItem(`playerName_${playerId}`, playerName);
      const normalizedCode = await joinRoom(roomCode, playerName);
      navigate(`/multiplayer/${normalizedCode}`, { replace: true });
      return normalizedCode;
    },
    [joinRoom, navigate, playerId],
  );

  const handleStartGame = useCallback(async () => {
    try {
      setIsStarting(true);
      console.log('Gerando localização com Street View...');
      const location = await pickRandomStreetView();
      await startGame(location);
    } catch (err) {
      console.error('Erro ao iniciar jogo:', err);
      alert('Erro ao gerar localização. Tente novamente.');
    } finally {
      setIsStarting(false);
    }
  }, [startGame]);

  const handleLeaveRoom = useCallback(async () => {
    await leaveRoom();
    navigate('/multiplayer', { replace: true });
  }, [leaveRoom, navigate]);

  const handleBackToHome = useCallback(() => {
    if (urlRoomCode) {
      navigate('/multiplayer', { replace: true });
    }
  }, [urlRoomCode, navigate]);

  const showSettings = !room || room.status === 'waiting';

  const content = useMemo(() => {
    if (!room) {
      return (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          loading={loading}
          error={error}
          initialRoomCode={urlRoomCode?.toUpperCase() ?? null}
          onBack={handleBackToHome}
        />
      );
    }

    if (room.status === 'waiting') {
      return (
        <WaitingRoom
          room={room}
          players={players}
          isCreator={isCreator}
          onStartGame={handleStartGame}
          onLeave={handleLeaveRoom}
          loading={loading || isStarting}
        />
      );
    }

    return (
      <Room
        room={room}
        players={players}
        playerId={playerId}
        timeLeft={timeLeft}
        hasGuessed={hasGuessed}
        isCreator={isCreator}
        onSubmitGuess={submitGuess}
        onLeave={handleLeaveRoom}
        onPlayAgain={resetRoom}
        loading={loading}
      />
    );
  }, [
    room,
    players,
    playerId,
    timeLeft,
    hasGuessed,
    isCreator,
    submitGuess,
    handleLeaveRoom,
    resetRoom,
    loading,
    handleCreateRoom,
    handleJoinRoom,
    error,
    urlRoomCode,
    handleBackToHome,
    handleStartGame,
    isStarting,
  ]);

  return (
    <>
      {showSettings && (
        <>
          <div className='game-info-bar_transparent'>
            <div className='game-info-left' />
            <div className='game-info-right'>
              <SettingsButton
                isSettingsVisible={isSettingsVisible}
                setIsSettingsVisible={setIsSettingsVisible}
              />
            </div>
          </div>

          <FloatingPanel
            isOpen={isSettingsVisible}
            onClose={() => setIsSettingsVisible(false)}
            position='top'
            title={t('settings') || 'Configurações'}
          >
            <div className='settings-panel-content'>
              <div className='setting-item'>
                <label>{t('language') || 'Idioma'}</label>
                <LanguageToggle />
              </div>
            </div>
          </FloatingPanel>
        </>
      )}

      {content}
    </>
  );
}
