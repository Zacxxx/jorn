import React, { useMemo } from 'react';
import { Position, WorldItem, NPC } from '../types/game';

interface WorldObjectsProps {
  tileSize: number;
  cameraPosition: { x: number; y: number };
  zoom: number;
  obstacles: Position[];
  items: WorldItem[];
  npcs: NPC[];
}

export const WorldObjects: React.FC<WorldObjectsProps> = ({
  tileSize,
  cameraPosition,
  zoom,
  obstacles,
  items,
  npcs
}) => {
  const getItemEmoji = (type: WorldItem['type']) => {
    switch (type) {
      case 'coin': return '🪙';
      case 'heart': return '❤️';
      case 'key': return '🗝️';
      case 'chest': return '📦';
      case 'gem': return '💎';
      case 'potion': return '🧪';
      default: return '❓';
    }
  };

  const getItemRarityClass = (rarity: WorldItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getNPCEmoji = (type: NPC['type']) => {
    switch (type) {
      case 'villager': return '👨‍🌾';
      case 'guard': return '💂‍♂️';
      case 'merchant': return '🧙‍♀️';
      case 'enemy': return '👹';
      case 'boss': return '🐉';
      default: return '👤';
    }
  };

  const getNPCHealthColor = (health: number, maxHealth: number) => {
    const percentage = health / maxHealth;
    if (percentage > 0.6) return 'bg-green-500';
    if (percentage > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const scaledTileSize = tileSize * zoom;

  // Memoize visible objects for performance
  const visibleObjects = useMemo(() => {
    const viewportWidth = 800;
    const viewportHeight = 600;
    const buffer = scaledTileSize * 2;

    const isVisible = (pos: Position) => {
      const objX = (pos.x * tileSize - cameraPosition.x) * zoom;
      const objY = (pos.y * tileSize - cameraPosition.y) * zoom;
      return objX > -buffer && objX < viewportWidth + buffer &&
             objY > -buffer && objY < viewportHeight + buffer;
    };

    return {
      obstacles: obstacles.filter(isVisible),
      items: items.filter(item => !item.collected && isVisible(item.position)),
      npcs: npcs.filter(npc => isVisible(npc.position))
    };
  }, [obstacles, items, npcs, cameraPosition, zoom, tileSize, scaledTileSize]);

  return (
    <>
      {/* Obstacles */}
      {visibleObjects.obstacles.map((obstacle, index) => (
        <div
          key={`obstacle-${index}`}
          className="absolute bg-gradient-to-br from-gray-500 to-gray-700 border-2 border-gray-800 z-10 flex items-center justify-center text-2xl shadow-lg rounded-sm"
          style={{
            left: (obstacle.x * tileSize - cameraPosition.x) * zoom,
            top: (obstacle.y * tileSize - cameraPosition.y) * zoom,
            width: scaledTileSize,
            height: scaledTileSize,
          }}
        >
          🪨
        </div>
      ))}

      {/* Items */}
      {visibleObjects.items.map((item) => (
        <div
          key={item.id}
          className="absolute z-15 flex flex-col items-center justify-center"
          style={{
            left: (item.position.x * tileSize - cameraPosition.x) * zoom + scaledTileSize * 0.25,
            top: (item.position.y * tileSize - cameraPosition.y) * zoom + scaledTileSize * 0.25,
            width: scaledTileSize * 0.5,
            height: scaledTileSize * 0.5,
          }}
        >
          <div className={`text-xl animate-bounce ${getItemRarityClass(item.rarity)} drop-shadow-lg`}>
            {getItemEmoji(item.type)}
          </div>
          {item.rarity !== 'common' && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
        </div>
      ))}

      {/* NPCs */}
      {visibleObjects.npcs.map((npc) => {
        const healthPercentage = (npc.health / npc.maxHealth) * 100;
        
        return (
          <div
            key={npc.id}
            className="absolute z-12 flex flex-col items-center"
            style={{
              left: (npc.position.x * tileSize - cameraPosition.x) * zoom + scaledTileSize * 0.1,
              top: (npc.position.y * tileSize - cameraPosition.y) * zoom + scaledTileSize * 0.1,
              width: scaledTileSize * 0.8,
              height: scaledTileSize * 0.8,
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-lg">
              <span className="text-lg drop-shadow-md">
                {getNPCEmoji(npc.type)}
              </span>
            </div>
            
            {/* NPC Health bar (for enemies and bosses) */}
            {(npc.type === 'enemy' || npc.type === 'boss') && npc.health < npc.maxHealth && (
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full p-0.5"
                style={{ width: scaledTileSize * 0.6, height: 4 }}
              >
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${getNPCHealthColor(npc.health, npc.maxHealth)}`}
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
            )}
            
            {/* Behavior indicator */}
            {npc.behavior === 'chase' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
            {npc.behavior === 'patrol' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
        );
      })}
    </>
  );
};
