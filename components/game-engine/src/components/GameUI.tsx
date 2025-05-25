import React from 'react';
import { Position } from '../types/game';

interface GameStats {
  score: number;
  position: Position;
  itemsCollected: number;
  totalItems: number;
  direction: string;
  health: number;
  maxHealth: number;
  gameTime: number;
  zoom: number;
  velocity: Position;
}

interface GameUIProps {
  stats: GameStats;
}

export const GameUI: React.FC<GameUIProps> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  const itemsPercentage = (stats.itemsCollected / stats.totalItems) * 100;

  return (
    <div className="text-center space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Advanced Zelda Engine
        </h2>
        <p className="text-gray-600 mb-4">
          Ultra-smooth camera system with advanced game mechanics
        </p>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {/* Score */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 px-4 py-3 rounded-lg border border-yellow-300 shadow-sm">
          <div className="text-yellow-800 font-semibold">Score</div>
          <div className="text-xl font-bold text-yellow-900">{stats.score.toLocaleString()}</div>
        </div>
        
        {/* Time */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 px-4 py-3 rounded-lg border border-blue-300 shadow-sm">
          <div className="text-blue-800 font-semibold">Time</div>
          <div className="text-xl font-bold text-blue-900">{formatTime(stats.gameTime)}</div>
        </div>
        
        {/* Position */}
        <div className="bg-gradient-to-br from-green-100 to-green-200 px-4 py-3 rounded-lg border border-green-300 shadow-sm">
          <div className="text-green-800 font-semibold">Position</div>
          <div className="text-lg font-bold text-green-900">
            ({stats.position.x}, {stats.position.y})
          </div>
        </div>
        
        {/* Direction */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 px-4 py-3 rounded-lg border border-purple-300 shadow-sm">
          <div className="text-purple-800 font-semibold">Direction</div>
          <div className="text-lg font-bold text-purple-900 capitalize">{stats.direction}</div>
        </div>
      </div>
      
      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Bar */}
        <div className="bg-white p-3 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Health</span>
            <span className="text-sm text-gray-600">{stats.health}/{stats.maxHealth}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                healthPercentage > 60 ? 'bg-green-500' : 
                healthPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Items Progress */}
        <div className="bg-white p-3 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Items</span>
            <span className="text-sm text-gray-600">{stats.itemsCollected}/{stats.totalItems}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${itemsPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Camera Info */}
        <div className="bg-white p-3 rounded-lg border shadow-sm">
          <div className="text-sm font-semibold text-gray-700 mb-1">Camera</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Zoom: {stats.zoom.toFixed(2)}x</div>
            <div>Velocity: {Math.sqrt(stats.velocity.x ** 2 + stats.velocity.y ** 2).toFixed(1)}</div>
          </div>
        </div>
      </div>
      
      {/* Completion Status */}
      {itemsPercentage === 100 && (
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg shadow-lg animate-pulse">
          <div className="text-lg font-bold">🎉 All Items Collected! 🎉</div>
          <div className="text-sm">Final Score: {stats.score.toLocaleString()} points in {formatTime(stats.gameTime)}</div>
        </div>
      )}
    </div>
  );
};
