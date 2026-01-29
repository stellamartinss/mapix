import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { getRandomLatLng } from '../utils/geo';
import Lobby, { WaitingRoom } from '../components/Lobby';
import Room from '../components/Room';

/**
 * Página principal do modo multiplayer
 */
const MultiplayerPage = () => {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams();
  const [reconnecting, setReconnecting] = useState(false);
  
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
    reconnectToRoom,
    startGame,
    submitGuess,
    leaveRoom
  } = useRoom();

  // Tenta reconectar automaticamente se houver um código na URL
  useEffect(() => {
    const attemptReconnect = async () => {
      if (urlRoomCode && !room && !reconnecting && !loading) {
        setReconnecting(true);
        
        try {
          // Tenta reconectar à sala
          const savedName = localStorage.getItem(`playerName_${playerId}`) || 'Jogador';
          await reconnectToRoom(urlRoomCode.toUpperCase(), savedName);
        } catch (err) {
          console.error('Erro ao reconectar:', err);
          // Se falhar, redireciona para o lobby (sem código na URL)
          navigate('/multiplayer', { replace: true });
        } finally {
          setReconnecting(false);
        }
      }
    };

    attemptReconnect();
  }, [urlRoomCode, room, reconnecting, loading, reconnectToRoom, navigate, playerId]);

  // Tenta reconectar automaticamente se houver um código na URL
  useEffect(() => {
    const attemptReconnect = async () => {
      if (urlRoomCode && !room && !reconnecting && !loading) {
        setReconnecting(true);
        
        try {
          // Tenta reconectar à sala
          const savedName = localStorage.getItem(`playerName_${playerId}`) || 'Jogador';
          await reconnectToRoom(urlRoomCode.toUpperCase(), savedName);
        } catch (err) {
          console.error('Erro ao reconectar:', err);
          // Se falhar, redireciona para o lobby (sem código na URL)
          navigate('/multiplayer', { replace: true });
        } finally {
          setReconnecting(false);
        }
      }
    };

    attemptReconnect();
  }, [urlRoomCode, room, reconnecting, loading, reconnectToRoom, navigate, playerId]);

  // Wrapper para createRoom que atualiza a URL
  const handleCreateRoom = async (playerName, duration) => {
    // Salva o nome do jogador
    localStorage.setItem(`playerName_${playerId}`, playerName);
    
    const roomCode = await createRoom(playerName, duration);
    
    // Atualiza a URL com o código da sala
    navigate(`/multiplayer/${roomCode}`, { replace: true });
    
    return roomCode;
  };

  // Wrapper para joinRoom que atualiza a URL
  const handleJoinRoom = async (roomCode, playerName) => {
    // Salva o nome do jogador
    localStorage.setItem(`playerName_${playerId}`, playerName);
    
    const normalizedCode = await joinRoom(roomCode, playerName);
    
    // Atualiza a URL com o código da sala
    navigate(`/multiplayer/${normalizedCode}`, { replace: true });
    
    return normalizedCode;
  };

  // Inicia o jogo quando o criador clica em "Iniciar"
  const handleStartGame = async () => {
    const location = getRandomLatLng();
    try {
      await startGame(location);
    } catch (err) {
      console.error('Erro ao iniciar jogo:', err);
    }
  };

  // Sai da sala e volta ao lobby
  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      // Remove o código da URL ao sair
      navigate('/multiplayer', { replace: true });
    } catch (err) {
      console.error('Erro ao sair da sala:', err);
    }
  };

  // Mostra loading durante reconexão
  if (reconnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
            Reconectando à sala...
          </p>
        </div>
      </div>
    );
  }

  // Se não está em nenhuma sala, mostra o lobby
  if (!room) {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
        error={error}
      />
    );
  }

  // Se está aguardando jogadores
  if (room.status === 'waiting') {
    return (
      <WaitingRoom
        room={room}
        players={players}
        isCreator={isCreator}
        onStartGame={handleStartGame}
        onLeave={handleLeaveRoom}
        loading={loading}
      />
    );
  }

  // Se está jogando ou terminou
  return (
    <Room
      room={room}
      players={players}
      playerId={playerId}
      timeLeft={timeLeft}
      hasGuessed={hasGuessed}
      onSubmitGuess={submitGuess}
      onLeave={handleLeaveRoom}
      loading={loading}
    />
  );
};

export default MultiplayerPage;
