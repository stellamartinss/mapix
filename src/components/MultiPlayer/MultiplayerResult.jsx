import { useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Trophy, Medal, Award, MapPin, LogOut } from 'lucide-react';
import { haversineDistance } from '../../utils/geo';
import '../styles/MultiplayerResult.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Cores distintas para cada jogador (até 10 jogadores)
const PLAYER_COLORS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
  '#84CC16', // lime-500
];

/**
 * Componente MultiplayerResult - Exibe o resultado final com mapa e ranking
 */
const MultiplayerResult = ({ room, players, playerId, isCreator, onLeave, onPlayAgain }) => {
  const mapRef = useRef(null);

  // Calcula distâncias e ordena jogadores
  const rankedPlayers = useMemo(() => {
    if (!room.location) return [];

    return players
      .filter(player => player.guess)
      .map((player, index) => {
        const distance = haversineDistance(room.location, player.guess);
        return {
          ...player,
          distance: distance,
          distanceFormatted: distance < 1 
            ? `${Math.round(distance * 1000)}m`
            : `${distance.toFixed(2)}km`,
          color: PLAYER_COLORS[index % PLAYER_COLORS.length]
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [room.location, players]);

  // Ajusta o mapa para mostrar todos os pontos
  useEffect(() => {
    if (mapRef.current && rankedPlayers.length > 0 && room.location) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Adiciona a localização real
      bounds.extend(room.location);
      
      // Adiciona todos os palpites dos jogadores
      rankedPlayers.forEach(player => {
        bounds.extend(player.guess);
      });
      
      mapRef.current.fitBounds(bounds);
      
      // Adiciona padding para não deixar os markers nas bordas
      setTimeout(() => {
        if (mapRef.current) {
          const currentZoom = mapRef.current.getZoom();
          if (currentZoom > 2) {
            mapRef.current.setZoom(currentZoom - 0.5);
          }
        }
      }, 100);
    }
  }, [rankedPlayers, room.location]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-gray-400">{index + 1}</span>;
    }
  };

  const getRankClass = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500';
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400';
      case 2:
        return 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700';
      default:
        return 'bg-gray-800/50 border-gray-700';
    }
  };

  // Encontra a posição do jogador atual
  const currentPlayerRank = rankedPlayers.findIndex(p => p.id === playerId) + 1;
  const currentPlayer = rankedPlayers.find(p => p.id === playerId);

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">🎉 Resultado Final</h1>
          <code className="text-lg font-mono text-indigo-400">
            {room.code}
          </code>
        </div>

        {/* Posição do jogador atual */}
        {currentPlayerRank > 0 && currentPlayer && (
          <div className="flex items-center gap-3 bg-indigo-900/50 border-2 border-indigo-500 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              {getRankIcon(currentPlayerRank - 1)}
              <div>
                <p className="text-xs text-gray-400">Sua posição</p>
                <p className="text-xl font-bold text-white">
                  {currentPlayerRank}º lugar
                </p>
              </div>
            </div>
            <div className="border-l border-indigo-500 pl-3">
              <p className="text-xs text-gray-400">Distância</p>
              <p className="text-lg font-bold text-indigo-300">
                {currentPlayer.distanceFormatted}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {isCreator && (
            <button
              onClick={onPlayAgain}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Jogar Novamente
            </button>
          )}
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo principal: Mapa + Ranking */}
      <div className="flex-1 flex multiplayer-result-layout overflow-hidden min-h-0">
        {/* MAPA - Lado Esquerdo (50%) */}
        <div className="w-1/2 h-full relative bg-gray-800 multiplayer-result-map overflow-hidden">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={2}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            options={{
              disableDefaultUI: true,
              gestureHandling: 'greedy',
              zoomControl: true,
              zoomControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_CENTER,
              },
            }}
          >
            {/* Marker da localização real - destaque especial */}
            {room.location && (
              <Marker
                position={room.location}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 15,
                  fillColor: '#FFD700', // Dourado
                  fillOpacity: 1,
                  strokeColor: '#FFF',
                  strokeWeight: 4,
                }}
                label={{
                  text: '🎯',
                  fontSize: '20px',
                }}
                title="Localização Real"
                zIndex={1000}
              />
            )}

            {/* Markers dos palpites de cada jogador */}
            {rankedPlayers.map((player) => (
              <Marker
                key={player.id}
                position={player.guess}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: player.color,
                  fillOpacity: 0.9,
                  strokeColor: '#FFF',
                  strokeWeight: 2,
                }}
                label={{
                  text: player.name.charAt(0).toUpperCase(),
                  color: '#FFF',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                title={`${player.name} - ${player.distanceFormatted}`}
              />
            ))}
          </GoogleMap>

          {/* Legenda do mapa */}
          <div className="absolute top-4 left-4 bg-gray-900/95 rounded-lg shadow-lg p-4 max-w-xs multiplayer-result-map-legend">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Legenda
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-xs">
                  🎯
                </div>
                <span className="text-xs text-gray-300">Localização Real</span>
              </div>
              <div className="border-t border-gray-700 pt-2 space-y-1">
                {rankedPlayers.slice(0, 5).map((player) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-xs truncate ${player.id === playerId ? 'text-indigo-300 font-semibold' : 'text-gray-400'}`}>
                      {player.name}
                    </span>
                  </div>
                ))}
                {rankedPlayers.length > 5 && (
                  <p className="text-xs text-gray-500 italic">+{rankedPlayers.length - 5} jogadores</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RANKING - Lado Direito (50%) */}
        <div className="w-1/2 h-full overflow-y-auto bg-gray-900 p-6 multiplayer-result-ranking">
          <div className="max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Ranking
            </h2>

            {/* Lista de jogadores ranqueados */}
            <div className="space-y-3">
              {rankedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all multiplayer-result-rank-item ${getRankClass(
                    index
                  )} ${
                    player.id === playerId
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-900'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Posição/Ícone */}
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(index)}
                    </div>

                    {/* Cor do jogador */}
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Nome e distância */}
                    <div>
                      <p className="text-lg font-bold text-white">
                        {player.name}
                        {player.id === playerId && (
                          <span className="ml-2 px-2 py-1 text-xs bg-indigo-600 rounded">
                            Você
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{player.distanceFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge de vitória */}
                  {index === 0 && (
                    <div className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm font-bold">
                      Vencedor!
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Jogadores que não fizeram palpite */}
            {players.filter(p => !p.guess).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Não participaram:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {players
                    .filter(p => !p.guess)
                    .map(player => (
                      <span
                        key={player.id}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {player.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 text-center">
                Localização real: {room.location.lat.toFixed(6)}, {room.location.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MultiplayerResult.propTypes = {
  room: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  playerId: PropTypes.string.isRequired,
  isCreator: PropTypes.bool.isRequired,
  onLeave: PropTypes.func.isRequired,
  onPlayAgain: PropTypes.func.isRequired
};

export default MultiplayerResult;
