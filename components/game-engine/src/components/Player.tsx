import React from 'react';
import { Position, Direction } from '../types/game';

interface PlayerProps {
  position: Position;
  tileSize: number;
  cameraPosition: { x: number; y: number };
  zoom: number;
  isMoving: boolean;
  direction: Direction;
  animationFrame: number;
  health: number;
  maxHealth: number;
}

export const Player: React.FC<PlayerProps> = ({ 
  position, 
  tileSize, 
  cameraPosition, 
  zoom,
  isMoving,
  direction,
  animationFrame,
  health,
  maxHealth
}) => {
  const getSpriteClass = () => {
    const baseClass = "absolute z-20 transition-all duration-150 flex items-center justify-center";
    
    if (isMoving) {
      return `${baseClass} scale-110`;
    }
    return `${baseClass} scale-100`;
  };

  const getPlayerEmoji = () => {
    const walkCycle = ['🧙‍♂️', '🚶‍♂️', '🧙‍♂️', '🏃‍♂️'];
    
    if (isMoving) {
      return walkCycle[animationFrame % walkCycle.length];
    }
    
    return '🧙‍♂️';
  };

  const getRotation = () => {
    switch (direction) {
      case 'up': return 'rotate-0';
      case 'down': return 'rotate-0';
      case 'left': return 'scale-x-[-1]';
      case 'right': return 'scale-x-[1]';
      default: return 'rotate-0';
    }
  };

  const healthPercentage = (health / maxHealth) * 100;
  const healthColor = healthPercentage > 60 ? 'bg-green-500' : 
                     healthPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500';

  const scaledTileSize = tileSize * zoom;
  const playerSize = scaledTileSize * 0.8;

  return (
    <>
      {/* Player */}
      <div
        className={getSpriteClass()}
        style={{
          left: (position.x * tileSize - cameraPosition.x) * zoom + scaledTileSize * 0.1,
          top: (position.y * tileSize - cameraPosition.y) * zoom + scaledTileSize * 0.1,
          width: playerSize,
          height: playerSize,
        }}
      >
        <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-3 border-blue-800 flex items-center justify-center shadow-lg ${getRotation()}`}>
          <span className="text-white text-lg drop-shadow-md">
            {getPlayerEmoji()}
          </span>
        </div>
        
        {/* Health bar */}
        <div 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full p-0.5"
          style={{ width: playerSize * 0.8, height: 6 }}
        >
          <div 
            className={`h-full rounded-full transition-all duration-300 ${healthColor}`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        
        {/* Shadow */}
        <div 
          className="absolute bg-black opacity-30 rounded-full blur-sm"
          style={{
            bottom: -scaledTileSize * 0.05,
            left: '50%',
            transform: 'translateX(-50%)',
            width: playerSize * 0.7,
            height: scaledTileSize * 0.15,
          }}
        />
        
        {/* Movement trail effect */}
        {isMoving && (
          <div 
            className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"
            style={{ animationDuration: '0.3s' }}
          />
        )}
      </div>
    </>
  );
};
