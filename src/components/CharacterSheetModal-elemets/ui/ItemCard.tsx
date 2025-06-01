import React from 'react';
import {
    Player, GameItem, MasterItemDefinition, UniqueConsumable, MasterConsumableItem, LootChestItem, Equipment, SpellIconName, DetailedEquipmentSlot
} from '../../../../types'; // Corrected path
import ActionButton from '../../ActionButton'; // Fixed path to ActionButton
import { GetSpellIcon, ChestIcon, GearIcon } from '../../IconComponents'; // Fixed path to IconComponents
import { MASTER_ITEM_DEFINITIONS } from '../../../../services/itemService'; // Fixed import location
import { RESOURCE_ICONS } from '../../../../constants'; // Corrected path
import { getRarityColorClass } from '../../../../utils'; // Corrected path

interface ItemCardProps {
  item: GameItem | MasterItemDefinition;
  quantity?: number;
  onUseItemFromInventory?: (itemId: string, targetId: string | null) => void;
  onOpenLootChest?: (chestId: string) => Promise<void>;
  isCompact?: boolean;
  isCombatContext?: boolean;
  onClick?: (item: GameItem | MasterItemDefinition) => void;
  onQuickEquip?: (item: Equipment) => void;
  isDetailView?: boolean;
}

const renderStatsBoost = (statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>) => {
  const boostsArray = Object.entries(statsBoost).map(([key, value]) => (
    <p key={key} className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-green-300">
      {`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} +${value}`}
    </p>
  ));
  return boostsArray.length > 0 ? <div className="space-y-0.5 mt-1">{boostsArray}</div> : null;
};

export const ItemCard: React.FC<ItemCardProps> = ({
    item,
    quantity,
    onUseItemFromInventory,
    onOpenLootChest,
    isCompact,
    isCombatContext,
    onClick,
    onQuickEquip,
    isDetailView
}) => {
  const cardClasses = `bg-slate-700/90 p-2 xs:p-2.5 sm:p-3 rounded-lg shadow-md border border-slate-600/70 flex flex-col justify-between transition-all duration-150 hover:border-sky-400`;

  const itemAsUniqueConsumable = item as UniqueConsumable;
  const itemAsMasterConsumable = item as MasterConsumableItem;
  const itemAsLootChest = item as LootChestItem;

  const canUseConsumable = isDetailView && item.itemType === 'Consumable' && onUseItemFromInventory;
  const canOpenLootChest = isDetailView && item.itemType === 'LootChest' && onOpenLootChest;

  const handleMainAction = () => {
    if (item.itemType === 'Consumable' && onUseItemFromInventory && isDetailView) {
        onUseItemFromInventory(item.id, null); // Pass item.id (masterId for stackable, uniqueId for GameItem), null for target
    } else if (item.itemType === 'LootChest' && onOpenLootChest && isDetailView && itemAsLootChest.id) {
      onOpenLootChest(itemAsLootChest.id);
    } else if (onClick && !isDetailView) {
        onClick(item);
    }
  };

  const itemAsEquipment = item as Equipment;

  const itemHasResourceCost = !item.stackable && (item.itemType === 'Consumable' || item.itemType === 'Equipment') ? Boolean((itemAsUniqueConsumable).resourceCost) : false;
  const resourceCostToDisplay = itemHasResourceCost ? (itemAsUniqueConsumable).resourceCost : [];


  return (
    <div
      className={`${cardClasses} ${(onClick && !isDetailView) || canUseConsumable || canOpenLootChest ? 'cursor-pointer' : ''}`}
      title={item.description}
      onClick={(onClick && !isDetailView && !isCombatContext) ? handleMainAction : undefined}
    >
      <div className="mb-2 sm:mb-3"> {/* Section spacing */}
        <div className="flex items-center mb-1.5 xs:mb-2"> {/* Header section internal spacing */}
          <GetSpellIcon iconName={item.iconName} className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 mr-1.5 xs:mr-2 text-sky-200 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <h5 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{item.name} {quantity && quantity > 1 && `(x${quantity})`}</h5>
            <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-slate-400">{item.itemType}</p>
          </div>
        </div>
        {!isCompact && <p className="text-[0.65rem] xs:text-xs sm:text-sm text-slate-300 mb-1.5 xs:mb-2 leading-snug">{item.description}</p>}

        {/* Item Specific Details Section */}
        <div className="mb-2 sm:mb-3">
          {item.itemType === 'Consumable' && (
            <div className="space-y-0.5">
              <p className="text-[0.65rem] xs:text-xs sm:text-sm text-lime-300">Effect: {(itemAsMasterConsumable).effectType.replace(/_/g, ' ')}
                {(itemAsMasterConsumable).magnitude !== undefined && ` (${(itemAsMasterConsumable).magnitude})`}
                {(itemAsMasterConsumable).duration !== undefined && `, ${(itemAsMasterConsumable).duration}t`}
              </p>
              {(itemAsMasterConsumable).statusToCure && <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-slate-400">Cures: {(itemAsMasterConsumable).statusToCure}</p>}
              {(itemAsMasterConsumable).buffToApply && <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-slate-400">Buffs: {(itemAsMasterConsumable).buffToApply}</p>}
            </div>
          )}
          {item.itemType === 'Equipment' && (
            <div className="space-y-0.5">
              <p className="text-[0.65rem] xs:text-xs sm:text-sm text-orange-300">Slot: {(itemAsEquipment).slot}</p>
              {(itemAsEquipment).statsBoost && renderStatsBoost((itemAsEquipment).statsBoost)}
            </div>
          )}
          {item.itemType === 'LootChest' && (
              <p className="text-[0.65rem] xs:text-xs sm:text-sm text-yellow-300">Level: {itemAsLootChest.level}</p>
          )}
        </div>
      </div>

      {/* Resource Cost Section */}
      {itemHasResourceCost && resourceCostToDisplay && resourceCostToDisplay.length > 0 && !isCombatContext && (
        <div className="mt-1.5 xs:mt-2 pt-1.5 xs:pt-2 border-t border-slate-600 mb-2 sm:mb-3"> {/* Section spacing */}
          <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-amber-300 font-medium mb-0.5">Cost:</p>
          <div className="flex flex-wrap gap-1">
            {resourceCostToDisplay.map(cost => {
                 const resourceDef = MASTER_ITEM_DEFINITIONS[cost.itemId] as MasterResourceItem | undefined;
                 const name = resourceDef ? resourceDef.name : cost.type;
                 const icon = resourceDef ? resourceDef.iconName : RESOURCE_ICONS[cost.itemId] || 'Default';
                return (
                  <div key={cost.itemId} className="flex items-center text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-amber-200 bg-slate-600/70 px-1 py-0.5 rounded" title={`${cost.quantity} ${name}`}>
                    <GetSpellIcon iconName={icon} className="w-2 h-2 xs:w-2.5 xs:h-2.5 mr-1 opacity-70" />
                    {cost.quantity} <span className="ml-0.5 opacity-60">{name.split(' ')[0]}</span>
                  </div>
                );
            })}
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="mt-auto pt-1.5 xs:pt-2 border-t border-slate-600/50 space-y-1.5 xs:space-y-2">
        {canUseConsumable && (
          <ActionButton onClick={handleMainAction} size="sm" variant="success" className="w-full !py-1 text-xs sm:text-sm">
            Use
          </ActionButton>
        )}
        {canOpenLootChest && itemAsLootChest.id && (
             <ActionButton onClick={handleMainAction} size="sm" variant="primary" icon={<ChestIcon className="w-3.5 h-3.5"/>} className="w-full !py-1 text-xs sm:text-sm">
                Open Chest
            </ActionButton>
        )}
        {isDetailView && item.itemType === 'Equipment' && onQuickEquip && (
            <ActionButton
                onClick={() => onQuickEquip(itemAsEquipment)}
                size="sm"
                variant="success"
                className="w-full !py-1 text-xs sm:text-sm"
                icon={<GearIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5"/>}
            >
            Equip
            </ActionButton>
        )}
      </div>
      {/* Conditional rendering of getRarityColorClass needs to be handled if it was used directly in ItemCard JSX,
          but it seems it's used by InventoryGridSlot which is a different component.
          If ItemCard itself directly used getRarityColorClass for its own styling, that import would be needed here.
          Based on the provided snippet, ItemCard doesn't seem to use getRarityColorClass directly on itself.
      */}
    </div>
  );
};

// renderStatsBoost is co-located. ItemCard is the default export.
export default ItemCard;
