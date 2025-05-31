import React, { useState, useEffect, useCallback } from 'react';
import { Player, PlayerEffectiveStats, DetailedEquipmentSlot, GameItem, Equipment, Spell, Ability, EquipmentSlot as GenericEquipmentSlot, InventoryFilterType, MasterItemDefinition, MasterResourceItem, MasterConsumableItem, LootChestItem, UniqueConsumable, Quest, CharacterSheetTab, SpellIconName } from '../types';
import Modal from '../ui/Modal';
import ActionButton from '../ui/ActionButton';
import {
    GetSpellIcon, UserIcon, GearIcon, BagIcon, WandIcon, StarIcon, BookIcon, MindIcon,
    HealIcon, SpeedIcon, SwordSlashIcon, ShieldIcon, BodyIcon, ReflexIcon,
    ChestIcon, CollectionIcon
} from './IconComponents';
import {
    DETAILED_EQUIPMENT_SLOTS_LEFT_COL, DETAILED_EQUIPMENT_SLOTS_RIGHT_COL,
    DETAILED_SLOT_PLACEHOLDER_ICONS, RESOURCE_ICONS, STATUS_EFFECT_ICONS, DEFAULT_ENCYCLOPEDIA_ICON, GENERIC_TO_DETAILED_SLOT_MAP,
    DEFAULT_TRAIT_ICON
} from '../constants';
import SpellbookDisplay from './SpellbookDisplay';
import AbilityBookDisplay from './AbilityBookDisplay';
import { MASTER_ITEM_DEFINITIONS } from '../services/itemService';
import { getRarityColorClass } from '../utils';



interface CharacterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onEquipItem: (itemId: string, slot: DetailedEquipmentSlot) => void;
  onUnequipItem: (slot: DetailedEquipmentSlot) => void;
  maxRegisteredSpells: number;
  maxPreparedSpells: number;
  maxPreparedAbilities: number;
  onEditSpell: (spell: Spell) => void;
  onPrepareSpell: (spell: Spell) => void;
  onUnprepareSpell: (spell: Spell) => void;
  onPrepareAbility: (ability: Ability) => void;
  onUnprepareAbility: (ability: Ability) => void;
  initialTab?: CharacterSheetTab;
  onOpenSpellCraftingScreen?: () => void;
  onOpenTraitCraftingScreen?: () => void;
  canCraftNewTrait?: boolean;
  onOpenLootChest?: (chestId: string) => Promise<void>;
  onUseConsumableFromInventory: (itemId: string, targetId: string | null) => void;
}


const SheetTabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex flex-col sm:flex-row items-center justify-center p-1.5 xs:p-2 sm:p-2 md:p-2.5 rounded-t-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-inset focus:ring-sky-400/70 min-w-[50px] sm:min-w-[100px]
                ${isActive
                    ? 'bg-slate-700 text-sky-300 border-b-2 border-sky-500 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-b-2 border-transparent hover:bg-slate-750 hover:text-sky-400 hover:border-slate-600'}`}
    aria-pressed={isActive}
    style={{fontFamily: "'Inter Tight', sans-serif"}}
    title={label}
  >
    <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-4 sm:h-4 mb-0.5 sm:mb-0 sm:mr-1.5">{icon}</div>
    <span className={`text-[0.55rem] xs:text-[0.6rem] sm:text-xs font-medium sm:font-semibold tracking-tight uppercase hidden sm:inline`}>{label}</span>
  </button>
);


interface EquipmentSlotDisplayProps {
  slot: DetailedEquipmentSlot;
  itemId: string | null | undefined;
  allItems: GameItem[];
  onClick: () => void;
  className?: string;
}
const EquipmentSlotDisplay: React.FC<EquipmentSlotDisplayProps> = ({ slot, itemId, allItems, onClick, className = "" }) => {
  const item = itemId ? allItems.find(i => i.id === itemId) as Equipment | undefined : undefined;
  const iconName = item ? item.iconName : DETAILED_SLOT_PLACEHOLDER_ICONS[slot];
  const slotName = slot.replace(/([A-Z0-9])/g, ' $1').trim();

  return (
    <button
      onClick={onClick}
      className={`w-full h-[44px] xs:h-[48px] sm:h-[56px] md:h-[60px] bg-slate-700/70 hover:bg-slate-600/70 border-2 border-slate-600/80 hover:border-sky-500 rounded-lg flex flex-col items-center justify-center p-0.5 sm:p-1 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-1 focus:ring-sky-400 ${className}`}
      title={item ? `${item.name} (${slotName})` : `Equip ${slotName}`}
    >
      <GetSpellIcon iconName={iconName} className={`w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${item ? 'text-sky-300' : 'text-slate-500'}`} />
      <span className="text-[0.4rem] xs:text-[0.45rem] sm:text-[0.5rem] text-slate-400 mt-0.5 truncate w-full px-0.5">{item ? item.name : slotName}</span>
    </button>
  );
};

const VitalStatisticsDisplay: React.FC<{player: Player, stats: PlayerEffectiveStats}> = ({player, stats}) => {
  const primaryStats = [
    { label: "HP", value: player.hp, maxValue: stats.maxHp, icon: <HealIcon className="text-red-300"/>, valClass: "text-red-200", barClass: "bg-gradient-to-r from-red-500 to-rose-600" },
    { label: "MP", value: player.mp, maxValue: stats.maxMp, icon: <WandIcon className="text-blue-300"/>, valClass: "text-blue-200", barClass: "bg-gradient-to-r from-blue-500 to-sky-600" },
    { label: "EP", value: player.ep, maxValue: stats.maxEp, icon: <ReflexIcon className="text-yellow-300"/>, valClass: "text-yellow-200", barClass: "bg-gradient-to-r from-yellow-400 to-amber-500" },
  ];

  return (
  <div className="p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
    <h4 className="text-[0.7rem] xs:text-xs sm:text-sm font-semibold text-sky-200 mb-1 xs:mb-1.5" style={{fontFamily: "'Inter Tight', sans-serif"}}>Vitals</h4>
    <div className="space-y-1 xs:space-y-1.5">
        {primaryStats.map(s => (
            <div key={s.label}>
                <div className="flex justify-between items-center text-[0.6rem] xs:text-[0.65rem] sm:text-xs mb-0.5">
                    <span className="flex items-center font-medium text-slate-100">
                        {React.cloneElement(s.icon, {className: "w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1"})}
                        {s.label}
                    </span>
                    <span className={`font-mono font-semibold text-[0.65rem] xs:text-xs ${s.valClass}`}>{s.value}<span className="opacity-70 text-[0.55rem] sm:text-[0.65rem]">/{s.maxValue}</span></span>
                </div>
                <div className="w-full bg-slate-800/70 rounded-full h-1.5 xs:h-2 sm:h-2.5 overflow-hidden shadow-inner border border-slate-600/50">
                    <div className={`h-full rounded-full transition-all duration-300 ease-out ${s.barClass} shadow-sm`}
                         style={{ width: s.maxValue > 0 ? `${Math.max(0,Math.min(100,(s.value / s.maxValue) * 100))}%` : '0%' }}>
                    </div>
                </div>
            </div>
        ))}
    </div>
  </div>
  );
};

const AttributesDisplay: React.FC<{player:Player, stats: PlayerEffectiveStats}> = ({player, stats}) => {
    const combatStats = [
      { label: "Speed", value: stats.speed, icon: <SpeedIcon className="text-lime-300"/>, valClass: "text-lime-200" },
      { label: "Phys. Pow", value: stats.physicalPower, icon: <SwordSlashIcon className="text-orange-300"/>, valClass: "text-orange-200" },
      { label: "Mag. Pow", value: stats.magicPower, icon: <MindIcon className="text-purple-300"/>, valClass: "text-purple-200" },
      { label: "Defense", value: stats.defense, icon: <ShieldIcon className="text-teal-300"/>, valClass: "text-teal-200" },
      { label: "Dmg Reflect", value: Math.round((stats.damageReflectionPercent || 0) * 100), icon: <ShieldIcon className="text-pink-300"/>, valClass: "text-pink-200" },
  ];
  return (
  <div className="p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
    <h4 className="text-[0.7rem] xs:text-xs sm:text-sm font-semibold text-sky-200 mb-0.5 xs:mb-1" style={{fontFamily: "'Inter Tight', sans-serif"}}>Attributes</h4>
    <div className="grid grid-cols-3 gap-0.5 xs:gap-1 mb-1 xs:mb-1.5">
        {[
            {label: "Body", value: stats.body, base: player.body, icon: <BodyIcon className="text-red-300 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4"/>, desc: "Affects HP, Physical Power, Defense"},
            {label: "Mind", value: stats.mind, base: player.mind, icon: <MindIcon className="text-blue-300 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4"/>, desc: "Affects MP, Magic Power"},
            {label: "Reflex", value: stats.reflex, base: player.reflex, icon: <ReflexIcon className="text-yellow-300 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4"/>, desc: "Affects EP, Speed, Defense"},
        ].map(attr => (
            <div key={attr.label} className="bg-slate-800/60 p-0.5 xs:p-1 rounded-md text-center shadow-sm border border-slate-600/50" title={`${attr.desc}\nBase: ${attr.base} (+${attr.value - attr.base} from effects/gear)`}>
                {React.cloneElement(attr.icon, {className: `${attr.icon.props.className} mx-auto mb-0 xs:mb-0.5`})}
                <p className="text-[0.45rem] xs:text-[0.5rem] sm:text-[0.6rem] text-slate-200 font-medium">{attr.label}</p>
                <p className="text-[0.65rem] xs:text-xs sm:text-sm md:text-base font-bold text-slate-50">{attr.value}</p>
            </div>
        ))}
    </div>
    <div className="grid grid-cols-2 gap-x-0.5 xs:gap-x-1 gap-y-0.5 pt-0.5 xs:pt-1 border-t border-slate-600/60">
        {combatStats.map(s => (
            <div key={s.label} className="flex items-center justify-between bg-slate-800/60 p-0.5 xs:p-0.5 rounded-md shadow-sm text-[0.5rem] xs:text-[0.55rem] sm:text-[0.65rem]">
                <span className="flex items-center text-slate-200">
                    {React.cloneElement(s.icon, {className: "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 mr-0.5 xs:mr-0.5"})}
                    {s.label}:
                </span>
                <span className={`font-bold text-[0.55rem] xs:text-[0.6rem] sm:text-xs ${s.valClass}`}>{s.value}{s.label === 'Dmg Reflect' ? '%' : ''}</span>
            </div>
        ))}
    </div>
     {player.activeStatusEffects.length > 0 && (
      <>
        <h5 className="text-[0.55rem] xs:text-[0.6rem] sm:text-xs font-semibold text-slate-200 mt-1 xs:mt-1.5 mb-0.5">Active Effects:</h5>
        <div className="flex flex-wrap gap-0.5">
          {player.activeStatusEffects.map(effect => (
            <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`}
                 className="text-[0.5rem] xs:text-[0.55rem] bg-slate-600/80 px-0.5 py-0 rounded-sm flex items-center shadow-sm border border-slate-500/70">
              <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-1.5 h-1.5 xs:w-2 xs:h-2 mr-0.5 opacity-90"/>
              <span className="text-slate-100">{effect.name.replace('TEMP_','').replace('_UP','')}</span>
              {effect.magnitude && <span className="ml-0.5 opacity-80">({effect.magnitude})</span>}
              <span className="ml-0.5 text-slate-300 font-mono bg-slate-800/50 px-0.5 text-[0.45rem] xs:text-[0.5rem] rounded-sm">{effect.duration}t</span>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);};

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
    </div>
  );
};

interface ItemSelectionSubModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: DetailedEquipmentSlot;
  compatibleItems: Equipment[];
  onSelectItem: (itemId: string, slot: DetailedEquipmentSlot) => void;
}
const ItemSelectionSubModal: React.FC<ItemSelectionSubModalProps> = ({ isOpen, onClose, targetSlot, compatibleItems, onSelectItem }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={true} onClose={onClose} title={`Select for ${targetSlot.replace(/([A-Z0-9])/g, ' $1').trim()}`} size="lg">
      {compatibleItems.length === 0 ? (
        <p className="text-slate-400 italic text-center py-4 text-xs sm:text-sm">No compatible items.</p>
      ) : (
        <div className="space-y-1.5 xs:space-y-2 max-h-60 overflow-y-auto styled-scrollbar p-1">
          {compatibleItems.map(item => (
            <div key={item.id} onClick={() => onSelectItem(item.id, targetSlot)} className="cursor-pointer">
              <ItemCard
                item={item}
                isCompact={true}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 xs:mt-4 text-right">
        <ActionButton onClick={onClose} variant="secondary">Close</ActionButton>
      </div>
    </Modal>
  );
};

type InventoryGridItemType = GameItem | { itemDef: MasterItemDefinition, quantity: number };


interface InventoryGridSlotProps {
    item: InventoryGridItemType;
    onClick: (item: InventoryGridItemType) => void;
    onMouseEnter: (event: React.MouseEvent, item: InventoryGridItemType) => void;
    onMouseLeave: () => void;
    rarity?: number;
    onLongPress: (item: InventoryGridItemType, position: { x: number; y: number }) => void;
}

const InventoryGridSlot: React.FC<InventoryGridSlotProps> = ({ item, onClick, onMouseEnter, onMouseLeave, rarity, onLongPress }) => {
    const isStackable = 'itemDef' in item;
    const displayItem = isStackable ? item.itemDef : item;
    const quantity = isStackable ? item.quantity : undefined;
    const rarityColor = getRarityColorClass(rarity || displayItem.rarity || 0);

    const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

    const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
        // Prevent context menu from showing on right-click if it's a mouse event and not touch
        if (e.type === 'mousedown' && (e as React.MouseEvent).button === 2) {
            // Allow default context menu for mouse right click for now, or handle differently
            // return;
        }
        // If it's a touch event, prevent mouseEnter from firing to avoid double triggers or conflicts
        if (e.type === 'touchstart') {
            onMouseLeave(); // Clear any existing hover tooltip
        }

        longPressTimer.current = setTimeout(() => {
            const position = 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
            onLongPress(item, position);
            longPressTimer.current = null;
        }, 500);
    };

    const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        // This check helps prevent click if long press was triggered.
        // It's imperfect because the timer might clear just before onClick is called by the browser.
        // A more robust solution might involve state management within InventoryGridSlot or global event listeners.
        if (!longPressTimer.current) { // If timer is null, means it fired or was cleared before timeout
             // Check if the event target is the button itself or its children, not the context menu
            if (e.target && (e.target as HTMLElement).closest('button[aria-label="' + displayItem.name + '"]')) {
                 // Only call onClick if long press timer was cleared *before* it fired (i.e. it was a short press)
                // This condition is tricky. If handlePressEnd clears the timer, this will always be true for short clicks.
                // We essentially only want to call onClick if the long press did NOT occur.
                // The current logic in handlePressStart clears timer *after* onLongPress.
                // So, if timer is null here, it means long press *did* occur.
                // We need to rethink this. Let's assume for now: if timer *was* set, and is now cleared, it was a short press.
                // This means we need to check if it was *ever* set.
                // This is still tricky. Let's simplify: onClick is always called on tap.
                // The context menu will overlay. If user interacts with context menu, that's fine.
                // If they tap outside, context menu closes.
                // The main issue is preventing the detail modal AND context menu.
                // The onLongPress handler in CharacterSheetModal sets selectedInventoryItemDetail to null.
                 onClick(item);
            }
        }
    };


    return (
        <button
            onClick={(e) => handleClick(e)}
            onMouseEnter={(e) => onMouseEnter(e, item)}
            onMouseLeave={onMouseLeave}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onContextMenu={(e) => e.preventDefault()} // Prevent default browser context menu
            className={`h-[72px] xs:h-[76px] sm:h-[84px] bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600 hover:border-sky-400 rounded-md flex flex-col items-center justify-center p-1 shadow-sm transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-sky-400 ${rarityColor ? `border-l-4 ${rarityColor.replace('text-', 'border-')}` : 'border-l-4 border-transparent'}`}
            aria-label={displayItem.name}
        >
            <GetSpellIcon iconName={displayItem.iconName} className={`w-1/2 h-1/2 ${displayItem.itemType === 'Resource' ? 'text-amber-300' : 'text-sky-300'} mb-0.5 xs:mb-1`} />
            <span className="text-[0.5rem] xs:text-[0.55rem] sm:text-[0.6rem] text-slate-200 text-center whitespace-normal w-full px-0.5 leading-tight">{displayItem.name}</span>
            {quantity && quantity > 0 && (
                <span className="absolute bottom-0 right-0 text-[0.5rem] xs:text-[0.55rem] sm:text-[0.6rem] font-bold text-white bg-sky-600 px-1 py-0.5 rounded-tl-md rounded-br-sm shadow">
                    {quantity}
                </span>
            )}
        </button>
    );
};

interface ItemTooltipProps {
    item: InventoryGridItemType;
    position: { x: number, y: number };
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position }) => {
    const isStackable = 'itemDef' in item;
    const displayItem = isStackable ? item.itemDef : item;
    const quantity = isStackable ? item.quantity : undefined;
    const itemAsEquipment = displayItem as Equipment;
    const itemAsConsumable = displayItem as MasterConsumableItem | UniqueConsumable;

    const uniqueItemDetails = !isStackable ? item as UniqueConsumable : undefined;
    const hasResourceCost = uniqueItemDetails && (displayItem.itemType === 'Consumable' || displayItem.itemType === 'Equipment') ? Boolean(uniqueItemDetails.resourceCost) : false;
    const resourceCostToDisplay = hasResourceCost && uniqueItemDetails ? uniqueItemDetails.resourceCost : [];


    const style: React.CSSProperties = {
        position: 'fixed',
        top: position.y + 10,
        left: position.x + 10,
        transform: 'translate(-50%, 0)',
        zIndex: 1050,
        maxWidth: '200px',
    };
    if (typeof window !== 'undefined') {
        if (position.x > window.innerWidth - 100) {
            style.left = 'auto';
            style.right = window.innerWidth - position.x + 5;
            style.transform = 'translate(50%, 0)';
        }
        if (position.y > window.innerHeight - 120) {
            style.top = 'auto';
            style.bottom = window.innerHeight - position.y + 5;
            style.transform = style.transform ? `${style.transform} translateY(-100%)` : 'translateY(-100%)';
        }
         if (position.x - 100 < 0) {
            style.left = 5;
            style.transform = 'translate(0,0)';
        }
    }

    return (
        <div style={style} className="bg-slate-800/95 p-1.5 xs:p-2 rounded-lg shadow-xl border-2 border-sky-500/70 text-slate-200 backdrop-blur-sm w-max max-w-[200px]">
            <div className="flex items-center mb-1 pb-1 border-b border-slate-600/80">
                <GetSpellIcon iconName={displayItem.iconName} className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1 xs:mr-1.5 flex-shrink-0" />
                <h5 className="font-bold text-sky-300 text-[0.65rem] xs:text-[0.7rem]">{displayItem.name} {quantity && `(x${quantity})`}</h5>
            </div>
            <p className="text-[0.55rem] xs:text-[0.6rem] text-slate-300 mb-1 italic">{displayItem.description}</p>

            {displayItem.itemType === 'Resource' && <p className="text-[0.55rem] xs:text-[0.6rem] text-amber-200">Type: Resource</p>}

            {displayItem.itemType === 'Consumable' && (
                <>
                    <p className="text-[0.55rem] xs:text-[0.6rem] text-lime-300">Type: Consumable</p>
                    <p className="text-[0.5rem] xs:text-[0.55rem]">Effect: {itemAsConsumable.effectType.replace(/_/g, ' ')}
                        {itemAsConsumable.magnitude !== undefined && ` (${itemAsConsumable.magnitude})`}
                        {itemAsConsumable.duration !== undefined && `, ${itemAsConsumable.duration}t`}
                    </p>
                    {itemAsConsumable.statusToCure && <p className="text-[0.5rem] xs:text-[0.55rem]">Cures: {itemAsConsumable.statusToCure}</p>}
                    {itemAsConsumable.buffToApply && <p className="text-[0.5rem] xs:text-[0.55rem]">Buffs: {itemAsConsumable.buffToApply}</p>}
                </>
            )}
            {displayItem.itemType === 'Equipment' && (
                <>
                    <p className="text-[0.55rem] xs:text-[0.6rem] text-orange-300">Type: Equipment</p>
                    <p className="text-[0.5rem] xs:text-[0.55rem]">Slot: {itemAsEquipment.slot}</p>
                    {itemAsEquipment.statsBoost && Object.keys(itemAsEquipment.statsBoost).length > 0 && (
                        <div className="text-[0.5rem] xs:text-[0.55rem]">
                            Stats: {renderStatsBoost(itemAsEquipment.statsBoost)}
                        </div>
                    )}
                </>
            )}
            {displayItem.itemType === 'LootChest' && (
                 <p className="text-[0.55rem] xs:text-[0.6rem] text-yellow-300">Level: {(displayItem as LootChestItem).level}</p>
            )}
             {hasResourceCost && resourceCostToDisplay && resourceCostToDisplay.length > 0 && (
                 <div className="mt-0.5 pt-0.5 border-t border-slate-700">
                    <p className="text-amber-400 font-semibold text-[0.45rem] xs:text-[0.5rem] mb-0.5">Craft Cost:</p>
                    {resourceCostToDisplay.map(rc => {
                        const resourceDef = MASTER_ITEM_DEFINITIONS[rc.itemId] as MasterResourceItem | undefined;
                        const name = resourceDef ? resourceDef.name : rc.type;
                        return(<span key={rc.itemId} className="mr-1 text-amber-200 text-[0.45rem] xs:text-[0.5rem]">{rc.quantity} {name}</span>)
                    })}
                 </div>
            )}
        </div>
    );
};

interface MainTabSummaryItemProps {
    icon: SpellIconName;
    name: string;
    colorClass?: string;
}
const MainTabSummaryItem: React.FC<MainTabSummaryItemProps> = ({ icon, name, colorClass = "text-slate-200" }) => (
    <div className={`flex items-center p-0.5 xs:p-1 bg-slate-800/70 rounded-md shadow-sm border border-slate-600/70 max-w-[60px] xs:max-w-[80px] sm:max-w-[100px] min-w-[45px] xs:min-w-[55px] sm:min-w-[65px] transition-all hover:border-current ${colorClass}`} title={name}>
        <GetSpellIcon iconName={icon} className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 mr-0.5 xs:mr-1 flex-shrink-0`} />
        <span className="text-[0.4rem] xs:text-[0.45rem] sm:text-[0.55rem] truncate">{name}</span>
    </div>
);

interface MainTabSectionProps {
    title: string;
    items: MainTabSummaryItemProps[];
    onManageClick: () => void;
    manageLabel: string;
    maxVisible?: number;
    emptyText?: string;
    iconColorClass?: string;
}
const MainTabSection: React.FC<MainTabSectionProps> = ({ title, items, onManageClick, manageLabel, maxVisible = 3, emptyText = "None.", iconColorClass }) => {
    const visibleItems = items.slice(0, maxVisible);
    const hiddenItemCount = items.length - visibleItems.length;

    return (
        <div className="p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
            <div className="flex justify-between items-center mb-0.5 xs:mb-1">
                <h4 className="text-[0.65rem] xs:text-[0.7rem] sm:text-xs font-semibold text-sky-200" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{title}</h4>
                <ActionButton onClick={onManageClick} variant="secondary" size="sm" className="!px-0.5 xs:!px-1 !py-0 text-[0.45rem] xs:text-[0.5rem] sm:text-[0.6rem]">
                    {manageLabel}
                </ActionButton>
            </div>
            {items.length === 0 ? (
                <p className="text-[0.55rem] xs:text-[0.6rem] sm:text-xs text-slate-400 italic">{emptyText}</p>
            ) : (
                <div className="flex flex-wrap gap-0.5">
                    {visibleItems.map(item => <MainTabSummaryItem key={item.name} {...item} colorClass={iconColorClass || item.colorClass} />)}
                    {hiddenItemCount > 0 && (
                        <div className="flex items-center justify-center p-0.5 bg-slate-800/70 rounded-md shadow-sm border border-slate-600/70 text-[0.5rem] xs:text-[0.55rem] sm:text-[0.65rem] text-slate-300 min-w-[20px] xs:min-w-[25px]">
                            +{hiddenItemCount}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  isOpen, onClose, player, effectiveStats, onEquipItem, onUnequipItem,
  maxRegisteredSpells, maxPreparedSpells, maxPreparedAbilities, onEditSpell,
  onPrepareSpell, onUnprepareSpell, onPrepareAbility, onUnprepareAbility,
  initialTab, onOpenSpellCraftingScreen,
  onOpenTraitCraftingScreen, canCraftNewTrait, onOpenLootChest,
  onUseConsumableFromInventory
}) => {
  const [activeTab, setActiveTab] = useState<CharacterSheetTab>(initialTab || 'Main');
  const [itemSelectionModalState, setItemSelectionModalState] = useState<{isOpen: boolean, slot: DetailedEquipmentSlot | null}>({isOpen: false, slot: null});
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<Quest | null>(null);

  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilterType>('All');
  const [selectedInventoryItemDetail, setSelectedInventoryItemDetail] = useState<InventoryGridItemType | null>(null);

  const [hoveredInventoryItem, setHoveredInventoryItem] = useState<InventoryGridItemType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);

  const [contextMenuState, setContextMenuState] = useState<{
      isOpen: boolean;
      item: InventoryGridItemType | null;
      position: { x: number; y: number } | null;
  }>({ isOpen: false, item: null, position: null });

  type EncyclopediaSubTabType = 'monsters' | 'items' | 'spells' | 'components';
  const [encyclopediaSubTab, setEncyclopediaSubTab] = useState<EncyclopediaSubTabType>('monsters');
  const [selectedEncyclopediaEntry, setSelectedEncyclopediaEntry] = useState<any | null>(null);
  const [encyclopediaSearchTerm, setEncyclopediaSearchTerm] = useState('');

  // State for new 'Main' tab UI
  const [currentTreeCategory, setCurrentTreeCategory] = useState<string>('core');
  const [selectedTalentDetails, setSelectedTalentDetails] = useState<any | null>(null); // Replace 'any' with a proper Talent type
  const [createTalentModalOpen, setCreateTalentModalOpen] = useState<boolean>(false);
  const [researchUnlocksModalOpen, setResearchUnlocksModalOpen] = useState<boolean>(false);

  // Helper functions for resource restoration
  const handleRestoreHealth = () => {
    // Filter consumables that restore HP
    const healthConsumables = player.items.filter(item => 
      item.itemType === 'Consumable' && 
      (item as any).effectType === 'HP_RESTORE'
    );
    
    // Also check stackable consumables in inventory
    const stackableHealthPotions = Object.entries(player.inventory).filter(([itemId, quantity]) => {
      if (quantity <= 0) return false;
      const itemDef = MASTER_ITEM_DEFINITIONS[itemId];
      return itemDef && itemDef.itemType === 'Consumable' && (itemDef as any).effectType === 'HP_RESTORE';
    });
    
    if (healthConsumables.length === 0 && stackableHealthPotions.length === 0) {
      alert('No health potions available in inventory!');
      return;
    }
    
    if (healthConsumables.length > 0) {
      onUseConsumableFromInventory(healthConsumables[0].id, null);
    } else if (stackableHealthPotions.length > 0) {
      onUseConsumableFromInventory(stackableHealthPotions[0][0], null);
    }
  };

  const handleRestoreMana = () => {
    const manaConsumables = player.items.filter(item => 
      item.itemType === 'Consumable' && 
      (item as any).effectType === 'MP_RESTORE'
    );
    
    const stackableManaPotions = Object.entries(player.inventory).filter(([itemId, quantity]) => {
      if (quantity <= 0) return false;
      const itemDef = MASTER_ITEM_DEFINITIONS[itemId];
      return itemDef && itemDef.itemType === 'Consumable' && (itemDef as any).effectType === 'MP_RESTORE';
    });
    
    if (manaConsumables.length === 0 && stackableManaPotions.length === 0) {
      alert('No mana potions available in inventory!');
      return;
    }
    
    if (manaConsumables.length > 0) {
      onUseConsumableFromInventory(manaConsumables[0].id, null);
    } else if (stackableManaPotions.length > 0) {
      onUseConsumableFromInventory(stackableManaPotions[0][0], null);
    }
  };

  const handleRestoreEnergy = () => {
    const energyConsumables = player.items.filter(item => 
      item.itemType === 'Consumable' && 
      (item as any).effectType === 'EP_RESTORE'
    );
    
    const stackableEnergyPotions = Object.entries(player.inventory).filter(([itemId, quantity]) => {
      if (quantity <= 0) return false;
      const itemDef = MASTER_ITEM_DEFINITIONS[itemId];
      return itemDef && itemDef.itemType === 'Consumable' && (itemDef as any).effectType === 'EP_RESTORE';
    });
    
    if (energyConsumables.length === 0 && stackableEnergyPotions.length === 0) {
      alert('No energy potions available in inventory!');
      return;
    }
    
    if (energyConsumables.length > 0) {
      onUseConsumableFromInventory(energyConsumables[0].id, null);
    } else if (stackableEnergyPotions.length > 0) {
      onUseConsumableFromInventory(stackableEnergyPotions[0][0], null);
    }
  };

  // Placeholder for talent data (to be replaced with actual data structure)
  const treeData: any = {
    core: [
      { id: 'core_1', name: 'Core Talent 1', tier: 1, connections: ['core_2'], type: 'passive', description: 'Description for Core Talent 1', effects: ['Effect A'], requirements: {} },
      { id: 'core_2', name: 'Core Talent 2', tier: 2, connections: [], type: 'active', description: 'Description for Core Talent 2', effects: ['Effect B'], requirements: { level: 5 } },
    ],
    combat: [
      { id: 'combat_1', name: 'Combat Talent 1', tier: 1, connections: [], type: 'active', description: 'Description for Combat Talent 1', effects: ['Effect C'], requirements: { body: 5 } },
    ]
    // Add other categories like 'utility' etc.
  };

  // === Talent System Functions (Adapted from ability-list.ts) ===

  const updateTalentDetailsPanel = (talentData: any) => {
    setSelectedTalentDetails(talentData);
  };

  const getTalentById = (talentId: string) => {
    for (const category in treeData) {
      const found = treeData[category].find((t:any) => t.id === talentId);
      if (found) return found;
    }
    return null;
  };

  const getTalentType = (talentId: string): string => {
    const talent = getTalentById(talentId);
    return talent ? talent.type : "Unknown";
  };

  const getTalentDescription = (talentId: string): string => {
    const talent = getTalentById(talentId);
    return talent ? talent.description : "No description found.";
  };

  const getTalentEffects = (talentId: string): string[] => {
    const talent = getTalentById(talentId);
    return talent ? talent.effects : [];
  };

  const getTalentRequirements = (talentId: string, tier: number): object => {
    // Tier might be used if requirements change by rank, not just base talent
    const talent = getTalentById(talentId);
    return talent ? talent.requirements : {};
  };

  const generateConnections = (talents: any[]): React.ReactNode => {
    // Basic placeholder for connections - in reality, this would involve SVG lines
    return <div className="absolute top-0 left-0 w-full h-full pointer-events-none"> {/* Container for SVG lines */}</div>;
  };

  const generateHorizontalTalentTree = (category: string): React.ReactNode => {
    const talentsInCategory = treeData[category] || [];
    if (talentsInCategory.length === 0) {
      return <p className="text-slate-400 italic">No talents available in this category yet.</p>;
    }

    // Group talents by tier for horizontal layout
    const tiers: { [key: number]: any[] } = {};
    talentsInCategory.forEach((talent:any) => {
      if (!tiers[talent.tier]) {
        tiers[talent.tier] = [];
      }
      tiers[talent.tier].push(talent);
    });

    return (
      <div className="relative"> {/* Added relative for absolute positioning of connections */}
        {generateConnections(talentsInCategory)} {/* Render connections */}
        <div className="flex space-x-4 overflow-x-auto pb-2"> {/* Horizontal scroll for tiers */}
          {Object.keys(tiers).sort((a,b) => parseInt(a) - parseInt(b)).map(tier => (
            <div key={tier} className="flex-shrink-0 w-40"> {/* Tier column */}
              <h5 className="text-sm font-semibold text-sky-200 mb-2 border-b border-slate-600 pb-1">Tier {tier}</h5>
              <div className="space-y-2">
                {tiers[parseInt(tier)].map((talent: any) => (
                  <button
                    key={talent.id}
                    onClick={() => updateTalentDetailsPanel(talent)}
                    className="w-full p-2 bg-slate-600 hover:bg-slate-500 rounded-md shadow text-left transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <p className="text-xs font-semibold text-green-300">{talent.name}</p>
                    <p className="text-[0.6rem] text-slate-300">{talent.type}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generateCreateTalentContent = (): React.ReactNode => {
    return (
      <>
        <p className="text-sm text-slate-300 mb-2">Define a new talent for the player.</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="talentName" className="block text-xs font-medium text-slate-200 mb-0.5">Talent Name</label>
            <input type="text" id="talentName" placeholder="Enter talent name" className="p-2 w-full bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm"/>
          </div>
          <div>
            <label htmlFor="talentCategory" className="block text-xs font-medium text-slate-200 mb-0.5">Category</label>
            <select id="talentCategory" defaultValue={currentTreeCategory} className="p-2 w-full bg-slate-600 border border-slate-500 rounded text-slate-100 text-sm">
              {Object.keys(treeData).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              {/* Allow creating new category? */}
            </select>
          </div>
          <div>
            <label htmlFor="talentTier" className="block text-xs font-medium text-slate-200 mb-0.5">Tier</label>
            <input type="number" id="talentTier" placeholder="1" min="1" defaultValue="1" className="p-2 w-full bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm"/>
          </div>
          <div>
            <label htmlFor="talentDescription" className="block text-xs font-medium text-slate-200 mb-0.5">Description</label>
            <textarea id="talentDescription" placeholder="Describe the talent's effects" className="p-2 w-full h-20 bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 text-sm"></textarea>
          </div>
           {/* Add more fields: type (passive/active), effects, requirements, icon, etc. */}
        </div>
      </>
    );
  };

  const generateResearchUnlocksContent = (): React.ReactNode => {
    return (
      <>
        <p className="text-sm text-slate-300 mb-2">Unlock new abilities, talent trees, or bonuses through research.</p>
        {/* Example Research Item */}
        <div className="mt-2 p-2 bg-slate-600/70 rounded-md border border-slate-500/50">
          <h5 className="text-sm font-semibold text-teal-300">Unlock: Advanced Combat Maneuvers</h5>
          <p className="text-xs text-slate-400 mb-1">Unlocks a new tier of combat talents.</p>
          <p className="text-xs text-amber-400">Cost: 10 Research Points, 500 Gold</p>
          <ActionButton
            onClick={() => console.log("Start research: Advanced Combat Maneuvers")}
            variant="primary"
            size="sm"
            className="mt-1.5 text-xs"
            disabled={true} // Example: player lacks resources
          >
            Start Research (Insufficient Points)
          </ActionButton>
        </div>
         {/* Add more research options dynamically */}
      </>
    );
  };

  // === END Talent System Functions ===


  useEffect(() => {
    if (isOpen && initialTab) {
        setActiveTab(initialTab);
        if (initialTab !== 'Quests') setSelectedQuestDetail(null);
        if (initialTab !== 'Inventory') {
            setInventorySearchTerm('');
            setInventoryFilter('All');
            setSelectedInventoryItemDetail(null);
            setHoveredInventoryItem(null);
            setTooltipPosition(null);
            setContextMenuState({ isOpen: false, item: null, position: null });
        }
        if (initialTab !== 'Encyclopedia') {
            setSelectedEncyclopediaEntry(null);
            setEncyclopediaSearchTerm('');
        }
    }
    if (!isOpen) {
        setSelectedQuestDetail(null);
        setInventorySearchTerm('');
        setInventoryFilter('All');
        setSelectedInventoryItemDetail(null);
        setHoveredInventoryItem(null);
        setTooltipPosition(null);
        setContextMenuState({ isOpen: false, item: null, position: null });
        setSelectedEncyclopediaEntry(null);
        setEncyclopediaSearchTerm('');
    }
  }, [isOpen, initialTab]);

  const handleCloseModal = () => {
    onClose();
  };


  const getCompatibleItemsForSlot = useCallback((slot: DetailedEquipmentSlot): Equipment[] => {
    const genericSlotTypes: GenericEquipmentSlot[] = [];
    if (['Head', 'Chest', 'Legs', 'Feet', 'Hands', 'Shoulder'].includes(slot)) genericSlotTypes.push('Armor');
    if (['Neck', 'Jewels', 'Belt', 'Accessory1', 'Accessory2'].includes(slot)) genericSlotTypes.push('Accessory');
    if (['WeaponLeft', 'WeaponRight'].includes(slot)) genericSlotTypes.push('Weapon');
    if (slot === 'Back') {
      genericSlotTypes.push('Armor', 'Accessory');
    }

    return player.items.filter(item =>
      item.itemType === 'Equipment' &&
      genericSlotTypes.includes((item as Equipment).slot) &&
      !Object.values(player.equippedItems).includes(item.id)
    ) as Equipment[];
  }, [player.items, player.equippedItems]);

  const handleEquipmentSlotClick = (slot: DetailedEquipmentSlot) => {
    const currentlyEquipped = player.equippedItems[slot];
    if (currentlyEquipped) {
      onUnequipItem(slot);
    } else {
      const compatibleItems = getCompatibleItemsForSlot(slot);
      if (compatibleItems.length === 1) {
        onEquipItem(compatibleItems[0].id, slot);
      } else if (compatibleItems.length > 1) {
        setItemSelectionModalState({ isOpen: true, slot });
      } else {
        // No compatible items to equip
      }
    }
  };

  const handleItemSelectForSlot = (itemId: string, slot: DetailedEquipmentSlot | null) => {
    if (slot) {
      onEquipItem(itemId, slot);
    }
    setItemSelectionModalState({ isOpen: false, slot: null });
  };
  
  const getInventoryGridItems = useCallback((): InventoryGridItemType[] => {
    let items: InventoryGridItemType[] = [];
    
    // Add stackable items from player.inventory
    Object.entries(player.inventory).forEach(([itemId, quantity]) => {
        if (quantity > 0) {
            const itemDef = MASTER_ITEM_DEFINITIONS[itemId];
            if (itemDef) {
                if (inventoryFilter === 'All' || itemDef.itemType === inventoryFilter) {
                    if (!inventorySearchTerm || itemDef.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())) {
                         items.push({ itemDef, quantity, rarity: itemDef.rarity });
                    }
                }
            }
        }
    });

    // Add unique items from player.items
    player.items.forEach(item => {
        if (inventoryFilter === 'All' || item.itemType === inventoryFilter) {
            if (!inventorySearchTerm || item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())) {
                // Ensure unique items also pass rarity if needed by InventoryGridSlot directly,
                // though the component itself accesses item.rarity for non-stackable items.
                // For consistency, we could add it here too.
                items.push({ ...item, rarity: item.rarity });
            }
        }
    });
    
    // Sort: Stackable Resources first, then Stackable Consumables, then Unique Consumables, then Equipment, then LootChests
    items.sort((a, b) => {
        const typeA = 'itemDef' in a ? a.itemDef.itemType : a.itemType;
        const typeB = 'itemDef' in b ? b.itemDef.itemType : b.itemType;
        const nameA = 'itemDef' in a ? a.itemDef.name : a.name;
        const nameB = 'itemDef' in b ? b.itemDef.name : b.name;

        const typeOrder = ['Resource', 'Consumable', 'Equipment', 'LootChest', 'QuestItem'];
        
        if (typeA !== typeB) {
            return typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB);
        }
        return nameA.localeCompare(nameB);
    });

    return items;
  }, [player.inventory, player.items, inventoryFilter, inventorySearchTerm]);

  const handleInventoryGridSlotClick = (item: InventoryGridItemType) => {
    // If context menu is open for this item, clicking again should probably close context menu or do nothing.
    // For now, it will try to open detail view.
    // The long press handler already closes detail view.
    if (contextMenuState.isOpen && contextMenuState.item === item) {
        setContextMenuState({ isOpen: false, item: null, position: null });
        return;
    }
    setSelectedInventoryItemDetail(item);
    setTooltipPosition(null); // Hide tooltip when opening detail modal
    setContextMenuState({ isOpen: false, item: null, position: null }); // Close context menu
  };

  const handleInventoryItemMouseEnter = (event: React.MouseEvent, item: InventoryGridItemType) => {
    setHoveredInventoryItem(item);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleInventoryItemMouseLeave = () => {
    setHoveredInventoryItem(null);
    setTooltipPosition(null);
  };

  const renderEncyclopediaContent = () => {
    let filteredEntries: any[] = [];
    let entryType = "";

    switch (encyclopediaSubTab) {
        case 'monsters':
            entryType = "Monster";
            filteredEntries = Object.values(player.bestiary).filter(m => 
                !encyclopediaSearchTerm || m.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
        case 'items':
            entryType = "Item";
            const allDisplayableItems: (MasterItemDefinition | GameItem)[] = [
                ...Object.values(MASTER_ITEM_DEFINITIONS),
                ...player.items
            ];
            // Remove duplicates by ID, preferring unique player items if IDs clash (though master IDs should be distinct)
            const uniqueDisplayableItems = Array.from(new Map(allDisplayableItems.map(item => [item.id, item])).values());
            
            filteredEntries = uniqueDisplayableItems.filter(i => 
                !encyclopediaSearchTerm || i.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
        case 'spells':
            entryType = "Spell";
            filteredEntries = player.spells.filter(s => 
                !encyclopediaSearchTerm || s.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
        case 'components':
            entryType = "Component";
            filteredEntries = player.discoveredComponents.filter(c => 
                !encyclopediaSearchTerm || c.name.toLowerCase().includes(encyclopediaSearchTerm.toLowerCase())
            ).sort((a,b) => a.name.localeCompare(b.name));
            break;
    }
    
    const renderEntryDetail = (entry: any) => {
        if (!entry) return <p className="text-slate-400 italic text-center">Select an entry to view details.</p>;
        // This is a basic detail view, can be expanded significantly
        return (
            <div className="p-3 bg-slate-800/70 rounded-md border border-slate-700">
                <div className="flex items-center mb-2">
                    <GetSpellIcon iconName={entry.iconName || DEFAULT_ENCYCLOPEDIA_ICON} className={`w-8 h-8 mr-3 ${getRarityColorClass(entry.rarity || 0)}`} />
                    <h4 className={`text-lg font-bold ${getRarityColorClass(entry.rarity || 0)}`}>{entry.name}</h4>
                </div>
                <p className="text-xs text-slate-300 mb-1 italic">{entry.description}</p>
                {entry.itemType && <p className="text-xs text-slate-400">Type: {entry.itemType}</p>}
                {entry.category && <p className="text-xs text-slate-400">Category: {entry.category} (Tier {entry.tier})</p>}
                {entry.manaCost !== undefined && <p className="text-xs text-slate-400">Mana Cost: {entry.manaCost}</p>}
                {entry.damage !== undefined && <p className="text-xs text-slate-400">Damage: {entry.damage} ({entry.damageType})</p>}
                {entry.level !== undefined && entryType === "Monster" && <p className="text-xs text-slate-400">Level: {entry.level}</p>}
                {entry.weakness && <p className="text-xs text-yellow-400">Weakness: {entry.weakness}</p>}
                {entry.resistance && <p className="text-xs text-sky-400">Resistance: {entry.resistance}</p>}
                {entry.vanquishedCount !== undefined && <p className="text-xs text-slate-400">Vanquished: {entry.vanquishedCount}</p>}
            </div>
        );
    };


    return (
        <div className="h-full flex flex-col">
            <div className="flex space-x-1 mb-2 p-1 bg-slate-800/50 rounded-md">
                {(['monsters', 'items', 'spells', 'components'] as EncyclopediaSubTabType[]).map(tab => (
                    <ActionButton key={tab} onClick={() => {setEncyclopediaSubTab(tab); setSelectedEncyclopediaEntry(null);}} variant={encyclopediaSubTab === tab ? 'primary' : 'secondary'} size="sm" className="flex-1 !py-1 text-xs">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </ActionButton>
                ))}
            </div>
            <input 
                type="text"
                placeholder={`Search ${encyclopediaSubTab}...`}
                value={encyclopediaSearchTerm}
                onChange={e => setEncyclopediaSearchTerm(e.target.value)}
                className="w-full p-2 mb-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-sm"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow overflow-hidden">
                <div className="overflow-y-auto styled-scrollbar space-y-1 pr-1 bg-slate-700/40 p-1.5 rounded-md h-[calc(70vh-180px)] md:h-auto">
                    {filteredEntries.length === 0 ? (
                        <p className="text-slate-400 italic text-center p-3">No {entryType.toLowerCase()} entries found matching criteria.</p>
                    ) : (
                        filteredEntries.map(entry => (
                            <button key={entry.id} onClick={() => setSelectedEncyclopediaEntry(entry)} 
                                    className={`w-full text-left p-1.5 rounded-md flex items-center transition-colors
                                                ${selectedEncyclopediaEntry?.id === entry.id ? 'bg-sky-700 text-white' : 'bg-slate-600/70 hover:bg-slate-500/70 text-slate-200'}`}>
                                <GetSpellIcon iconName={entry.iconName || DEFAULT_ENCYCLOPEDIA_ICON} className="w-4 h-4 mr-2 flex-shrink-0"/>
                                <span className="text-xs truncate">{entry.name}</span>
                            </button>
                        ))
                    )}
                </div>
                <div className="overflow-y-auto styled-scrollbar p-1 h-[calc(70vh-180px)] md:h-auto">
                    {selectedEncyclopediaEntry ? renderEntryDetail(selectedEncyclopediaEntry) : 
                        <div className="flex items-center justify-center h-full text-slate-500 italic">Select an entry to view details.</div>
                    }
                </div>
            </div>
        </div>
    );
  };


  const TABS: { id: CharacterSheetTab; label: string; icon: React.ReactNode }[] = [
    { id: 'Main', label: 'Main', icon: <UserIcon /> },
    { id: 'Inventory', label: 'Inventory', icon: <BagIcon /> },
    { id: 'Spells', label: 'Spells', icon: <WandIcon /> },
    { id: 'Abilities', label: 'Abilities', icon: <StarIcon /> },
    { id: 'Traits', label: 'Traits', icon: <StarIcon className="text-yellow-400"/> },
    { id: 'Quests', label: 'Quests', icon: <BookIcon /> },
    { id: 'Encyclopedia', label: 'Encyclopedia', icon: <CollectionIcon /> },
  ];


  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCloseModal} 
      title={
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-12 border-2 border-white/30 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
            <UserIcon className="w-8 h-8 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-lg font-bold mb-0">{player.name || 'Player'}</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-blue-400 font-semibold">Level {player.level} Human Adventurer</span>
              <span className="text-purple-400 font-medium">The Brave</span>
              <span className="text-green-400">{player.currentLocationId || 'Unknown'}</span>
              <span className="text-yellow-400">{player.gold.toLocaleString()} Gold</span>
              <span className="text-cyan-400">{player.essence.toLocaleString()} Essence</span>
            </div>
          </div>
        </div>
      } 
      size="6xl"
    >
      <div className="flex flex-col h-[85vh]">
        <div className="flex border-b-2 border-slate-600/80 mb-1.5 xs:mb-2 sm:mb-3 flex-wrap">
          {TABS.map(tab => (
            <SheetTabButton key={tab.id} icon={tab.icon} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        <div className="flex-grow overflow-hidden p-1">
          {activeTab === 'Main' && (
            <div className="h-full flex flex-col">
              {/* Main Content Layout */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-4 min-h-0 overflow-hidden">
                {/* Left Column: Character Stats */}
                <div className="space-y-2 sm:space-y-4 overflow-y-auto max-h-full">
                  {/* Core Stats & Attributes */}
                  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-blue-500/30 rounded-xl p-2 sm:p-3 flex-shrink-0 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:border-blue-400/50">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/50 rounded-lg flex items-center justify-center shadow-lg">
                          <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                        </div>
                        <h4 className="text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">Character Stats</h4>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {/* Core Vitals */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          <h5 className="text-emerald-300 text-xs font-bold uppercase tracking-wide">Vitals</h5>
                        </div>
                        
                        {/* Health */}
                        <div className="group bg-gradient-to-r from-emerald-900/40 to-green-900/40 border border-emerald-500/30 rounded-lg p-1.5 sm:p-2 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full shadow-sm"></div>
                              <span className="text-white font-semibold text-xs">Health</span>
                            </div>
                            <span className="text-emerald-300 text-xs font-bold">{player.hp} / {effectiveStats.maxHp}</span>
                          </div>
                          <div className="relative w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-emerald-500/20">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${Math.max(0, Math.min(100, (player.hp / effectiveStats.maxHp) * 100))}%` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                        
                        {/* Mana */}
                        <div className="group bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-lg p-1.5 sm:p-2 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full shadow-sm"></div>
                              <span className="text-white font-semibold text-xs">Mana</span>
                            </div>
                            <span className="text-blue-300 text-xs font-bold">{player.mp} / {effectiveStats.maxMp}</span>
                          </div>
                          <div className="relative w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-blue-500/20">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${Math.max(0, Math.min(100, (player.mp / effectiveStats.maxMp) * 100))}%` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                          </div>
                        </div>

                        {/* Energy */}
                        <div className="group bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-500/30 rounded-lg p-1.5 sm:p-2 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full shadow-sm"></div>
                              <span className="text-white font-semibold text-xs">Energy</span>
                            </div>
                            <span className="text-yellow-300 text-xs font-bold">{player.ep} / {effectiveStats.maxEp}</span>
                          </div>
                          <div className="relative w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-yellow-500/20">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${Math.max(0, Math.min(100, (player.ep / effectiveStats.maxEp) * 100))}%` }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                          </div>
                        </div>

                        {/* Restore Buttons */}
                        <div className="flex gap-1 mt-1.5 sm:mt-2">
                          <ActionButton 
                            onClick={handleRestoreHealth} 
                            variant="success" 
                            size="sm" 
                            className="flex-1 !text-xs !py-1 !px-1"
                          >
                            <HealIcon className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">HP</span>
                          </ActionButton>
                          <ActionButton 
                            onClick={handleRestoreMana} 
                            variant="primary" 
                            size="sm" 
                            className="flex-1 !text-xs !py-1 !px-1"
                          >
                            <WandIcon className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">MP</span>
                          </ActionButton>
                          <ActionButton 
                            onClick={handleRestoreEnergy} 
                            variant="warning" 
                            size="sm" 
                            className="flex-1 !text-xs !py-1 !px-1"
                          >
                            <ReflexIcon className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">EP</span>
                          </ActionButton>
                        </div>
                      </div>

                      {/* Core Attributes */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                          <h5 className="text-orange-300 text-xs font-bold uppercase tracking-wide">Attributes</h5>
                        </div>
                        
                        {/* Body */}
                        <div className="group bg-gradient-to-r from-red-900/40 to-rose-900/40 border border-red-500/30 rounded-lg p-1.5 sm:p-2 hover:border-red-400/50 transition-all duration-300 hover:shadow-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500/30 to-red-600/30 border border-red-500/50 rounded-lg flex items-center justify-center">
                                <BodyIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-300" />
                              </div>
                              <span className="text-white font-semibold text-xs">Body</span>
                            </div>
                            <div className="text-right">
                              <div className="text-red-300 text-sm font-bold">{effectiveStats.body}</div>
                              <div className="text-red-400/70 text-xs">+{effectiveStats.body - player.body}</div>
                            </div>
                          </div>
                        </div>

                        {/* Mind */}
                        <div className="group bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-lg p-1.5 sm:p-2 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/50 rounded-lg flex items-center justify-center">
                                <MindIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-300" />
                              </div>
                              <span className="text-white font-semibold text-xs">Mind</span>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-300 text-sm font-bold">{effectiveStats.mind}</div>
                              <div className="text-blue-400/70 text-xs">+{effectiveStats.mind - player.mind}</div>
                            </div>
                          </div>
                        </div>

                        {/* Reflex */}
                        <div className="group bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border border-yellow-500/30 rounded-lg p-1.5 sm:p-2 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 border border-yellow-500/50 rounded-lg flex items-center justify-center">
                                <ReflexIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-300" />
                              </div>
                              <span className="text-white font-semibold text-xs">Reflex</span>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-300 text-sm font-bold">{effectiveStats.reflex}</div>
                              <div className="text-yellow-400/70 text-xs">+{effectiveStats.reflex - player.reflex}</div>
                            </div>
                          </div>
                        </div>

                        {/* Combat Stats */}
                        <div className="mt-2 sm:mt-3 space-y-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                            <h5 className="text-purple-300 text-xs font-bold uppercase tracking-wide">Combat</h5>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1">
                            <div className="flex justify-between items-center p-1 bg-black/30 rounded border border-white/5">
                              <span className="text-white/80 text-xs">Phys Pow</span>
                              <span className="text-orange-300 text-xs font-bold">{effectiveStats.physicalPower}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 bg-black/30 rounded border border-white/5">
                              <span className="text-white/80 text-xs">Mag Pow</span>
                              <span className="text-purple-300 text-xs font-bold">{effectiveStats.magicPower}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 bg-black/30 rounded border border-white/5">
                              <span className="text-white/80 text-xs">Defense</span>
                              <span className="text-cyan-300 text-xs font-bold">{effectiveStats.defense}</span>
                            </div>
                            <div className="flex justify-between items-center p-1 bg-black/30 rounded border border-white/5">
                              <span className="text-white/80 text-xs">Speed</span>
                              <span className="text-green-300 text-xs font-bold">{effectiveStats.speed}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress and Experience */}
                  <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border border-yellow-500/30 rounded-lg p-2 sm:p-3 flex-shrink-0 shadow-lg">
                    <h4 className="text-yellow-300 text-xs font-semibold uppercase tracking-wide border-b border-yellow-500/20 pb-1 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500/20 border border-yellow-500/40 rounded flex items-center justify-center">
                        <StarIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-400" />
                      </div>
                      Character Progress
                    </h4>
                    <div className="bg-gradient-to-br from-yellow-800/60 to-amber-800/60 border border-yellow-500/40 rounded-lg p-2">
                      <div className="flex gap-2 items-start">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-600/60 to-amber-600/60 border border-yellow-500/70 rounded-lg flex items-center justify-center text-sm flex-shrink-0 shadow-md">
                          <span className="text-yellow-200 font-bold text-xs sm:text-sm">{player.level}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-yellow-300 text-xs font-semibold mb-1">Level {player.level}</div>
                          <div className="text-yellow-200/80 text-xs mb-1">Experience: {player.xp.toLocaleString()}</div>
                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between items-center">
                              <span className="text-yellow-200/90 text-xs">Spell Slots</span>
                              <span className="text-blue-300 text-xs font-bold">{player.spells.length}/{maxRegisteredSpells}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-yellow-200/90 text-xs">Trait Slots</span>
                              <span className="text-purple-300 text-xs font-bold">{player.traits.length}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column: Equipment */}
                <div className="space-y-2 sm:space-y-4 overflow-y-auto max-h-full">
                  <div className="bg-slate-800/40 border border-white/10 rounded-lg p-3 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white text-sm font-semibold uppercase tracking-wide">Equipment</h4>
                      <div className="flex gap-1">
                        <ActionButton variant="warning" size="sm" className="!text-xs !py-1">
                          Equipment Sets
                        </ActionButton>
                      </div>
                    </div>
                    <div className="grid grid-cols-[70px_1fr_70px] grid-rows-[auto_auto_auto_auto] gap-2.5 p-4 bg-slate-900/70 rounded-xl border-2 border-blue-500/40 min-h-[380px]">
                      {/* Left Side Equipment */}
                      <div className="flex flex-col gap-2 items-center">
                        <EquipmentSlotDisplay slot="Head" itemId={player.equippedItems.Head} allItems={player.items} onClick={() => handleEquipmentSlotClick('Head')} />
                        <EquipmentSlotDisplay slot="Neck" itemId={player.equippedItems.Neck} allItems={player.items} onClick={() => handleEquipmentSlotClick('Neck')} />
                        <EquipmentSlotDisplay slot="Shoulder" itemId={player.equippedItems.Shoulder} allItems={player.items} onClick={() => handleEquipmentSlotClick('Shoulder')} />
                        <EquipmentSlotDisplay slot="Back" itemId={player.equippedItems.Back} allItems={player.items} onClick={() => handleEquipmentSlotClick('Back')} />
                        <EquipmentSlotDisplay slot="Chest" itemId={player.equippedItems.Chest} allItems={player.items} onClick={() => handleEquipmentSlotClick('Chest')} />
                      </div>
                      
                      {/* Character Model Center */}
                      <div className="flex items-center justify-center p-3">
                        <div className="w-full max-w-[180px] h-[260px] bg-gradient-to-br from-slate-800/80 to-slate-700/80 border-2 border-blue-500/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                          <div className="flex flex-col items-center gap-2 text-white/50 text-center">
                            <UserIcon className="w-16 h-16 opacity-70" />
                            <span className="text-sm font-medium uppercase tracking-wide">Character Model</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Equipment */}
                      <div className="flex flex-col gap-2 items-center">
                        <EquipmentSlotDisplay slot="Hands" itemId={player.equippedItems.Hands} allItems={player.items} onClick={() => handleEquipmentSlotClick('Hands')} />
                        <EquipmentSlotDisplay slot="Belt" itemId={player.equippedItems.Belt} allItems={player.items} onClick={() => handleEquipmentSlotClick('Belt')} />
                        <EquipmentSlotDisplay slot="Legs" itemId={player.equippedItems.Legs} allItems={player.items} onClick={() => handleEquipmentSlotClick('Legs')} />
                        <EquipmentSlotDisplay slot="Feet" itemId={player.equippedItems.Feet} allItems={player.items} onClick={() => handleEquipmentSlotClick('Feet')} />
                        <EquipmentSlotDisplay slot="Jewels" itemId={player.equippedItems.Jewels} allItems={player.items} onClick={() => handleEquipmentSlotClick('Jewels')} />
                      </div>

                      {/* Bottom Equipment Row - Accessories */}
                      <div className="col-span-3 flex gap-2.5 justify-center items-center pt-2">
                        <EquipmentSlotDisplay slot="Accessory1" itemId={player.equippedItems.Accessory1} allItems={player.items} onClick={() => handleEquipmentSlotClick('Accessory1')} />
                        <EquipmentSlotDisplay slot="Accessory2" itemId={player.equippedItems.Accessory2} allItems={player.items} onClick={() => handleEquipmentSlotClick('Accessory2')} />
                      </div>

                      {/* Weapon Slots */}
                      <div className="col-span-3 flex gap-2.5 justify-center items-center pt-2">
                        <EquipmentSlotDisplay slot="WeaponLeft" itemId={player.equippedItems.WeaponLeft} allItems={player.items} onClick={() => handleEquipmentSlotClick('WeaponLeft')} />
                        <EquipmentSlotDisplay slot="WeaponRight" itemId={player.equippedItems.WeaponRight} allItems={player.items} onClick={() => handleEquipmentSlotClick('WeaponRight')} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Quick Actions & Info */}
                <div className="space-y-2 sm:space-y-4 overflow-y-auto max-h-full">
                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-purple-800/80 to-purple-900/80 border border-purple-500/30 rounded-xl p-2 sm:p-3 flex-shrink-0 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:border-purple-400/50">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500/30 to-purple-600/30 border border-purple-500/50 rounded-lg flex items-center justify-center shadow-lg">
                          <WandIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-300" />
                        </div>
                        <h4 className="text-purple-200 text-xs sm:text-sm font-bold uppercase tracking-wider">Actions</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <ActionButton 
                        onClick={onOpenSpellCraftingScreen} 
                        variant="secondary"
                        size="sm" 
                        className="w-full !text-xs !py-1.5"
                        icon={<WandIcon className="w-3 h-3" />}
                      >
                        <span className="hidden sm:inline">Spell Crafting</span>
                        <span className="sm:hidden">Spells</span>
                      </ActionButton>
                      
                      <ActionButton 
                        onClick={onOpenTraitCraftingScreen} 
                        variant="info"
                        size="sm" 
                        className="w-full !text-xs !py-1.5"
                        icon={<StarIcon className="w-3 h-3" />}
                        disabled={!canCraftNewTrait}
                      >
                        <span className="hidden sm:inline">Trait Crafting</span>
                        <span className="sm:hidden">Traits</span>
                      </ActionButton>
                      
                      <ActionButton 
                        onClick={() => onOpenLootChest && onOpenLootChest('default-chest')} 
                        variant="warning"
                        size="sm" 
                        className="w-full !text-xs !py-1.5"
                        icon={<ChestIcon className="w-3 h-3" />}
                      >
                        <span className="hidden sm:inline">Loot Chest</span>
                        <span className="sm:hidden">Loot</span>
                      </ActionButton>
                    </div>
                  </div>

                  {/* Player Information */}
                  <div className="bg-gradient-to-br from-teal-800/80 to-teal-900/80 border border-teal-500/30 rounded-xl p-2 sm:p-3 flex-shrink-0 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:border-teal-400/50">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-teal-500/30 to-teal-600/30 border border-teal-500/50 rounded-lg flex items-center justify-center shadow-lg">
                          <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-teal-300" />
                        </div>
                        <h4 className="text-teal-200 text-xs sm:text-sm font-bold uppercase tracking-wider">Player Info</h4>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="bg-black/20 rounded p-1.5 border border-teal-500/20">
                          <div className="text-teal-200/80 text-xs">Gold</div>
                          <div className="text-yellow-400 text-sm font-bold">{player.gold.toLocaleString()}</div>
                        </div>
                        <div className="bg-black/20 rounded p-1.5 border border-teal-500/20">
                          <div className="text-teal-200/80 text-xs">Location</div>
                          <div className="text-green-400 text-xs font-semibold truncate">{player.currentLocationId || 'Unknown'}</div>
                        </div>
                      </div>
                      
                      <div className="bg-black/20 rounded p-1.5 border border-teal-500/20">
                        <div className="text-teal-200/80 text-xs mb-1">Quick Stats</div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="text-white/80">Spells: <span className="text-blue-300 font-semibold">{player.spells.length}</span></div>
                          <div className="text-white/80">Traits: <span className="text-purple-300 font-semibold">{player.traits.length}</span></div>
                          <div className="text-white/80">Items: <span className="text-orange-300 font-semibold">{player.items.length}</span></div>
                          <div className="text-white/80">Abilities: <span className="text-green-300 font-semibold">{player.abilities.length}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'Inventory' && (
            <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row gap-2 mb-2 p-1.5 bg-slate-700/50 rounded-md border border-slate-600">
                    <div className="relative w-full flex-grow">
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={inventorySearchTerm}
                            onChange={e => setInventorySearchTerm(e.target.value)}
                            className="w-full p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-xs pr-7"
                        />
                        {inventorySearchTerm && (
                            <button
                                onClick={() => setInventorySearchTerm('')}
                                className="absolute inset-y-0 right-0 flex items-center justify-center w-7 h-full text-slate-400 hover:text-slate-200"
                                aria-label="Clear search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <select value={inventoryFilter} onChange={e => setInventoryFilter(e.target.value as InventoryFilterType)} className="w-full sm:w-auto p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-xs">
                        {(['All', 'Resource', 'Consumable', 'Equipment', 'LootChest', 'QuestItem'] as InventoryFilterType[]).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <ActionButton
                        onClick={() => console.log("Open advanced filters modal/sheet - TBD")}
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto !py-1.5 text-xs" // Match padding of select/input
                    >
                        Sort & Filter
                    </ActionButton>
                </div>
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5 xs:gap-2 flex-grow overflow-y-auto styled-scrollbar p-1 sm:p-1.5 bg-slate-800/40 rounded-md border border-slate-600/50 min-h-[200px]">
                    {getInventoryGridItems().map((gridItem, index) => {
                        const itemRarity = 'itemDef' in gridItem ? gridItem.itemDef.rarity : gridItem.rarity;
                        return (
                            <InventoryGridSlot
                                key={('itemDef' in gridItem ? gridItem.itemDef.id : gridItem.id) + '-' + index}
                                item={gridItem}
                                onClick={handleInventoryGridSlotClick}
                                onMouseEnter={handleInventoryItemMouseEnter}
                                onMouseLeave={handleInventoryItemMouseLeave}
                                rarity={itemRarity}
                                onLongPress={(longPressedItem, position) => {
                                    setContextMenuState({ isOpen: true, item: longPressedItem, position });
                                    setSelectedInventoryItemDetail(null);
                                    setTooltipPosition(null);
                                }}
                            />
                        );
                    })}
                     {getInventoryGridItems().length === 0 && <p className="col-span-full text-center text-slate-400 italic py-4">Inventory is empty or no items match filter.</p>}
                </div>
                 {hoveredInventoryItem && tooltipPosition && !contextMenuState.isOpen && <ItemTooltip item={hoveredInventoryItem} position={tooltipPosition}/>}
                 {selectedInventoryItemDetail && (
                    <Modal isOpen={true} onClose={() => setSelectedInventoryItemDetail(null)} title={'itemDef' in selectedInventoryItemDetail ? selectedInventoryItemDetail.itemDef.name : selectedInventoryItemDetail.name} size="md">
                        <ItemCard 
                            item={'itemDef' in selectedInventoryItemDetail ? selectedInventoryItemDetail.itemDef : selectedInventoryItemDetail}
                            quantity={'itemDef' in selectedInventoryItemDetail ? selectedInventoryItemDetail.quantity : undefined}
                            onUseItemFromInventory={onUseConsumableFromInventory}
                            onOpenLootChest={onOpenLootChest}
                            onQuickEquip={(equip) => {
                                const slotType = equip.slot;
                                const availableSlots = GENERIC_TO_DETAILED_SLOT_MAP[slotType].filter(s => !player.equippedItems[s]);
                                if (availableSlots.length > 0) {
                                    onEquipItem(equip.id, availableSlots[0]);
                                } else {
                                    // Maybe prompt to replace or just show message
                                    console.log("No free slot of type", slotType);
                                }
                                setSelectedInventoryItemDetail(null);
                            }}
                            isDetailView={true}
                         />
                    </Modal>
                 )}
            </div>
          )}
          {activeTab === 'Spells' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <SpellbookDisplay
                    spells={player.spells.filter(s => !player.preparedSpellIds.includes(s.id))}
                    playerMana={player.mp} title="Spell Collection (Not Prepared)"
                    onPrepareSpell={onPrepareSpell} onEditSpell={onEditSpell}
                    canPrepareMore={player.preparedSpellIds.length < maxPreparedSpells}
                    preparedSpellIds={player.preparedSpellIds}
                    emptyStateMessage="No other spells in your collection."
                />
                <SpellbookDisplay
                    spells={player.spells.filter(s => player.preparedSpellIds.includes(s.id))}
                    playerMana={player.mp} title="Prepared Spells"
                    onUnprepareSpell={onUnprepareSpell} onEditSpell={onEditSpell}
                    preparedSpellIds={player.preparedSpellIds}
                    emptyStateMessage="No spells currently prepared."
                />
                 {player.spells.length < maxRegisteredSpells && onOpenSpellCraftingScreen && (
                    <div className="md:col-span-2 mt-2 text-center">
                        <ActionButton onClick={onOpenSpellCraftingScreen} variant="success" icon={<WandIcon />}>
                            Craft New Spell ({player.spells.length}/{maxRegisteredSpells})
                        </ActionButton>
                    </div>
                 )}
            </div>
          )}
          {activeTab === 'Abilities' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AbilityBookDisplay
                    abilities={player.abilities.filter(a => !player.preparedAbilityIds.includes(a.id))}
                    playerEp={player.ep} title="Ability Collection (Not Prepared)"
                    onPrepareAbility={onPrepareAbility}
                    canPrepareMore={player.preparedAbilityIds.length < maxPreparedAbilities}
                    preparedAbilityIds={player.preparedAbilityIds}
                    emptyStateMessage="No other abilities known."
                />
                <AbilityBookDisplay
                    abilities={player.abilities.filter(a => player.preparedAbilityIds.includes(a.id))}
                    playerEp={player.ep} title="Prepared Abilities"
                    onUnprepareAbility={onUnprepareAbility}
                    preparedAbilityIds={player.preparedAbilityIds}
                    emptyStateMessage="No abilities currently prepared."
                />
            </div>
          )}
          {activeTab === 'Traits' && (
            <div className="p-1 xs:p-2">
                <h3 className="text-lg font-semibold text-yellow-200 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Player Traits</h3>
                {player.traits.length === 0 ? (
                    <p className="text-slate-400 italic">No traits defined yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 xs:gap-2">
                        {player.traits.map(trait => (
                            <div key={trait.id} className={`p-2 rounded-lg shadow-md border ${getRarityColorClass(trait.rarity).replace('text-','border-')}/60 bg-slate-700/70`}>
                                <div className="flex items-center mb-1">
                                    <GetSpellIcon iconName={trait.iconName || DEFAULT_TRAIT_ICON} className={`w-4 h-4 mr-2 ${getRarityColorClass(trait.rarity)}`} />
                                    <h4 className={`text-sm font-semibold ${getRarityColorClass(trait.rarity)}`}>{trait.name}</h4>
                                </div>
                                <p className="text-[0.65rem] xs:text-xs text-slate-300 leading-snug">{trait.description}</p>
                                {trait.tags && trait.tags.length > 0 && <p className="text-[0.6rem] text-purple-300 mt-1">Tags: {trait.tags.join(', ')}</p>}
                                <p className="text-[0.6rem] text-slate-400">Rarity: {trait.rarity}</p>
                            </div>
                        ))}
                    </div>
                )}
                 {canCraftNewTrait && onOpenTraitCraftingScreen && (
                    <div className="mt-3 text-center">
                        <ActionButton onClick={onOpenTraitCraftingScreen} variant="success" icon={<StarIcon />}>
                            Define New Trait
                        </ActionButton>
                    </div>
                 )}
            </div>
          )}
          {activeTab === 'Quests' && (
             <div className="p-1 xs:p-2">
                <h3 className="text-lg font-semibold text-orange-200 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Active Quests</h3>
                {player.quests.filter(q => q.status === 'active').length === 0 ? <p className="text-slate-400 italic">No active quests.</p> : (
                    <ul className="space-y-1.5">
                        {player.quests.filter(q => q.status === 'active').map(q => (
                            <li key={q.id} onClick={() => setSelectedQuestDetail(q)} className="p-1.5 xs:p-2 bg-slate-700/80 rounded-md hover:bg-slate-600/80 cursor-pointer shadow border border-slate-600/70">
                                <div className="flex items-center">
                                    <GetSpellIcon iconName={q.iconName} className="w-4 h-4 mr-2 text-yellow-400"/>
                                    <span className={`text-sm font-medium ${q.isMainQuest ? 'text-yellow-300' : 'text-slate-100'}`}>{q.title}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                 {selectedQuestDetail && (
                    <Modal isOpen={true} onClose={() => setSelectedQuestDetail(null)} title={selectedQuestDetail.title} size="lg">
                        <div className="flex items-center mb-2">
                            <GetSpellIcon iconName={selectedQuestDetail.iconName} className="w-6 h-6 mr-2 text-yellow-400"/>
                            <h3 className={`text-xl font-bold ${selectedQuestDetail.isMainQuest ? 'text-yellow-300' : 'text-sky-300'}`}>{selectedQuestDetail.title}</h3>
                        </div>
                        {selectedQuestDetail.isMainQuest && <p className="text-xs text-yellow-500 mb-1 uppercase tracking-wider">Main Story Quest</p>}
                        <p className="text-sm text-slate-300 mb-3 leading-relaxed">{selectedQuestDetail.description}</p>
                        <h5 className="text-md font-semibold text-slate-200 mb-1">Objectives:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 pl-2">
                            {selectedQuestDetail.objectives.map((obj, index) => <li key={index}>{obj}</li>)}
                        </ul>
                    </Modal>
                 )}
            </div>
          )}
          {activeTab === 'Encyclopedia' && renderEncyclopediaContent()}
        </div>
      </div>
      {itemSelectionModalState.isOpen && itemSelectionModalState.slot && (
        <ItemSelectionSubModal
          isOpen={true}
          onClose={() => setItemSelectionModalState({isOpen: false, slot: null})}
          targetSlot={itemSelectionModalState.slot}
          compatibleItems={getCompatibleItemsForSlot(itemSelectionModalState.slot)}
          onSelectItem={handleItemSelectForSlot}
        />
      )}
      {contextMenuState.isOpen && (
          <>
              <div
                  className="fixed inset-0 bg-black/30 z-[1090]"
                  onClick={() => setContextMenuState({ isOpen: false, item: null, position: null })}
              />
              <ItemContextMenu
                  isOpen={contextMenuState.isOpen}
                  item={contextMenuState.item}
                  position={contextMenuState.position}
                  onClose={() => setContextMenuState({ isOpen: false, item: null, position: null })}
                  onUseItem={(itemToUse) => {
                      if (itemToUse.itemType === 'Consumable') {
                          // Determine if it's a stackable master item or a unique game item
                          const idToUse = 'id' in itemToUse ? itemToUse.id : (itemToUse as UniqueConsumable).id;
                           // For stackable items (MasterItemDefinition), item.id is the masterId
                           // For unique items (GameItem), item.id is the unique instance id
                           // onUseConsumableFromInventory expects the item's actual ID (master for stackable, unique for non-stackable GameItem)
                          onUseConsumableFromInventory(idToUse, null);
                      }
                      setContextMenuState({ isOpen: false, item: null, position: null });
                  }}
                  onEquipItem={(itemToEquip) => {
                      const slotType = itemToEquip.slot;
                      // Find primary slot first
                      let targetDetailedSlot = GENERIC_TO_DETAILED_SLOT_MAP[slotType]?.[0];

                      // Check if primary slot is available
                      if (targetDetailedSlot && player.equippedItems[targetDetailedSlot]) {
                          // If primary is taken, check other compatible slots
                          const availableSlots = GENERIC_TO_DETAILED_SLOT_MAP[slotType].filter(s => !player.equippedItems[s]);
                          if (availableSlots.length > 0) {
                              targetDetailedSlot = availableSlots[0];
                          } else {
                              // If all specific slots for this generic type are taken, use the primary (will force unequip or fail)
                              // Or, for simplicity, we just use the first one which might be occupied.
                              // The onEquipItem handler should ideally handle replacement logic or it will fail if slot is occupied.
                              // For this quick action, let's prioritize an empty slot. If none, use the first one.
                              targetDetailedSlot = GENERIC_TO_DETAILED_SLOT_MAP[slotType]?.[0];
                          }
                      }

                      if (targetDetailedSlot) {
                          onEquipItem(itemToEquip.id, targetDetailedSlot);
                      } else {
                          console.warn("No valid detailed slot found for generic slot:", slotType);
                          // Fallback: open the detail view for this item
                          setSelectedInventoryItemDetail(contextMenuState.item);
                      }
                      setContextMenuState({ isOpen: false, item: null, position: null });
                  }}
              />
          </>
      )}
    </Modal>
  );
};

// ItemContextMenu Component (defined inside CharacterSheetModal or imported)
interface ItemContextMenuProps {
    isOpen: boolean;
    item: InventoryGridItemType | null;
    position: { x: number; y: number } | null;
    onClose: () => void;
    onUseItem: (item: MasterItemDefinition | GameItem) => void; // Allow both types from InventoryGridItemType
    onEquipItem: (item: Equipment) => void;
}

const ItemContextMenu: React.FC<ItemContextMenuProps> = ({ isOpen, item, position, onClose, onUseItem, onEquipItem }) => {
    if (!isOpen || !item || !position) return null;

    const displayItem = 'itemDef' in item ? item.itemDef : item;
    const canUse = displayItem.itemType === 'Consumable';
    // Ensure that the item is actually an Equipment type before casting
    const canEquip = displayItem.itemType === 'Equipment';

    const style: React.CSSProperties = {
        position: 'fixed',
        top: Math.min(position.y, window.innerHeight - 80), // Keep menu on screen
        left: Math.min(position.x, window.innerWidth - 130), // Keep menu on screen
        transform: 'translate(-50%, -100%)', // Position above and centered on the press point
        zIndex: 1100,
        minWidth: '120px'
    };
    // Adjust transform if too close to top
    if (position.y < 80) { // If too close to the top, display below
        style.transform = 'translate(-50%, 10px)';
    }


    return (
        <div style={style} className="bg-slate-800 border-2 border-sky-500 rounded-md shadow-lg p-1.5 space-y-1">
            {canUse && (
                <ActionButton onClick={() => onUseItem(displayItem)} size="sm" variant="success" className="w-full !py-1 text-xs">Use</ActionButton>
            )}
            {canEquip && (
                <ActionButton onClick={() => onEquipItem(displayItem as Equipment)} size="sm" variant="primary" className="w-full !py-1 text-xs">Equip</ActionButton>
            )}
            {(!canUse && !canEquip) && <p className="text-slate-400 text-xs italic text-center px-2 py-1">No quick actions</p>}
            <ActionButton onClick={onClose} size="sm" variant="secondary" className="w-full !py-1 text-xs mt-1">Cancel</ActionButton>
        </div>
    );
};

