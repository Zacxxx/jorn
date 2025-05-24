import React from 'react';
import { GameItem, Equipment, Consumable, DetailedEquipmentSlot, Player } from '../types'; // Adjusted path assuming ItemDisplay is in components/
import { GetSpellIcon } from './IconComponents'; // For item icons
import ActionButton from './ActionButton';

interface ItemDisplayProps {
  item: GameItem;
  showEquipButton?: boolean;
  onEquip?: (item: Equipment, slot?: DetailedEquipmentSlot) => void;
  showUnequipButton?: boolean;
  onUnequip?: (slot: DetailedEquipmentSlot) => void;
  equippedInSlot?: DetailedEquipmentSlot | null;
  showDropButton?: boolean;
  onDrop?: (item: GameItem) => void;
  showExamineButton?: boolean;
  onExamine?: (item: GameItem) => void;
  showEnhanceButton?: boolean; // New prop for enhance button
  onEnhance?: (item: Equipment) => void; // New callback for enhance
  compact?: boolean; // For a smaller display, e.g., in lists
  playerStats?: Player['statsBoost']; // Optional: for showing stat comparison
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({
  item,
  showEquipButton = false,
  onEquip,
  showUnequipButton = false,
  onUnequip,
  equippedInSlot = null,
  showDropButton = false,
  onDrop,
  showExamineButton = false,
  onExamine,
  showEnhanceButton = false, 
  onEnhance,
  compact = false,
  playerStats,
}) => {
  const isEquipment = item.itemType === 'Equipment';
  const equipment = isEquipment ? (item as Equipment) : null;
  const consumable = !isEquipment ? (item as Consumable) : null;

  const handleEquip = () => {
    if (equipment && onEquip) {
      // Basic logic, might need a slot selector UI if multiple slots are possible
      // For now, assuming direct equip or a predefined slot if available
      onEquip(equipment);
    }
  };

  const handleUnequip = () => {
    if (equippedInSlot && onUnequip) {
      onUnequip(equippedInSlot);
    }
  };
  
  const handleEnhance = () => {
    if (equipment && onEnhance) {
        onEnhance(equipment);
    }
  }

  return (
    <div className={`p-2 rounded-md ${compact ? 'bg-slate-700/80' : 'bg-slate-800 shadow-md border border-slate-700'}`}>
      <div className={`flex ${compact ? 'flex-col items-center text-center' : 'items-start space-x-3'}`}>
        <GetSpellIcon iconName={item.iconName} className={compact ? "w-8 h-8 mb-1" : "w-10 h-10 text-sky-400"} />
        <div className="flex-grow">
          <h4 className={`font-semibold ${compact ? 'text-xs' : 'text-md'} text-sky-300`}>
            {item.name}
            {equipment?.enhancementLevel && equipment.enhancementLevel > 0 && (
              <span className="text-yellow-400 ml-1">+{equipment.enhancementLevel}</span>
            )}
          </h4>
          {!compact && <p className="text-xs text-slate-400 mb-1">{item.description}</p>}
          {compact && isEquipment && equipment?.slot && <p className="text-xs text-slate-500">({equipment.slot})</p>}
        </div>
      </div>

      {!compact && (
        <div className="mt-2 text-xs text-slate-300 space-y-0.5">
          <p>Type: {item.itemType}</p>
          {isEquipment && equipment && (
            <>
              <p>Slot: {equipment.slot}</p>
              {Object.entries(equipment.statsBoost).map(([stat, value]) => {
                if (value && typeof value === 'number' && value !== 0) { // Check if value is a non-zero number
                    return <p key={stat} className="capitalize">{stat.replace(/([A-Z])/g, ' $1')}: {value > 0 ? '+' : ''}{value}</p>;
                }
                return null;
              })}
              {equipment.element && equipment.element !== 'None' && <p>Element: {equipment.element}</p>}
            </>
          )}
          {consumable && (
            <>
              <p>Effect: {consumable.effectType.replace('_', ' ').toLowerCase()}</p>
              {consumable.magnitude && <p>Magnitude: {consumable.magnitude}</p>}
              {consumable.duration && <p>Duration: {consumable.duration} turns</p>}
            </>
          )}
        </div>
      )}

      {!compact && (showEquipButton || showUnequipButton || showDropButton || showExamineButton || showEnhanceButton) && (
        <div className="mt-3 pt-2 border-t border-slate-700 flex flex-wrap gap-2">
          {showEquipButton && isEquipment && onEquip && (
            <ActionButton onClick={handleEquip} size="xs" variant="outline_primary">Equip</ActionButton>
          )}
          {showUnequipButton && equippedInSlot && onUnequip && (
            <ActionButton onClick={handleUnequip} size="xs" variant="outline_secondary">Unequip</ActionButton>
          )}
          {showEnhanceButton && isEquipment && onEnhance && (
            <ActionButton onClick={handleEnhance} size="xs" variant="outline_success">Enhance</ActionButton>
          )}
          {showDropButton && onDrop && (
            <ActionButton onClick={() => onDrop(item)} size="xs" variant="danger_outline">Drop</ActionButton>
          )}
          {showExamineButton && onExamine && (
             <ActionButton onClick={() => onExamine(item)} size="xs" variant="secondary">Examine</ActionButton>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDisplay; 