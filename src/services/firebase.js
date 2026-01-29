import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';

// Configuração do Firebase
// Essas variáveis devem estar no arquivo .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================================
// FUNÇÕES DE SALA
// ========================================

/**
 * Gera um código de sala único (4-6 caracteres)
 */
export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Cria uma nova sala
 * @param {string} roomCode - Código da sala
 * @param {number} duration - Duração da rodada em segundos
 * @param {object} creator - Dados do criador { id, name }
 */
export const createRoom = async (roomCode, duration, creator) => {
  const roomRef = doc(db, 'rooms', roomCode);
  
  await setDoc(roomRef, {
    code: roomCode,
    status: 'waiting',
    createdAt: serverTimestamp(),
    duration: duration,
    players: {
      [creator.id]: {
        name: creator.name,
        isCreator: true,
        joinedAt: serverTimestamp()
      }
    }
  });

  return roomCode;
};

/**
 * Busca uma sala pelo código
 * @param {string} roomCode - Código da sala
 */
export const getRoom = async (roomCode) => {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    return null;
  }
  
  return { id: roomSnap.id, ...roomSnap.data() };
};

/**
 * Adiciona um jogador à sala
 * @param {string} roomCode - Código da sala
 * @param {object} player - Dados do jogador { id, name }
 */
export const joinRoom = async (roomCode, player) => {
  const roomRef = doc(db, 'rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Sala não encontrada');
  }

  const roomData = roomSnap.data();
  
  if (roomData.status !== 'waiting') {
    throw new Error('A sala já está em andamento');
  }

  await updateDoc(roomRef, {
    [`players.${player.id}`]: {
      name: player.name,
      isCreator: false,
      joinedAt: serverTimestamp()
    }
  });

  return roomCode;
};

/**
 * Inicia a rodada da sala
 * @param {string} roomCode - Código da sala
 * @param {object} location - Localização { lat, lng }
 */
export const startRoom = async (roomCode, location) => {
  const roomRef = doc(db, 'rooms', roomCode);
  
  await updateDoc(roomRef, {
    status: 'playing',
    location: location,
    startedAt: serverTimestamp()
  });
};

/**
 * Envia o palpite de um jogador
 * @param {string} roomCode - Código da sala
 * @param {string} playerId - ID do jogador
 * @param {object} guess - Palpite { lat, lng }
 */
export const submitGuess = async (roomCode, playerId, guess) => {
  const roomRef = doc(db, 'rooms', roomCode);
  
  await updateDoc(roomRef, {
    [`players.${playerId}.guess`]: guess,
    [`players.${playerId}.guessedAt`]: serverTimestamp()
  });
};

/**
 * Finaliza a rodada
 * @param {string} roomCode - Código da sala
 */
export const finishRoom = async (roomCode) => {
  const roomRef = doc(db, 'rooms', roomCode);
  
  await updateDoc(roomRef, {
    status: 'finished'
  });
};

/**
 * Remove um jogador da sala
 * @param {string} roomCode - Código da sala
 * @param {string} playerId - ID do jogador
 */
export const leaveRoom = async (roomCode, playerId) => {
  const roomRef = doc(db, 'rooms', roomCode);
  
  await updateDoc(roomRef, {
    [`players.${playerId}`]: deleteField()
  });
};

/**
 * Escuta mudanças em tempo real de uma sala
 * @param {string} roomCode - Código da sala
 * @param {function} callback - Função callback que recebe os dados da sala
 * @returns {function} - Função para cancelar o listener
 */
export const subscribeToRoom = (roomCode, callback) => {
  const roomRef = doc(db, 'rooms', roomCode);
  
  return onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};

export { db };
