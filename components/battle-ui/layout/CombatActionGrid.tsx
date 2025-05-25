import React from 'react';
import { CombatActionItemType, Player, Spell, Ability, Consumable } from '../../../types';
import { CombatActionGridSlot } from '.'; // Assuming index.ts exports it
import { DynamicAreaView } from '../../../types/combat'; // Import specific type

interface CombatActionGridProps {
  items: CombatActionItemType[];
  type: 'spell' | 'ability' | 'consumable';
  player: Player;
  canPlayerAct: boolean;
  targetEnemyId: string | null;
  onActionSelect: (action: CombatActionItemType, type: 'spell' | 'ability' | 'consumable') => void;
  onMouseEnter: (event: React.MouseEvent, item: CombatActionItemType) => void;
  onMouseLeave: () => void;
}

export const CombatActionGrid: React.FC<CombatActionGridProps> = ({
  items,
  type,
  player,
  canPlayerAct,
  targetEnemyId,
  onActionSelect,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (items.length === 0) {
    return (
      <p className="text-center text-slate-400 p-4 italic text-sm h-full flex items-center justify-center">
        {type === 'spell'
          ? "No spells prepared."
          : type === 'ability'
          ? "No abilities available."
          : "No consumables available."}
      </p>
    );
  }

  // Calculate responsive grid columns based on items count and container size
  const itemCount = items.length;
  let gridCols = 'grid-cols-2';
  if (itemCount <= 2) gridCols = 'grid-cols-2';
  else if (itemCount <= 4) gridCols = 'grid-cols-2 md:grid-cols-4';
  else if (itemCount <= 6) gridCols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
  else if (itemCount <= 8) gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
  else gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';

  return (
    <div className={`grid ${gridCols} gap-2 p-2 h-full auto-rows-min`}>
      {items.map((item) => (
        <CombatActionGridSlot
          key={item.id}
          actionItem={item}
          player={player}
          onClick={(action) => onActionSelect(action, type)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isDisabledByGameLogic={!canPlayerAct}
        />
      ))}
    </div>
  );
}; 