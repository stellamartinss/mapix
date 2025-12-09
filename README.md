# Mapix🗺️

Um jogo de geografia estilo GeoGuessr desenvolvido em React, com duas modalidades: **Clássico** e **Aposta (Bet Mode)**.

## 🎮 Funcionalidades

### Modo Clássico
- Street View aleatório de qualquer lugar do mundo
- Palpite clicando no mapa mundial
- Cálculo de distância usando fórmula de Haversine
- Pontuação baseada em decaimento exponencial (máximo 5000 pontos)
- Histórico dos últimos 5 palpites
- Linha conectando palpite e local real

### Modo Aposta 💰
- Suporte para 2-8 jogadores
- Cada jogador aposta R$ 1, R$ 2 ou R$ 3
- Todos veem o mesmo Street View
- Jogadores fazem palpites em sequência
- O mais próximo ganha 80% do prêmio total
- Banca fica com 20% do prêmio
- Tabela de resultados completa
- Linhas conectando todos os palpites ao local real

**Exemplos de pontuação:**
- 0 km → 5000 pontos
- 400 km → ~2500 pontos
- 1800 km → ~500 pontos
- 5000+ km → próximo de 0 pontos

### Cálculo de Prêmio (Modo Aposta)
```javascript
totalBet = soma de todas as apostas
prêmio = totalBet * 0.8  // Vencedor recebe 80%
banca = totalBet * 0.2   // Banca recebe 20%
```

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 16+
- Conta Google Cloud com Maps JavaScript API habilitada

### Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz:
```env
VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

4. Execute o projeto:
```bash
npm run dev
```

### Como Obter a Chave do Google Maps

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Maps JavaScript API** e **Street View Static API**
4. Crie credenciais (API Key)
5. Configure restrições de referrer (opcional, mas recomendado para produção)

## 🎯 Fluxo do Jogo

### Modo Clássico
1. App carrega Street View aleatório
2. Jogador clica no mapa para fazer palpite
3. Jogador confirma o palpite
4. Sistema calcula distância e pontuação
5. Exibe resultado com linha conectando os pontos
6. Histórico é atualizado

### Modo Aposta
1. Jogador seleciona "Modo Aposta"
2. Configura jogadores (2-8) e valores de aposta
3. Sistema gera Street View aleatório
4. Cada jogador faz seu palpite em sequência
5. Quando todos terminam, sistema calcula vencedor
6. Exibe tabela com distâncias e prêmios
7. Vencedor recebe 80% do prêmio total

## 🎨 Melhorias Futuras Sugeridas

### Funcionalidades
- [ ] Sistema de ranking/leaderboard
- [ ] Diferentes dificuldades (fácil/médio/difícil baseado em região)
- [ ] Modo multiplayer online
- [ ] Integração com sistema de pagamento real
- [ ] Estatísticas detalhadas por jogador
- [ ] Modo torneio com múltiplas rodadas
- [ ] Power-ups (pistas, zoom adicional, etc)
- [ ] Modo contra-relógio

### Técnicas
- [ ] Persistência de dados (localStorage/backend)
- [ ] Animações mais suaves
- [ ] Feedback sonoro
- [ ] Suporte a temas (claro/escuro)
- [ ] PWA (Progressive Web App)
- [ ] Otimizações de performance
- [ ] Testes automatizados

## 📝 Tecnologias Utilizadas

- **React 18** - Framework UI
- **Vite** - Build tool e dev server
- **@react-google-maps/api** - Integração com Google Maps
- **Google Maps JavaScript API** - Street View e Mapas

## 📄 Licença

Este projeto é de código aberto e está disponível para uso livre.

---

Desenvolvido com ❤️ para diversão e aprendizado de geografia!
