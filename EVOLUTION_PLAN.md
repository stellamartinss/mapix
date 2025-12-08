# 📋 Plano de Evolução Técnica - Mini GeoGuessr

**Versão do Documento:** 1.0  
**Data:** 2024  
**Autor:** Equipe de Desenvolvimento

---

## 📑 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Evolução](#arquitetura-de-evolução)
3. [Frente 1: Modo Clássico Freemium](#frente-1-modo-clássico-freemium)
4. [Frente 2: Modo Premium (Subscription)](#frente-2-modo-premium-subscription)
5. [Frente 3: Modo Bet Expandido](#frente-3-modo-bet-expandido)
6. [Modelagem de Dados Incremental](#modelagem-de-dados-incremental)
7. [Atualizações de Fluxo](#atualizações-de-fluxo)
8. [Exemplos de Código](#exemplos-de-código)
9. [Recomendações UX/UI](#recomendações-uxui)
10. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Visão Geral

Este documento descreve a evolução do Mini GeoGuessr de um jogo single-player para uma plataforma completa com:
- **Freemium Model**: Limite de tentativas + upgrade premium
- **Subscription Service**: Plano mensal com benefícios exclusivos
- **Multiplayer Bet System**: Apostas entre jogadores com sistema de coins

### Objetivos Principais
- Implementar monetização sem quebrar experiência atual
- Criar sistema escalável para múltiplos usuários
- Manter código existente funcional durante migração
- Garantir segurança e antifraude desde o início

---

## 🏗️ Arquitetura de Evolução

### Estratégia de Implementação

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Classic UI  │  │ Premium UI   │  │   Bet UI     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────┐
│         ▼                  ▼                  ▼         │
│              MIDDLEWARE LAYER (Express)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Auth Middleware  │  Rate Limit  │  Premium Check│  │
│  └──────────────────────────────────────────────────┘  │
└─────────┼──────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────┐
│                   BACKEND SERVICES                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   API    │  │  Stripe  │  │  Redis   │            │
│  │  Server  │  │  Webhook │  │  Cache   │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │             │             │                    │
│  ┌────▼─────────────▼─────────────▼────┐              │
│  │        DATABASE (PostgreSQL)         │              │
│  │  Users │ Subscriptions │ Games │ Coins│             │
│  └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Componentes Adicionados

1. **Backend API** (Node.js + Express + PostgreSQL)
2. **Autenticação** (JWT + OAuth)
3. **Cache Layer** (Redis para rate limiting)
4. **Payment Gateway** (Stripe + Webhooks)
5. **Real-time** (WebSockets para salas Bet)
6. **Analytics** (Tracking de uso e conversões)

### Princípios de Evolução

- ✅ **Backward Compatible**: Código existente continua funcionando
- ✅ **Feature Flags**: Ativar/desativar features por ambiente
- ✅ **Gradual Rollout**: Deploy incremental por região
- ✅ **Monitoring**: Logs e métricas desde o início

---

## 🎮 Frente 1: Modo Clássico Freemium

### Requisitos

- Limite de 3 tentativas gratuitas por dia (reseta à meia-noite UTC)
- Bloqueio após limite com modal de upgrade
- Nova fórmula de pontuação: `max(0, 5000 - (distância_km ^ 0.9))`
- Manter cálculo de distância Haversine atual

### Arquitetura

#### 1.1 Rate Limiting Strategy

**Opção A: Cache-Based (Recomendada para MVP)**
```javascript
// Redis Key: "daily_attempts:{userId}:{YYYY-MM-DD}"
// TTL: Expira à meia-noite do dia seguinte
```

**Opção B: Database Tracking**
```sql
-- Tabela game_attempts registra cada jogo
-- Contagem diária via query agregada
```

**Opção C: Híbrida (Melhor Performance)**
- Redis para contagem rápida
- Database para histórico e auditoria
- Sincronização assíncrona

#### 1.2 Implementação do Middleware

```javascript
// middleware/rateLimiter.js
const rateLimitMiddleware = async (req, res, next) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  const key = `daily_attempts:${userId}:${today}`;
  
  // Verificar cache Redis
  const attempts = await redis.get(key) || 0;
  
  if (attempts >= 3) {
    return res.status(429).json({
      error: 'DAILY_LIMIT_REACHED',
      resetTime: getMidnightUTC(),
      upgradeAvailable: true
    });
  }
  
  // Incrementar contador
  await redis.incr(key);
  const ttl = getSecondsUntilMidnight();
  await redis.expire(key, ttl);
  
  next();
};
```

#### 1.3 Atualização da Fórmula de Pontuação

```javascript
// utils/geo.js - ATUALIZAR
export const calculateScore = (distanceKm) => {
  // Nova fórmula: max(0, 5000 - (distância_km ^ 0.9))
  const score = Math.max(0, 5000 - Math.pow(distanceKm, 0.9));
  return Math.round(score);
};

// Comparação com fórmula anterior:
// 0 km    → 5000 pts (igual)
// 100 km  → 4900 pts (vs ~4800 antes)
// 1000 km → 4000 pts (vs ~3500 antes)
// 5000 km → 500 pts  (vs ~50 antes) - mais generosa em longas distâncias
```

#### 1.4 Integração Frontend

**Componente de Bloqueio:**
```jsx
// components/UpgradeModal.jsx
function UpgradeModal({ onClose, onUpgrade }) {
  return (
    <Modal>
      <h2>Limite Diário Atingido</h2>
      <p>Você já usou suas 3 tentativas gratuitas hoje.</p>
      <p>Faça upgrade para Premium e jogue ilimitado!</p>
      <Button onClick={onUpgrade}>Upgrade para Premium</Button>
      <Button variant="ghost" onClick={onClose}>Fechar</Button>
    </Modal>
  );
}
```

**Hook de Verificação:**
```javascript
// hooks/useDailyLimit.js
function useDailyLimit() {
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  useEffect(() => {
    checkDailyLimit().then(({ attempts, limit }) => {
      setAttemptsLeft(limit - attempts);
      setIsBlocked(attempts >= limit);
    });
  }, []);
  
  return { attemptsLeft, isBlocked };
}
```

### Fluxo de Usuário

```
1. Usuário tenta iniciar jogo
   ↓
2. Frontend verifica tentativas restantes (opcional - UX)
   ↓
3. Backend valida via middleware
   ↓
4a. Se < 3 tentativas → Inicia jogo normalmente
4b. Se >= 3 tentativas → Retorna 429 + abre modal
   ↓
5. Usuário escolhe: Upgrade ou Aguardar reset
```

### Considerações de Segurança

- ✅ Validação no backend (nunca confiar apenas no frontend)
- ✅ Rate limit por IP como fallback
- ✅ Logs de tentativas para auditoria
- ✅ Prevenção de bypass via múltiplas contas (device fingerprinting opcional)

---

## 🌟 Frente 2: Modo Premium (Subscription)

### Requisitos

- Assinatura mensal: US$ 6,99
- Acesso ilimitado ao modo clássico
- Benefícios: Estatísticas, Rankings, Modos temáticos, Salas privadas
- Downgrade automático ao cancelar/expirar

### Integração de Pagamento

#### 2.1 Escolha da Plataforma

**Opção A: Stripe (Recomendada)**
- ✅ Melhor para web e mobile web
- ✅ API robusta e bem documentada
- ✅ Suporte a múltiplos métodos
- ✅ Webhooks confiáveis
- ✅ Conformidade PCI automática

**Opção B: App Store / Play Store**
- ✅ Melhor para apps nativos
- ✅ Processo de pagamento nativo
- ✅ Menos taxas (mas 30% de comissão)
- ⚠️ Requer apps nativos separados

**Recomendação Híbrida:**
- Stripe para web
- In-App Purchases para apps nativos (React Native)
- Sincronização de status entre plataformas

#### 2.2 Modelagem de Dados

```sql
-- Tabela de Usuários (já existe, expandir)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- Novos campos
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, premium
  subscription_status VARCHAR(20), -- active, cancelled, expired
  trial_ends_at TIMESTAMP,
  premium_until TIMESTAMP
);

-- Tabela de Assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- active, cancelled, past_due, etc
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Eventos de Pagamento (Auditoria)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  event_type VARCHAR(50) NOT NULL, -- created, renewed, cancelled, failed
  stripe_event_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.3 Fluxo de Assinatura

```javascript
// Backend: routes/subscription.js

// 1. Criar Checkout Session (Stripe)
POST /api/subscription/create-checkout
{
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}

// 2. Webhook Handler (Stripe)
POST /api/webhooks/stripe
// Processa eventos: subscription.created, subscription.updated, invoice.paid

// 3. Verificar Status
GET /api/subscription/status
Response: {
  "tier": "premium",
  "status": "active",
  "expiresAt": "2024-02-01T00:00:00Z"
}
```

#### 2.4 Middleware de Verificação Premium

```javascript
// middleware/premiumCheck.js
const premiumMiddleware = async (req, res, next) => {
  const user = req.user;
  
  // Verificar cache primeiro
  const cached = await redis.get(`premium:${user.id}`);
  if (cached === 'true') return next();
  if (cached === 'false') {
    return res.status(403).json({
      error: 'PREMIUM_REQUIRED',
      message: 'Este recurso requer assinatura Premium'
    });
  }
  
  // Verificar no banco
  const subscription = await db.subscriptions.findOne({
    where: {
      user_id: user.id,
      status: 'active',
      current_period_end: { $gt: new Date() }
    }
  });
  
  const isPremium = !!subscription;
  
  // Cachear por 1 hora
  await redis.setex(`premium:${user.id}`, 3600, isPremium ? 'true' : 'false');
  
  if (!isPremium) {
    return res.status(403).json({
      error: 'PREMIUM_REQUIRED',
      upgradeUrl: '/upgrade'
    });
  }
  
  req.user.isPremium = true;
  next();
};
```

#### 2.5 Integração Frontend

```jsx
// hooks/usePremium.js
function usePremium() {
  const [isPremium, setIsPremium] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSubscriptionStatus().then(status => {
      setIsPremium(status.tier === 'premium' && status.status === 'active');
      setLoading(false);
    });
  }, []);
  
  const upgrade = async () => {
    const { url } = await createCheckoutSession();
    window.location.href = url; // Redireciona para Stripe Checkout
  };
  
  return { isPremium, loading, upgrade };
}

// components/PremiumBadge.jsx
function PremiumBadge() {
  const { isPremium } = usePremium();
  
  if (!isPremium) return null;
  
  return (
    <div className="premium-badge">
      <span>⭐ Premium</span>
    </div>
  );
}
```

#### 2.6 Benefícios Premium - Detalhamento

**Estatísticas Avançadas:**
```sql
CREATE TABLE user_statistics (
  user_id UUID REFERENCES users(id),
  total_games INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  average_distance DECIMAL(10, 2),
  best_score INT,
  best_distance DECIMAL(10, 2),
  countries_guessed TEXT[],
  accuracy_percentage DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Rankings:**
```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  score BIGINT NOT NULL,
  period VARCHAR(20), -- daily, weekly, monthly, all_time
  rank INT,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_period_score ON leaderboard(period, score DESC);
```

**Salas Privadas:**
```sql
CREATE TABLE private_rooms (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  code VARCHAR(6) UNIQUE, -- Código de acesso
  max_players INT DEFAULT 8,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fluxo de Upgrade/Downgrade

```
UPGRADE:
1. Usuário clica "Upgrade"
   ↓
2. Frontend → POST /api/subscription/create-checkout
   ↓
3. Backend cria Stripe Checkout Session
   ↓
4. Usuário redirecionado para Stripe
   ↓
5. Após pagamento → Webhook recebe subscription.created
   ↓
6. Backend atualiza users.subscription_tier = 'premium'
   ↓
7. Cache invalidado → Próxima requisição verifica premium
   ↓
8. Frontend atualiza UI (Premium badge, features desbloqueadas)

DOWNGRADE:
1. Usuário cancela assinatura (Stripe Dashboard ou App)
   ↓
2. Webhook recebe subscription.updated (cancel_at_period_end = true)
   ↓
3. Backend marca subscription.cancel_at_period_end = true
   ↓
4. No final do período → Webhook subscription.deleted
   ↓
5. Backend atualiza users.subscription_tier = 'free'
   ↓
6. Cache invalidado
   ↓
7. Usuário volta ao limite de 3 tentativas/dia
```

---

## 🎲 Frente 3: Modo Bet Expandido

### Requisitos

- 2+ jogadores por sala
- Apostas: R$ 1, 2 ou 3
- Todos veem mesma localização
- Vencedor = menor distância
- Prêmio: 80% vencedor, 20% banca
- Pagamento fictício (coins) por enquanto

### Arquitetura Multiplayer

#### 3.1 Escolha de Tecnologia Real-time

**Opção A: WebSockets (Socket.io) - Recomendada**
- ✅ Baixa latência
- ✅ Bidirecional
- ✅ Suporta rooms/salas
- ✅ Fallback automático (polling)

**Opção B: Server-Sent Events (SSE)**
- ✅ Mais simples
- ⚠️ Apenas server → client

**Opção C: Polling HTTP**
- ✅ Mais simples ainda
- ⚠️ Alta latência, não recomendado

#### 3.2 Modelagem de Dados

```sql
-- Salas de Aposta
CREATE TABLE bet_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL, -- Código da sala (ex: "ABC123")
  host_id UUID REFERENCES users(id),
  real_position_lat DECIMAL(10, 8),
  real_position_lng DECIMAL(11, 8),
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
  max_players INT DEFAULT 8,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP
);

-- Participantes da Sala
CREATE TABLE bet_room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES bet_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  bet_amount DECIMAL(5, 2) NOT NULL, -- 1.00, 2.00 ou 3.00
  guess_lat DECIMAL(10, 8),
  guess_lng DECIMAL(11, 8),
  distance_km DECIMAL(10, 2),
  position INT, -- Posição final (1 = vencedor)
  coins_won DECIMAL(10, 2) DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  guessed_at TIMESTAMP,
  UNIQUE(room_id, user_id)
);

-- Sistema de Coins
CREATE TABLE user_coins (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transações de Coins (Auditoria)
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL, -- Positivo = ganho, Negativo = gasto
  type VARCHAR(50), -- bet_win, bet_loss, purchase, bonus
  reference_id UUID, -- ID da sala/jogo relacionado
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.3 Lógica de Cálculo

```javascript
// services/betService.js

async function calculateBetResults(roomId) {
  const room = await db.bet_rooms.findById(roomId);
  const players = await db.bet_room_players.findAll({
    where: { room_id: roomId, guess_lat: { $ne: null } }
  });
  
  // Calcular distâncias
  const results = players.map(player => ({
    ...player,
    distance: haversineDistance(
      { lat: room.real_position_lat, lng: room.real_position_lng },
      { lat: player.guess_lat, lng: player.guess_lng }
    )
  }));
  
  // Ordenar por distância
  results.sort((a, b) => a.distance - b.distance);
  
  // Calcular prêmios
  const totalPot = players.reduce((sum, p) => sum + p.bet_amount, 0);
  const houseCut = totalPot * 0.2;
  const prizePool = totalPot * 0.8;
  
  // Vencedor recebe tudo (pode expandir para top 3 no futuro)
  const winner = results[0];
  const winnerPrize = prizePool;
  
  // Atualizar posições e prêmios
  await Promise.all(
    results.map((result, index) =>
      db.bet_room_players.update(result.id, {
        position: index + 1,
        distance_km: result.distance,
        coins_won: index === 0 ? winnerPrize : 0
      })
    )
  );
  
  // Distribuir coins
  await distributeCoins(winner.user_id, winnerPrize, roomId);
  await distributeCoins('HOUSE', houseCut, roomId); // Banca fictícia
  
  return {
    winner: winner,
    results: results,
    totalPot,
    houseCut,
    prizePool
  };
}

async function distributeCoins(userId, amount, referenceId) {
  await db.transaction(async (tx) => {
    // Atualizar saldo
    await db.user_coins.increment(userId, 'balance', amount, tx);
    
    // Registrar transação
    await db.coin_transactions.create({
      user_id: userId === 'HOUSE' ? null : userId,
      amount,
      type: userId === 'HOUSE' ? 'house_cut' : 'bet_win',
      reference_id: referenceId
    }, tx);
  });
}
```

#### 3.4 WebSocket Events

```javascript
// Backend: socketHandler.js

io.on('connection', (socket) => {
  // Entrar na sala
  socket.on('join-room', async ({ roomCode, userId, betAmount }) => {
    const room = await findOrCreateRoom(roomCode);
    
    // Validar apostas
    if (![1, 2, 3].includes(betAmount)) {
      socket.emit('error', { message: 'Aposta inválida' });
      return;
    }
    
    // Verificar saldo de coins
    const userCoins = await db.user_coins.findByUserId(userId);
    if (userCoins.balance < betAmount) {
      socket.emit('error', { message: 'Coins insuficientes' });
      return;
    }
    
    // Deduzir coins
    await deductCoins(userId, betAmount);
    
    // Adicionar jogador à sala
    await db.bet_room_players.create({
      room_id: room.id,
      user_id: userId,
      bet_amount: betAmount
    });
    
    socket.join(`room:${room.id}`);
    
    // Notificar todos na sala
    io.to(`room:${room.id}`).emit('player-joined', {
      userId,
      betAmount,
      playersCount: await getRoomPlayerCount(room.id)
    });
  });
  
  // Registrar palpite
  socket.on('submit-guess', async ({ roomCode, userId, lat, lng }) => {
    const room = await findRoomByCode(roomCode);
    const player = await db.bet_room_players.findOne({
      where: { room_id: room.id, user_id: userId }
    });
    
    if (!player) {
      socket.emit('error', { message: 'Jogador não encontrado na sala' });
      return;
    }
    
    // Atualizar palpite
    await db.bet_room_players.update(player.id, {
      guess_lat: lat,
      guess_lng: lng,
      guessed_at: new Date()
    });
    
    // Verificar se todos já fizeram palpite
    const allGuessed = await checkAllPlayersGuessed(room.id);
    
    io.to(`room:${room.id}`).emit('guess-submitted', {
      userId,
      allGuessed
    });
    
    // Se todos finalizaram, calcular resultados
    if (allGuessed) {
      const results = await calculateBetResults(room.id);
      io.to(`room:${room.id}`).emit('game-finished', results);
    }
  });
  
  // Sair da sala
  socket.on('leave-room', ({ roomCode, userId }) => {
    socket.leave(`room:${roomCode}`);
  });
});
```

#### 3.5 Frontend Integration

```jsx
// hooks/useBetRoom.js
function useBetRoom(roomCode) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myGuess, setMyGuess] = useState(null);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    const socket = io(API_URL);
    
    socket.on('player-joined', (data) => {
      setPlayers(prev => [...prev, data]);
    });
    
    socket.on('guess-submitted', ({ userId, allGuessed }) => {
      if (allGuessed) {
        // Todos terminaram, aguardar resultados
      }
    });
    
    socket.on('game-finished', (results) => {
      setResults(results);
    });
    
    return () => socket.disconnect();
  }, [roomCode]);
  
  const joinRoom = (betAmount) => {
    socket.emit('join-room', { roomCode, userId, betAmount });
  };
  
  const submitGuess = (lat, lng) => {
    socket.emit('submit-guess', { roomCode, userId, lat, lng });
    setMyGuess({ lat, lng });
  };
  
  return { room, players, myGuess, results, joinRoom, submitGuess };
}

// components/BetRoom.jsx
function BetRoom({ roomCode }) {
  const { players, results, joinRoom, submitGuess } = useBetRoom(roomCode);
  const [betAmount, setBetAmount] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  const handleJoin = () => {
    joinRoom(betAmount);
    setHasJoined(true);
  };
  
  if (!hasJoined) {
    return (
      <BetSelectionScreen
        onSelectBet={setBetAmount}
        onJoin={handleJoin}
      />
    );
  }
  
  if (results) {
    return <BetResultsScreen results={results} />;
  }
  
  return (
    <div>
      <PlayersList players={players} />
      <BetGuessMap
        onGuess={submitGuess}
        disabled={!players.find(p => p.userId === currentUserId)?.canGuess}
      />
    </div>
  );
}
```

### Prevenção de Fraude

#### 3.6 Estratégias Antifraude

```javascript
// middleware/betValidation.js

// 1. Validação de Coordenadas
function validateGuess(lat, lng) {
  // Verificar se coordenadas são válidas
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Coordenadas inválidas');
  }
  
  // Prevenir coordenadas óbvias (0,0, etc)
  if (lat === 0 && lng === 0) {
    throw new Error('Coordenadas suspeitas');
  }
}

// 2. Rate Limiting por Sala
const roomRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 1, // 1 palpite por minuto
  keyGenerator: (req) => `${req.user.id}:${req.body.roomCode}`
});

// 3. Validação de Tempo
function validateGuessTiming(room, player) {
  const now = new Date();
  const timeSinceStart = now - room.started_at;
  
  // Máximo 5 minutos para fazer palpite
  if (timeSinceStart > 5 * 60 * 1000) {
    throw new Error('Tempo esgotado');
  }
  
  // Mínimo 10 segundos (prevenir bots)
  if (timeSinceStart < 10 * 1000) {
    // Marcar como suspeito
    logSuspiciousActivity(player.user_id, 'too_fast');
  }
}

// 4. Detecção de Múltiplas Contas
async function detectMultipleAccounts(userId, ipAddress) {
  const recentRooms = await db.bet_room_players.findRecentByIP(ipAddress);
  
  if (recentRooms.length > 3) {
    // Possível criação de múltiplas contas
    await flagSuspiciousIP(ipAddress);
    throw new Error('Atividade suspeita detectada');
  }
}

// 5. Verificação de Coins
async function validateCoinBalance(userId, betAmount) {
  const coins = await db.user_coins.findByUserId(userId);
  
  if (coins.balance < betAmount) {
    throw new Error('Saldo insuficiente');
  }
  
  // Prevenir race condition com lock
  await db.transaction(async (tx) => {
    const lockedCoins = await db.user_coins.findByUserId(userId, {
      lock: 'FOR UPDATE',
      transaction: tx
    });
    
    if (lockedCoins.balance < betAmount) {
      throw new Error('Saldo insuficiente');
    }
  });
}
```

### Endpoints da API

```javascript
// routes/bet.js

// Criar/Entrar na sala
POST /api/bet/rooms
Body: { code?: string, betAmount: number }
Response: { roomCode: string, roomId: string }

// Listar salas públicas
GET /api/bet/rooms/public
Response: [{ roomCode, playersCount, totalPot, status }]

// Obter status da sala
GET /api/bet/rooms/:roomCode
Response: { room, players, status }

// Submeter palpite
POST /api/bet/rooms/:roomCode/guess
Body: { lat: number, lng: number }
Response: { success: boolean, allGuessed: boolean }

// Obter resultados
GET /api/bet/rooms/:roomCode/results
Response: { winner, results, prizes }

// Histórico de apostas do usuário
GET /api/bet/history
Response: [{ roomCode, betAmount, position, coinsWon, date }]
```

---

## 🗄️ Modelagem de Dados Incremental

### Schema Completo

```sql
-- ============================================
-- USUÁRIOS E AUTENTICAÇÃO
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255), -- Se usar auth próprio
  auth_provider VARCHAR(50), -- 'email', 'google', 'facebook'
  auth_provider_id VARCHAR(255),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_status VARCHAR(20),
  premium_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_status);

-- ============================================
-- ASSINATURAS E PAGAMENTOS
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  event_type VARCHAR(50) NOT NULL,
  stripe_event_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MODO CLÁSSICO - RATE LIMITING
-- ============================================

CREATE TABLE daily_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attempt_date DATE NOT NULL,
  attempts_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, attempt_date)
);

CREATE INDEX idx_daily_attempts_user_date ON daily_attempts(user_id, attempt_date);

-- ============================================
-- JOGOS E HISTÓRICO
-- ============================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type VARCHAR(20) NOT NULL, -- 'classic', 'bet'
  real_lat DECIMAL(10, 8) NOT NULL,
  real_lng DECIMAL(11, 8) NOT NULL,
  guess_lat DECIMAL(10, 8),
  guess_lng DECIMAL(11, 8),
  distance_km DECIMAL(10, 2),
  score INT,
  created_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);

CREATE INDEX idx_games_user_created ON games(user_id, created_at DESC);
CREATE INDEX idx_games_type ON games(game_type);

-- ============================================
-- ESTATÍSTICAS (PREMIUM)
-- ============================================

CREATE TABLE user_statistics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_games INT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  average_distance DECIMAL(10, 2),
  best_score INT,
  best_distance DECIMAL(10, 2),
  average_score DECIMAL(10, 2),
  countries_guessed TEXT[],
  accuracy_percentage DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- RANKINGS (PREMIUM)
-- ============================================

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score BIGINT NOT NULL,
  period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
  period_start DATE,
  rank INT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

CREATE INDEX idx_leaderboard_period_score ON leaderboard(period, period_start, score DESC);

-- ============================================
-- SALAS PRIVADAS (PREMIUM)
-- ============================================

CREATE TABLE private_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  code VARCHAR(6) UNIQUE NOT NULL,
  name VARCHAR(100),
  max_players INT DEFAULT 8,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MODO BET - SALAS
-- ============================================

CREATE TABLE bet_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id),
  real_position_lat DECIMAL(10, 8),
  real_position_lng DECIMAL(11, 8),
  status VARCHAR(20) DEFAULT 'waiting',
  max_players INT DEFAULT 8,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  finished_at TIMESTAMP
);

CREATE INDEX idx_bet_rooms_code ON bet_rooms(code);
CREATE INDEX idx_bet_rooms_status ON bet_rooms(status);

-- ============================================
-- MODO BET - JOGADORES
-- ============================================

CREATE TABLE bet_room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES bet_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  bet_amount DECIMAL(5, 2) NOT NULL,
  guess_lat DECIMAL(10, 8),
  guess_lng DECIMAL(11, 8),
  distance_km DECIMAL(10, 2),
  position INT,
  coins_won DECIMAL(10, 2) DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  guessed_at TIMESTAMP,
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_bet_room_players_room ON bet_room_players(room_id);
CREATE INDEX idx_bet_room_players_user ON bet_room_players(user_id);

-- ============================================
-- SISTEMA DE COINS
-- ============================================

CREATE TABLE user_coins (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coin_transactions_user ON coin_transactions(user_id, created_at DESC);

-- ============================================
-- AUDITORIA E SEGURANÇA
-- ============================================

CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_security_logs_user ON security_logs(user_id, created_at DESC);
```

### Migrations Strategy

```javascript
// migrations/001_create_base_tables.js
// migrations/002_add_subscriptions.js
// migrations/003_add_bet_system.js
// migrations/004_add_premium_features.js

// Usar ferramenta: node-pg-migrate ou Knex.js
```

---

## 🔄 Atualizações de Fluxo

### Fluxo Atual vs Novo

#### Modo Clássico - Antes
```
1. Usuário abre app
2. Street View aleatório carrega
3. Usuário faz palpite
4. Resultado exibido
5. "Jogar novamente" → Volta ao passo 2
```

#### Modo Clássico - Depois (Freemium)
```
1. Usuário abre app
   ↓
2. Sistema verifica tentativas diárias
   ↓
3a. Se < 3 tentativas → Continua normalmente
3b. Se >= 3 tentativas → Modal de bloqueio
   ↓
4. Usuário escolhe: Upgrade ou Aguardar
   ↓
5. Se upgrade → Redireciona para Stripe
   ↓
6. Após pagamento → Modo Premium ativado
   ↓
7. Jogo continua sem limites
```

#### Modo Bet - Novo Fluxo
```
1. Usuário seleciona "Modo Bet"
   ↓
2. Criar sala ou entrar com código
   ↓
3. Seleciona valor de aposta (R$1, 2 ou 3)
   ↓
4. Sistema valida saldo de coins
   ↓
5a. Se saldo insuficiente → Modal de compra de coins
5b. Se saldo OK → Deduz coins e entra na sala
   ↓
6. Aguarda outros jogadores (mínimo 2)
   ↓
7. Host inicia jogo → Street View compartilhado
   ↓
8. Cada jogador faz palpite (turno sequencial ou simultâneo)
   ↓
9. Sistema calcula distâncias quando todos terminam
   ↓
10. Vencedor recebe 80% do prêmio em coins
   ↓
11. Resultados exibidos para todos
```

### Adaptações Necessárias no Código Existente

#### App.jsx - Adicionar Verificação de Tentativas

```jsx
// src/App.jsx - MODIFICAÇÃO

function App() {
  const { isPremium, attemptsLeft, isBlocked } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleStartGame = async () => {
    // Verificar limite apenas se não for premium
    if (!isPremium && isBlocked) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Continuar fluxo normal
    await pickRandomStreetView();
  };
  
  return (
    <>
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => window.location.href = '/upgrade'}
        />
      )}
      {/* Resto do código */}
    </>
  );
}
```

#### utils/geo.js - Atualizar Fórmula

```javascript
// src/utils/geo.js - MODIFICAÇÃO

// MANTER cálculo de distância
export const haversineDistance = (from, to) => {
  // ... código existente (não mudar)
};

// ATUALIZAR fórmula de pontuação
export const calculateScore = (distanceKm) => {
  // Nova fórmula: max(0, 5000 - (distância_km ^ 0.9))
  const score = Math.max(0, 5000 - Math.pow(distanceKm, 0.9));
  return Math.round(score);
};
```

---

## 💻 Exemplos de Código

### Backend - Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── stripe.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Subscription.js
│   │   ├── BetRoom.js
│   │   └── Game.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   ├── premiumCheck.js
│   │   └── betValidation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── games.js
│   │   ├── subscription.js
│   │   └── bet.js
│   ├── services/
│   │   ├── betService.js
│   │   ├── coinService.js
│   │   └── subscriptionService.js
│   ├── websockets/
│   │   └── betRoomHandler.js
│   └── server.js
├── migrations/
└── package.json
```

### Backend - Server Principal

```javascript
// backend/src/server.js

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
});
app.use('/api/', globalLimiter);

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/bet', require('./routes/bet'));
app.use('/api/webhooks', require('./routes/webhooks'));

// WebSocket
io.on('connection', (socket) => {
  require('./websockets/betRoomHandler')(socket, io);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Backend - Route de Games

```javascript
// backend/src/routes/games.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { rateLimitMiddleware } = require('../middleware/rateLimiter');
const { haversineDistance, calculateScore } = require('../services/geoService');
const Game = require('../models/Game');

// Iniciar novo jogo
router.post('/start', authenticate, rateLimitMiddleware, async (req, res) => {
  try {
    const { realLat, realLng } = req.body;
    
    // Criar registro do jogo
    const game = await Game.create({
      user_id: req.user.id,
      game_type: 'classic',
      real_lat: realLat,
      real_lng: realLng,
      status: 'started'
    });
    
    res.json({ gameId: game.id, realPosition: { lat: realLat, lng: realLng } });
  } catch (error) {
    if (error.code === 'DAILY_LIMIT_REACHED') {
      return res.status(429).json({ error: 'DAILY_LIMIT_REACHED' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Submeter palpite
router.post('/:gameId/guess', authenticate, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { guessLat, guessLng } = req.body;
    
    const game = await Game.findById(gameId);
    if (!game || game.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Calcular distância
    const distance = haversineDistance(
      { lat: game.real_lat, lng: game.real_lng },
      { lat: guessLat, lng: guessLng }
    );
    
    // Calcular pontuação
    const score = calculateScore(distance);
    
    // Atualizar jogo
    await game.update({
      guess_lat: guessLat,
      guess_lng: guessLng,
      distance_km: distance,
      score: score,
      finished_at: new Date()
    });
    
    // Atualizar estatísticas do usuário
    await updateUserStatistics(req.user.id, distance, score);
    
    res.json({ distance, score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Frontend - Hook de Autenticação

```javascript
// src/hooks/useAuth.js

import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsPremium(data.isPremium);
        setAttemptsLeft(data.attemptsLeft);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      await checkAuth();
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsPremium(false);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isPremium,
      attemptsLeft,
      loading,
      login,
      logout,
      refresh: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Frontend - Componente de Upgrade Modal

```jsx
// src/components/UpgradeModal.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

function UpgradeModal({ onClose }) {
  const { upgrade } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await fetch('/api/subscription/create-checkout', {
        method: 'POST'
      }).then(r => r.json());
      
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Upgrade failed:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Limite Diário Atingido</h2>
        <p>Você já usou suas 3 tentativas gratuitas hoje.</p>
        <p>Faça upgrade para Premium e jogue ilimitado!</p>
        
        <div className="premium-benefits">
          <h3>Benefícios Premium:</h3>
          <ul>
            <li>✨ Jogos ilimitados</li>
            <li>📊 Estatísticas avançadas</li>
            <li>🏆 Rankings e competições</li>
            <li>🎮 Modos temáticos exclusivos</li>
            <li>🔒 Salas privadas</li>
          </ul>
        </div>
        
        <div className="modal-actions">
          <button
            className="primary"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Upgrade por US$ 6,99/mês'}
          </button>
          <button className="ghost" onClick={onClose}>
            Talvez depois
          </button>
        </div>
        
        <p className="hint">
          Reseta às 00:00 UTC ({new Date().toLocaleTimeString()})
        </p>
      </div>
    </div>
  );
}

export default UpgradeModal;
```

---

## 🎨 Recomendações UX/UI

### Adaptações na Interface Existente

#### 1. Header - Adicionar Indicadores

```jsx
// Componente Header atualizado
<header className="header">
  <div>
    <p className="eyebrow">Mini GeoGuessr</p>
    <h1>Encontre onde o Street View está</h1>
  </div>
  <div className="header-actions">
    {!isPremium && attemptsLeft !== null && (
      <div className="attempts-counter">
        <span>{attemptsLeft} tentativas restantes hoje</span>
      </div>
    )}
    {isPremium && <PremiumBadge />}
    <ModeSelector />
    <button onClick={handlePlayAgain}>Jogar novamente</button>
  </div>
</header>
```

#### 2. Modal de Bloqueio - Design Sugerido

```css
/* Estilos para modal de upgrade */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.premium-benefits ul {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.premium-benefits li {
  padding: 8px 0;
  color: #475569;
}
```

#### 3. Integração do Modo Bet na UI

```jsx
// Adaptar ModeSelector para incluir Bet
<ModeSelector>
  <ModeButton value="classic" icon="🎯">Clássico</ModeButton>
  <ModeButton value="premium" icon="⭐">Premium</ModeButton>
  <ModeButton value="bet" icon="💰">Apostas</ModeButton>
</ModeSelector>

// Tela de criação de sala Bet
<BetRoomCreator>
  <Input placeholder="Código da sala (opcional)" />
  <BetAmountSelector>
    <BetButton amount={1}>R$ 1</BetButton>
    <BetButton amount={2}>R$ 2</BetButton>
    <BetButton amount={3}>R$ 3</BetButton>
  </BetAmountSelector>
  <CoinsDisplay balance={userCoins} />
  <Button onClick={createRoom}>Criar Sala</Button>
</BetRoomCreator>
```

#### 4. Indicadores Visuais Sugeridos

- **Contador de tentativas**: Badge no header
- **Status Premium**: Ícone ⭐ + badge
- **Saldo de Coins**: Topo direito, próximo ao perfil
- **Progresso em sala Bet**: Barra lateral mostrando jogadores
- **Resultados Bet**: Tabela destacando vencedor

### Responsividade

- Mobile: Modal full-screen, botões maiores
- Tablet: Layout adaptado, mais espaço para tabelas
- Desktop: Sidebar com informações adicionais

---

## ✅ Melhores Práticas

### Performance

#### 1. Cache Strategy
```javascript
// Redis para dados frequentemente acessados
- Tentativas diárias: TTL = até meia-noite
- Status Premium: TTL = 1 hora
- Leaderboards: TTL = 5 minutos
- Salas Bet ativas: TTL = tempo da sala

// Invalidação inteligente
- Ao fazer upgrade → Invalidar cache premium
- Ao completar jogo → Invalidar leaderboard
- Ao entrar/sair sala → Invalidar lista de salas
```

#### 2. Database Optimization
```sql
-- Índices estratégicos
CREATE INDEX CONCURRENTLY idx_games_user_date 
  ON games(user_id, created_at DESC) 
  WHERE game_type = 'classic';

-- Particionamento de tabelas grandes
CREATE TABLE games_2024_01 PARTITION OF games
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### 3. Lazy Loading
```jsx
// Carregar componentes pesados apenas quando necessário
const BetRoom = lazy(() => import('./components/BetRoom'));
const PremiumStats = lazy(() => import('./components/PremiumStats'));
```

### Segurança

#### 1. Validação em Múltiplas Camadas
```javascript
// Frontend: UX e feedback imediato
// Backend: Validação real (nunca confiar no frontend)
// Database: Constraints e triggers
```

#### 2. Prevenção de Fraude - Checklist
- ✅ Rate limiting por IP e por usuário
- ✅ Validação de coordenadas (não aceitar 0,0, etc)
- ✅ Detecção de velocidade suspeita (palpites muito rápidos)
- ✅ Limite de salas por IP/hora
- ✅ Auditoria de transações de coins
- ✅ Verificação de múltiplas contas (device fingerprinting)
- ✅ Sanitização de inputs
- ✅ HTTPS obrigatório
- ✅ CSRF tokens
- ✅ JWT com expiração curta + refresh tokens

#### 3. Proteção de Dados
```javascript
// Não armazenar informações sensíveis
// Criptografar PII quando necessário
// LGPD/GDPR compliance
// Logs sem dados pessoais
```

### Experiência Premium

#### 1. Onboarding
```jsx
// Tutorial interativo para novos usuários Premium
<TutorialFlow>
  <Step title="Estatísticas Avançadas" />
  <Step title="Rankings e Competições" />
  <Step title="Salas Privadas" />
</TutorialFlow>
```

#### 2. Valor Percebido
- Dashboard de estatísticas visualmente rico
- Badges e conquistas
- Notificações de novos recursos
- Comunidade exclusiva (opcional)

#### 3. Retenção
- Lembretes antes do vencimento da assinatura
- Ofertas de desconto para renovação
- Feedback sobre uso dos recursos Premium

### Monetização

#### 1. Estratégia de Preços
- **Freemium**: 3 tentativas/dia (hook inicial)
- **Premium**: US$ 6,99/mês (valor padrão)
- **Anual**: US$ 59,99/ano (desconto de ~28%)
- **Coins**: Pacotes opcionais para modo Bet

#### 2. Pontos de Conversão
- Modal após 3ª tentativa
- Banner no histórico de jogos
- CTA após bom desempenho
- Promoção em datas especiais

#### 3. Métricas a Monitorar
- Taxa de conversão (free → premium)
- Churn rate (cancelamentos)
- Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)
- Retention rate (30, 60, 90 dias)

### Escalabilidade

#### 1. Arquitetura
```
- Load Balancer → Múltiplos servidores
- Database: Read replicas + Connection pooling
- Redis Cluster para cache distribuído
- CDN para assets estáticos
- WebSocket: Redis adapter para múltiplos servidores
```

#### 2. Monitoring
```javascript
// Métricas essenciais
- Tempo de resposta das APIs
- Taxa de erro
- Uso de CPU/Memória
- Conexões WebSocket ativas
- Queries lentas no DB
- Taxa de conversão em tempo real
```

#### 3. Backup e Disaster Recovery
- Backup automático do banco (diário)
- Replicação em múltiplas regiões
- Plano de rollback para deploys
- Testes de carga regulares

---

## 📊 Roadmap de Implementação

### Fase 1: Fundação (Semanas 1-2)
- ✅ Setup backend (Node.js + Express + PostgreSQL)
- ✅ Autenticação básica (JWT)
- ✅ Rate limiting (Redis)
- ✅ Migrations do banco de dados

### Fase 2: Freemium (Semanas 3-4)
- ✅ Implementar limite de 3 tentativas/dia
- ✅ Modal de upgrade
- ✅ Atualizar fórmula de pontuação
- ✅ Testes de integração

### Fase 3: Premium (Semanas 5-7)
- ✅ Integração Stripe
- ✅ Webhooks de pagamento
- ✅ Middleware de verificação Premium
- ✅ Features Premium (estatísticas, rankings)
- ✅ Testes de pagamento

### Fase 4: Modo Bet (Semanas 8-10)
- ✅ Sistema de salas
- ✅ WebSockets para real-time
- ✅ Sistema de coins
- ✅ Lógica de cálculo de prêmios
- ✅ UI de salas e resultados
- ✅ Testes de carga

### Fase 5: Polish e Launch (Semanas 11-12)
- ✅ Testes end-to-end
- ✅ Otimizações de performance
- ✅ Documentação
- ✅ Deploy em produção
- ✅ Monitoramento e ajustes

---

## 📝 Conclusão

Este documento apresenta uma arquitetura completa para evoluir o Mini GeoGuessr de um jogo simples para uma plataforma completa com monetização e multiplayer.

### Principais Decisões
1. **Stripe** para pagamentos (melhor para web)
2. **Redis** para rate limiting (performance)
3. **WebSockets** para modo Bet (baixa latência)
4. **PostgreSQL** para dados (relacionamentos complexos)

### Próximos Passos
1. Revisar e aprovar arquitetura
2. Setup do ambiente de desenvolvimento
3. Implementar Fase 1 (Fundação)
4. Iterar baseado em feedback

---

**Documento mantido por:** Equipe de Desenvolvimento  
**Última atualização:** 2024  
**Versão:** 1.0

