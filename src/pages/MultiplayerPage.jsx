import { useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { pickRandomStreetView } from '../utils/geo';
import Lobby from '../components/MultiPlayer/Lobby';
import Room from '../components/MultiPlayer/Room';
import WaitingRoom from '../components/MultiPlayer/WaitingRoom';
import { useEffect } from 'react';

/**
 * Página principal do modo multiplayer
 */
const MultiplayerPage = () => {
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
    startGame,
    submitGuess,
    leaveRoom,
    resetRoom,
    reconnectToRoom
  } = useRoom();

  useEffect(() => {
    // Se houver um código de sala na URL, tenta entrar nela automaticamente
    const tryJoinRoom = async () => {
      if (urlRoomCode) {
        const playerNameFromStorage = localStorage.getItem('playerId') || '';
        const playerName = playerNameFromStorage ? localStorage.getItem(`playerName_${playerNameFromStorage}`) : null;

        if (playerName) {
          await reconnectToRoom(urlRoomCode, playerName);
        } else {
          // Se não houver nome salvo, redireciona para o lobby
          navigate('/multiplayer', { replace: true });
        }
      }
    };

    tryJoinRoom();
  }, [urlRoomCode, reconnectToRoom, navigate]);

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
    try {
      console.log('Gerando localização com Street View...');
      const location = await pickRandomStreetView();
      console.log('Localização gerada:', location);
      await startGame(location);
    } catch (err) {
      console.error('Erro ao iniciar jogo:', err);
      alert('Erro ao gerar localização. Tente novamente.');
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

  // Handler para quando o usuário clica em "Voltar" no lobby
  const handleBackToHome = () => {
    // Limpa a URL se houver código
    if (urlRoomCode) {
      navigate('/multiplayer', { replace: true });
    }
  };

  // Se não está em nenhuma sala, mostra o lobby
  if (!room) {
    return (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
        error={error}
        initialRoomCode={urlRoomCode ? urlRoomCode.toUpperCase() : null}
        onBack={handleBackToHome}
      />
    );
  }

  // Se está aguardando jogadores
  if (room.status === 'waiting') {
    debugger
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
      isCreator={isCreator}
      onSubmitGuess={submitGuess}
      onLeave={handleLeaveRoom}
      onPlayAgain={resetRoom}
      loading={loading}
    />
  );
};

export default MultiplayerPage;
