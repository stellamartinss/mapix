import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Trophy, Medal, Award, MapPin, LogOut } from 'lucide-react';
import { haversineDistance } from '../utils/geo';

/**
 * Componente Ranking - Exibe o ranking final da rodada
 */
const Ranking = ({ room, players, playerId, onLeave }) => {
  // Calcula distâncias e ordena jogadores
  const rankedPlayers = useMemo(() => {
    if (!room.location) return [];

    return players
      .filter(player => player.guess) // Apenas jogadores que fizeram palpite
      .map(player => {
        const distance = haversineDistance(room.location, player.guess);
        return {
          ...player,
          distance: distance,
          distanceFormatted: distance < 1 
            ? `${Math.round(distance * 1000)}m`
            : `${distance.toFixed(2)}km`
        };
      })
      .sort((a, b) => a.distance - b.distance); // Ordena por menor distância
  }, [room.location, players]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return null;
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

  const currentPlayerRank = rankedPlayers.findIndex(p => p.id === playerId) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎉 Resultado Final
          </h1>
          <p className="text-gray-400">
            Sala: <code className="text-indigo-400 font-mono">{room.code}</code>
          </p>
        </div>

        {/* Pódio (Top 3) */}
        {rankedPlayers.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2º Lugar */}
            <div className="flex flex-col items-center w-32">
              <Medal className="w-12 h-12 text-gray-400 mb-2" />
              <div className="bg-gray-700 rounded-t-lg p-4 text-center w-full h-24 flex flex-col justify-center">
                <p className="text-white font-bold truncate">{rankedPlayers[1]?.name}</p>
                <p className="text-gray-300 text-sm">{rankedPlayers[1]?.distanceFormatted}</p>
              </div>
              <div className="bg-gray-600 w-full h-16 rounded-b-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
            </div>

            {/* 1º Lugar */}
            <div className="flex flex-col items-center w-32">
              <Trophy className="w-16 h-16 text-yellow-500 mb-2 animate-bounce" />
              <div className="bg-yellow-600 rounded-t-lg p-4 text-center w-full h-32 flex flex-col justify-center">
                <p className="text-white font-bold truncate">{rankedPlayers[0]?.name}</p>
                <p className="text-yellow-100 text-sm">{rankedPlayers[0]?.distanceFormatted}</p>
              </div>
              <div className="bg-yellow-500 w-full h-24 rounded-b-lg flex items-center justify-center">
                <span className="text-white text-3xl font-bold">1</span>
              </div>
            </div>

            {/* 3º Lugar */}
            <div className="flex flex-col items-center w-32">
              <Award className="w-10 h-10 text-amber-700 mb-2" />
              <div className="bg-amber-800 rounded-t-lg p-4 text-center w-full h-20 flex flex-col justify-center">
                <p className="text-white font-bold truncate">{rankedPlayers[2]?.name}</p>
                <p className="text-amber-200 text-sm">{rankedPlayers[2]?.distanceFormatted}</p>
              </div>
              <div className="bg-amber-700 w-full h-12 rounded-b-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Ranking completo */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Ranking Completo
          </h2>

          <div className="space-y-3">
            {rankedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${getRankClass(
                  index
                )} ${
                  player.id === playerId
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-800'
                    : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index) || (
                      <span className="text-2xl font-bold text-gray-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Nome do jogador */}
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
        </div>

        {/* Informações do jogador */}
        {currentPlayerRank > 0 && (
          <div className="bg-indigo-900/50 rounded-xl p-6 mb-6 border-2 border-indigo-500">
            <h3 className="text-xl font-bold text-white mb-2">Sua Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-300 text-sm">Posição</p>
                <p className="text-3xl font-bold text-indigo-400">
                  {currentPlayerRank}º
                </p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Distância</p>
                <p className="text-3xl font-bold text-indigo-400">
                  {rankedPlayers.find(p => p.id === playerId)?.distanceFormatted}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-4">
          <button
            onClick={onLeave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair da Sala
          </button>
        </div>

        {/* Localização real */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Localização real: {room.location.lat.toFixed(6)}, {room.location.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
};

Ranking.propTypes = {
  room: PropTypes.object.isRequired,
  players: PropTypes.array.isRequired,
  playerId: PropTypes.string.isRequired,
  onLeave: PropTypes.func.isRequired
};

export default Ranking;
