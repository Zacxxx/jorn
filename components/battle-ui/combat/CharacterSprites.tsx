import React, { useCallback } from 'react';
import { Player, Enemy, PlayerEffectiveStats } from '../../../types';
import { JornBattleConfig } from '../../../types/layout'; // Import specific type
import PlayerBattleDisplay from '../layout/PlayerBattleDisplay';
import EnemyBattleDisplay from '../layout/EnemyBattleDisplay';
import { useDragAndDrop } from '../../hooks'; // Import from index

interface CharacterSpritesProps {
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  currentEnemies: Enemy[];
  config: JornBattleConfig;
  isEditMode: boolean;
  selectedElement: string | null;
  isDragging: boolean;
  onElementSelect: (element: string) => void;
  onMouseDown: (e: React.MouseEvent, element: string) => void;
  // Combat-related props
  targetEnemyId: string | null;
  onSetTargetEnemy: (enemyId: string) => void;
  onShowPlayerDetails: () => void;
  onShowEnemyDetails: (enemy: Enemy) => void;
  // Props for ResizeHandles (passed down)
  containerRef: React.RefObject<HTMLDivElement | null>;
  setResizeHandle: (handle: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setDragStart: (position: Position | null) => void; // Position is from types/layout
  selectedEnemyIds?: string[];
}

export const CharacterSprites: React.FC<CharacterSpritesProps> = ({
  player,
  effectivePlayerStats,
  currentEnemies,
  config,
  isEditMode,
  selectedElement,
  isDragging,
  onElementSelect,
  onMouseDown,
  targetEnemyId,
  onSetTargetEnemy,
  onShowPlayerDetails,
  onShowEnemyDetails,
  containerRef,
  setResizeHandle,
  setIsDragging,
  setIsResizing,
  setDragStart,
  selectedEnemyIds = []
}) => {

  // --- Character Rendering Functions (Pokemon-battle.tsx inspired) ---
  const renderPlayerSprite = useCallback(() => {
    const position = config.playerPosition;
    const isSelected = selectedElement === 'playerSprite';

    return (
      <div
        key={`player-${player.id || 'hero'}`}
        className={`absolute transition-all duration-200 cursor-pointer hover:scale-105 ${isEditMode ? 'z-10' : ''} ${isSelected && isEditMode ? 'ring-4 ring-yellow-400/70 ring-offset-2 ring-offset-slate-900' : ''} ${isDragging && isSelected ? 'scale-110 shadow-2xl' : ''}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translateX(-50%) translateY(-50%)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditMode) {
            onElementSelect('playerSprite');
          } else {
            onShowPlayerDetails();
          }
        }}
        onMouseDown={(e) => {
          if (isEditMode) {
            e.stopPropagation();
            onMouseDown(e, 'playerSprite');
          }
        }}
      >
        <PlayerBattleDisplay
          player={player}
          effectiveStats={effectivePlayerStats}
          onInfoClick={onShowPlayerDetails}
        />
        {isEditMode && isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs px-2 py-1 rounded whitespace-nowrap">
            Player Sprite
          </div>
        )}
      </div>
    );
  }, [player, effectivePlayerStats, config.playerPosition, isEditMode, selectedElement, isDragging, onElementSelect, onMouseDown, onShowPlayerDetails]);

  const renderEnemySprites = useCallback(() => {
    // AOE is active if more than 1 enemy is selected
    const isAOEActive = selectedEnemyIds && selectedEnemyIds.length > 1;
    return currentEnemies.map((enemy, index) => {
      const position = config.enemyPositions[index] || config.enemyPositions[0];
      const elementKey = `enemySprite-${index}`;
      const isSelected = selectedElement === elementKey;
      const enemyIsAOEActive = isAOEActive && selectedEnemyIds.includes(enemy.id);
      return (
        <div
          key={`enemy-${enemy.id}`}
          className={`absolute transition-all duration-200 cursor-pointer hover:scale-105 ${isEditMode ? 'z-10' : ''}
            ${isSelected && isEditMode ? 'ring-4 ring-red-400/70 ring-offset-2 ring-offset-slate-900' : ''}
            ${isDragging && isSelected ? 'scale-110 shadow-2xl' : ''}
            ${enemyIsAOEActive ? 'ring-4 ring-purple-400 animate-pulse' : ''}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translateX(-50%) translateY(-50%)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode) {
              onElementSelect(elementKey);
            } else {
              onSetTargetEnemy(enemy.id);
            }
          }}
          onMouseDown={(e) => {
            if (isEditMode) {
              e.stopPropagation();
              onMouseDown(e, elementKey);
            }
          }}
        >
          <EnemyBattleDisplay
            enemy={enemy}
            isTargeted={targetEnemyId === enemy.id}
            isAOEActive={enemyIsAOEActive}
            onClick={() => onSetTargetEnemy(enemy.id)}
            onInfoClick={() => onShowEnemyDetails(enemy)}
          />
          {isEditMode && isSelected && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Enemy {index + 1}
            </div>
          )}
        </div>
      );
    });
  }, [currentEnemies, targetEnemyId, onSetTargetEnemy, config.enemyPositions, isEditMode, selectedElement, isDragging, onElementSelect, onMouseDown, onShowEnemyDetails, selectedEnemyIds]);

  return (
    <>
      {renderEnemySprites()}
      {renderPlayerSprite()}
    </>
  );
}; 