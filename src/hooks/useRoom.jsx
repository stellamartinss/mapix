import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generateRoomCode,
  createRoom as createRoomService,
  getRoom as getRoomService,
  joinRoom as joinRoomService,
  startRoom as startRoomService,
  submitGuess as submitGuessService,
  finishRoom as finishRoomService,
  leaveRoom as leaveRoomService,
  resetRoom as resetRoomService,
  subscribeToRoom
} from '../services/firebase';

/**
 * Hook para gerenciar salas multiplayer
 * @returns {object} - Estado e métodos da sala
 */
export const useRoom = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerId] = useState(() => {
    // Gera ou recupera um ID único para o jogador
    let id = localStorage.getItem('playerId');
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playerId', id);
    }
    return id;
  });

  const unsubscribeRef = useRef(null);

  // Limpa o listener quando o componente desmonta
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  /**
   * Cria uma nova sala
   * @param {string} playerName - Nome do jogador criador
   * @param {number} duration - Duração da rodada em segundos
   */
  const createRoom = useCallback(async (playerName, duration = 120) => {
    setLoading(true);
    setError(null);

    try {
      const roomCode = generateRoomCode();
      await createRoomService(roomCode, duration, {
        id: playerId,
        name: playerName
      });

      // Inscrever-se para mudanças na sala
      unsubscribeRef.current = subscribeToRoom(roomCode, (roomData) => {
        setRoom(roomData);
      });

      return roomCode;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  /**
   * Entra em uma sala existente
   * @param {string} roomCode - Código da sala
   * @param {string} playerName - Nome do jogador
   */
  const joinRoom = useCallback(async (roomCode, playerName) => {
    setLoading(true);
    setError(null);

    try {
      // Verifica se a sala existe
      const roomData = await getRoomService(roomCode.toUpperCase());
      
      if (!roomData) {
        throw new Error('Sala não encontrada');
      }

      // Entra na sala
      await joinRoomService(roomCode.toUpperCase(), {
        id: playerId,
        name: playerName
      });

      // Inscrever-se para mudanças na sala
      unsubscribeRef.current = subscribeToRoom(roomCode.toUpperCase(), (roomData) => {
        setRoom(roomData);
      });

      return roomCode.toUpperCase();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  /**
   * Reconecta a uma sala existente (para casos de refresh/reconexão)
   * @param {string} roomCode - Código da sala
   * @param {string} playerName - Nome do jogador
   */
  const reconnectToRoom = useCallback(async (roomCode, playerName) => {
    setLoading(true);
    setError(null);

    try {
      // Verifica se a sala existe
      const roomData = await getRoomService(roomCode.toUpperCase());
      
      if (!roomData) {
        throw new Error('Sala não encontrada ou expirada');
      }

      // Verifica se o jogador já estava na sala
      const wasInRoom = roomData.players && roomData.players[playerId];

      if (wasInRoom) {
        // Se já estava, apenas reinscreve no listener
        console.log('Reconectando jogador existente à sala');
      } else {
        // Se não estava, verifica o status da sala
        if (roomData.status === 'waiting') {
          // Pode entrar se ainda está aguardando
          await joinRoomService(roomCode.toUpperCase(), {
            id: playerId,
            name: playerName
          });
        } else if (roomData.status === 'playing') {
          // Sala em andamento - pode assistir mas não jogar
          console.log('Sala em andamento, entrando como observador');
        } else if (roomData.status === 'finished') {
          // Sala finalizada - pode ver resultados
          console.log('Sala finalizada, visualizando resultados');
        }
      }

      // Inscrever-se para mudanças na sala
      unsubscribeRef.current = subscribeToRoom(roomCode.toUpperCase(), (roomData) => {
        setRoom(roomData);
      });

      return roomCode.toUpperCase();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  /**
   * Inicia a rodada (apenas criador)
   * @param {object} location - Localização { lat, lng }
   */
  const startGame = useCallback(async (location) => {
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      await startRoomService(room.code, location);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room]);

  /**
   * Envia o palpite do jogador
   * @param {object} guess - Palpite { lat, lng }
   */
  const submitGuess = useCallback(async (guess) => {
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      await submitGuessService(room.code, playerId, guess);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room, playerId]);

  /**
   * Finaliza a rodada
   */
  const finishGame = useCallback(async () => {
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      await finishRoomService(room.code);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room]);

  /**
   * Sai da sala
   */
  const leaveRoom = useCallback(async () => {
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      await leaveRoomService(room.code, playerId);
      
      // Cancela o listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      setRoom(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room, playerId]);

  /**
   * Reseta a sala para jogar novamente com os mesmos jogadores
   */
  const resetRoom = useCallback(async () => {
    if (!room) return;

    setLoading(true);
    setError(null);

    try {
      await resetRoomService(room.code);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [room]);

  /**
   * Verifica se o jogador atual é o criador da sala
   */
  const isCreator = room?.players?.[playerId]?.isCreator || false;

  /**
   * Retorna se o jogador já fez o palpite
   */
  const hasGuessed = !!room?.players?.[playerId]?.guess;

  /**
   * Retorna a lista de jogadores como array
   */
  const players = room?.players 
    ? Object.entries(room.players).map(([id, data]) => ({
        id,
        ...data
      }))
    : [];

  /**
   * Calcula o tempo restante em segundos
   */
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!room || room.status !== 'playing' || !room.startedAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const startedAt = room.startedAt.toMillis ? room.startedAt.toMillis() : room.startedAt;
      const elapsed = Math.floor((now - startedAt) / 1000);
      const remaining = Math.max(0, room.duration - elapsed);
      setTimeLeft(remaining);

      // Auto-finaliza quando o tempo acaba (apenas se ainda não finalizou)
      if (remaining === 0 && isCreator && room.status === 'playing') {
        finishGame();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [room, isCreator, finishGame]);

  return {
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
    finishGame,
    leaveRoom,
    resetRoom
  };
};
