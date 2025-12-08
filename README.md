# Mini GeoGuessr

- Street View aleatório, mapa de palpite, cálculo Haversine e linha entre pontos após confirmar.

- Componentização: StreetView, GuessMap, Result, util utils/geo.js.
- Estado centralizado em App.jsx (posição real, palpite, distância, loading).

## Como rodar
- npm install.
- npm run dev.

## Uso
- Ao abrir, a app escolhe um ponto aleatório com Street View (tenta até 25 vezes; se faltar cobertura, usa o último sorteio).
- Clique no mapa inferior para marcar seu palpite; o marcador “?” aparece.
- Clique em “Confirmar palpite” para ver a distância em km e a linha entre os pontos.
- “Jogar novamente” sorteia outro local (ativa loading no Street View).
- Arquivos principais: src/App.jsx, src/components/StreetView.jsx, src/components/GuessMap.jsx, src/components/Result.jsx, src/utils/geo.js, estilos em src/App.css e src/index.css, exemplo de env em env.example.
- Se quiser reforçar cobertura, ajuste maxAttempts ou radius em pickRandomStreetView dentro de src/App.jsx.