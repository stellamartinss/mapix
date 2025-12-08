# Frontend Implementation - Sistema Freemium

## ✅ O que foi implementado

### 1. Nova Fórmula de Pontuação
- **Arquivo:** `src/utils/geo.js`
- **Fórmula:** `max(0, 5000 - (distância_km ^ 0.9))`
- Mais generosa em longas distâncias comparado à fórmula exponencial anterior

### 2. Sistema de Autenticação e Freemium
- **Hook:** `src/hooks/useAuth.js`
- Funciona em **modo demo** (localStorage) quando não há backend
- Suporta integração com backend quando disponível
- Gerencia:
  - Status premium
  - Tentativas diárias (3 por padrão)
  - Bloqueio quando limite atingido

### 3. Componentes Criados

#### `UpgradeModal` (`src/components/UpgradeModal.jsx`)
- Modal exibido quando limite de tentativas é atingido
- Lista benefícios do Premium
- Botão de upgrade que redireciona para Stripe Checkout

#### `PremiumBadge` (`src/components/PremiumBadge.jsx`)
- Badge ⭐ exibido no header quando usuário é Premium
- Auto-hide quando não premium

#### `AttemptsCounter` (`src/components/AttemptsCounter.jsx`)
- Contador de tentativas restantes
- Exibido no header apenas para usuários não-premium
- Mostra "Sem tentativas" quando bloqueado

### 4. Integração no App Principal

#### Modificações em `src/App.jsx`:
- Verifica tentativas antes de iniciar novo jogo
- Exibe modal de upgrade quando bloqueado
- Desabilita botão "Jogar novamente" quando sem tentativas
- Integra contador e badge no header

#### Modificações em `src/main.jsx`:
- Envolvido com `AuthProvider` para disponibilizar contexto de autenticação

### 5. Estilos CSS
- Estilos completos para modal de upgrade
- Badge premium com gradiente dourado
- Contador de tentativas responsivo
- Animações suaves de entrada

## 🎮 Como Funciona

### Modo Demo (Sem Backend)
1. Usuário inicia app
2. Sistema cria usuário "demo" automaticamente
3. Tentativas armazenadas no localStorage
4. Reset diário baseado na data (UTC)
5. Limite de 3 tentativas/dia

### Modo com Backend (Futuro)
1. Usuário faz login
2. Backend verifica tentativas no Redis/DB
3. API retorna status premium e tentativas restantes
4. Middleware bloqueia requisições quando necessário

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Obrigatório
VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui

# Opcional (para integração com backend)
VITE_API_URL=http://localhost:3000/api
```

### Estrutura de Dados no LocalStorage (Modo Demo)
```javascript
{
  "demo_attempts_left": "2",        // Tentativas restantes
  "demo_attempts_date": "2024-01-15" // Data da última verificação
}
```

## 🧪 Testando

### Testar Limite de Tentativas
1. Inicie o app
2. Jogue 3 vezes (ou diminua o limite no código para testar mais rápido)
3. Na 4ª tentativa, modal de upgrade deve aparecer
4. Verifique localStorage: `demo_attempts_left` deve estar em 0

### Testar Reset Diário
1. Edite `localStorage.setItem('demo_attempts_date', '2024-01-14')` no console
2. Recarregue a página
3. Tentativas devem resetar para 3

### Simular Premium
1. No console do navegador:
```javascript
localStorage.setItem('token', 'premium_demo_token')
// Ou edite useAuth.js temporariamente para setar isPremium = true
```

## 📊 Fluxo de Uso

```
1. Usuário abre app
   ↓
2. useAuth verifica status (localStorage ou API)
   ↓
3a. Se Premium → Jogos ilimitados
3b. Se Free → Verifica tentativas restantes
   ↓
4. Usuário clica "Jogar novamente"
   ↓
5a. Se tem tentativas → Consome 1 tentativa e inicia jogo
5b. Se sem tentativas → Exibe modal de upgrade
   ↓
6. Modal oferece upgrade
   ↓
7a. Usuário clica upgrade → Redireciona para Stripe
7b. Usuário fecha modal → Aguarda reset diário
```

## 🔌 Integração com Backend (Quando Disponível)

O hook `useAuth` está preparado para integrar com backend:

### Endpoints Esperados

```javascript
// Verificar status do usuário
GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: {
  user: { id, email, ... },
  isPremium: boolean,
  attemptsLeft: number,
  isBlocked: boolean
}

// Usar tentativa
POST /api/games/use-attempt
Headers: { Authorization: "Bearer {token}" }
Response: {
  success: boolean,
  attemptsLeft: number,
  blocked: boolean
}

// Criar checkout
POST /api/subscription/create-checkout
Headers: { Authorization: "Bearer {token}" }
Response: {
  checkoutUrl: string
}
```

## 🎨 Customização

### Alterar Limite de Tentativas
Edite em `src/hooks/useAuth.js`:
```javascript
// Linha ~40
localStorage.setItem('demo_attempts_left', '5') // Mudar de 3 para 5
```

### Alterar Preço do Premium
Edite em `src/components/UpgradeModal.jsx`:
```jsx
// Linha ~55
Upgrade por US$ 9,99/mês  // Mudar de 6,99
```

### Personalizar Benefícios
Edite a lista em `src/components/UpgradeModal.jsx`:
```jsx
<li>
  <span className="benefit-icon">🎁</span>
  <span>Seu benefício personalizado</span>
</li>
```

## 📝 Próximos Passos

1. **Backend Integration**: Conectar com API real quando backend estiver pronto
2. **Stripe Integration**: Configurar checkout real do Stripe
3. **Analytics**: Adicionar tracking de conversões
4. **A/B Testing**: Testar diferentes mensagens no modal
5. **Onboarding**: Tutorial para novos usuários

## 🐛 Troubleshooting

### Modal não aparece
- Verifique se `showUpgradeModal` está sendo setado
- Verifique se `isBlocked` está true no useAuth
- Verifique console para erros

### Tentativas não resetam
- Verifique formato da data no localStorage
- Certifique-se que está usando UTC corretamente
- Limpe localStorage e recarregue

### Premium não funciona
- Verifique se `isPremium` está sendo setado no useAuth
- No modo demo, edite temporariamente o código
- Verifique se token está sendo enviado corretamente (modo backend)

---

**Implementado em:** 2024  
**Versão:** 1.0  
**Status:** ✅ Funcional (modo demo)

