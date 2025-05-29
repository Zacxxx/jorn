
import React, { useState, useEffect, useCallback } from 'react';
import { Player, PlayerEffectiveStats, DetailedEquipmentSlot, GameItem, Equipment, Spell, ResourceType, Consumable, Quest, CharacterSheetTab, SpellIconName, Ability, EquipmentSlot as GenericEquipmentSlot, ActiveStatusEffect, InventoryFilterType, ItemType, MasterItemDefinition, MasterResourceItem, MasterConsumableItem, LootChestItem, UniqueConsumable, ResourceCost, SpellComponent, Enemy } from '../types';
import Modal from '../ui/Modal';
import ActionButton from '../ui/ActionButton';
import {
    GetSpellIcon, UserIcon, GearIcon, BagIcon, WandIcon, StarIcon, BookIcon, MindIcon,
    HealIcon, SpeedIcon, SwordSlashIcon, ShieldIcon, BodyIcon, ReflexIcon, CheckmarkCircleIcon,
    SearchIcon, FilterListIcon, CollectionIcon, SkullIcon, ChestIcon, FlaskIcon, AtomIcon
} from './IconComponents';
import {
    DETAILED_EQUIPMENT_SLOTS_LEFT_COL, DETAILED_EQUIPMENT_SLOTS_RIGHT_COL,
    DETAILED_SLOT_PLACEHOLDER_ICONS, RESOURCE_ICONS, FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL, STATUS_EFFECT_ICONS, DEFAULT_ENCYCLOPEDIA_ICON, GENERIC_TO_DETAILED_SLOT_MAP,
    DEFAULT_TRAIT_ICON
} from '../constants';
import SpellbookDisplay, { SpellCard } from './SpellbookDisplay';
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
  isLoading: boolean;
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
  const boosts = Object.entries(statsBoost)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} +${value}`)
    .join(', ');
  return boosts ? <p className="text-[0.6rem] xs:text-[0.65rem] text-green-300">{boosts}</p> : null;
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
  const cardClasses = `bg-slate-700/90 p-1.5 xs:p-2 rounded-lg shadow-md border border-slate-600/70 flex flex-col justify-between transition-all duration-150 hover:border-sky-400`;

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
      <div>
        <div className="flex items-center mb-1 xs:mb-1.5">
          <GetSpellIcon iconName={item.iconName} className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 mr-1 xs:mr-1.5 text-sky-200 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <h5 className="text-[0.65rem] xs:text-[0.7rem] sm:text-xs font-semibold text-slate-100 truncate">{item.name} {quantity && quantity > 1 && `(x${quantity})`}</h5>
            <p className="text-[0.55rem] xs:text-[0.6rem] sm:text-[0.65rem] text-slate-400">{item.itemType}</p>
          </div>
        </div>
        {!isCompact && <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-slate-300 mb-1 leading-snug">{item.description}</p>}

        {item.itemType === 'Consumable' && (
          <>
            <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-lime-300">Effect: {(itemAsMasterConsumable).effectType.replace(/_/g, ' ')}
              {(itemAsMasterConsumable).magnitude !== undefined && ` (${(itemAsMasterConsumable).magnitude})`}
              {(itemAsMasterConsumable).duration !== undefined && `, ${(itemAsMasterConsumable).duration}t`}
            </p>
            {(itemAsMasterConsumable).statusToCure && <p className="text-[0.55rem] xs:text-[0.6rem] sm:text-[0.65rem] text-slate-400">Cures: {(itemAsMasterConsumable).statusToCure}</p>}
            {(itemAsMasterConsumable).buffToApply && <p className="text-[0.55rem] xs:text-[0.6rem] sm:text-[0.65rem] text-slate-400">Buffs: {(itemAsMasterConsumable).buffToApply}</p>}
          </>
        )}
        {item.itemType === 'Equipment' && (
          <>
            <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-orange-300">Slot: {(itemAsEquipment).slot}</p>
            {(itemAsEquipment).statsBoost && renderStatsBoost((itemAsEquipment).statsBoost)}
          </>
        )}
        {item.itemType === 'LootChest' && (
            <p className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs text-yellow-300">Level: {itemAsLootChest.level}</p>
        )}
      </div>
      {itemHasResourceCost && resourceCostToDisplay && resourceCostToDisplay.length > 0 && !isCombatContext && (
        <div className="mt-1 xs:mt-1.5 pt-1 xs:pt-1.5 border-t border-slate-600">
          <p className="text-[0.55rem] xs:text-[0.6rem] sm:text-[0.65rem] text-amber-300 font-medium mb-0.5">Cost:</p>
          <div className="flex flex-wrap gap-0.5">
            {resourceCostToDisplay.map(cost => {
                 const resourceDef = MASTER_ITEM_DEFINITIONS[cost.itemId] as MasterResourceItem | undefined;
                 const name = resourceDef ? resourceDef.name : cost.type;
                 const icon = resourceDef ? resourceDef.iconName : RESOURCE_ICONS[cost.itemId] || 'Default';
                return (
                  <div key={cost.itemId} className="flex items-center text-[0.5rem] xs:text-[0.55rem] sm:text-[0.6rem] text-amber-200 bg-slate-600/70 px-1 py-0.5 rounded" title={`${cost.quantity} ${name}`}>
                    <GetSpellIcon iconName={icon} className="w-1.5 h-1.5 xs:w-2 xs:h-2 mr-0.5 opacity-70" />
                    {cost.quantity} <span className="ml-0.5 opacity-60">{name.split(' ')[0]}</span>
                  </div>
                );
            })}
          </div>
        </div>
      )}
      {canUseConsumable && (
        <div className="mt-1 xs:mt-1.5">
          <ActionButton onClick={handleMainAction} size="sm" variant="success" className="w-full !py-0.5 text-[0.6rem] xs:text-[0.65rem]">
            Use
          </ActionButton>
        </div>
      )}
      {canOpenLootChest && onOpenLootChest && itemAsLootChest.id && (
        <div className="mt-1 xs:mt-1.5">
             <ActionButton onClick={handleMainAction} size="sm" variant="primary" icon={<ChestIcon className="w-3 h-3"/>} className="w-full !py-0.5 text-[0.6rem] xs:text-[0.65rem]">
                Open Chest
            </ActionButton>
        </div>
      )}
      {isDetailView && item.itemType === 'Equipment' && onQuickEquip && (
        <div className="mt-1 xs:mt-1.5 pt-1 xs:pt-1.5 border-t border-slate-600">
            <ActionButton
                onClick={() => onQuickEquip(itemAsEquipment)}
                size="sm"
                variant="success"
                className="w-full !py-0.5 text-[0.6rem] xs:text-[0.65rem]"
                icon={<GearIcon className="w-2.5 h-2.5 xs:w-3 xs:h-3"/>}
            >
            Equip
            </ActionButton>
        </div>
      )}
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
}

const InventoryGridSlot: React.FC<InventoryGridSlotProps> = ({ item, onClick, onMouseEnter, onMouseLeave }) => {
    const isStackable = 'itemDef' in item;
    const displayItem = isStackable ? item.itemDef : item;
    const quantity = isStackable ? item.quantity : undefined;

    return (
        <button
            onClick={() => onClick(item)}
            onMouseEnter={(e) => onMouseEnter(e, item)}
            onMouseLeave={onMouseLeave}
            className="h-[56px] xs:h-[60px] sm:h-[68px] bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600 hover:border-sky-400 rounded-md flex flex-col items-center justify-center p-0.5 shadow-sm transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-sky-400"
            aria-label={displayItem.name}
        >
            <GetSpellIcon iconName={displayItem.iconName} className={`w-3/5 h-3/5 ${displayItem.itemType === 'Resource' ? 'text-amber-300' : 'text-sky-300'} mb-0 xs:mb-0.5`} />
            <span className="text-[0.4rem] xs:text-[0.45rem] sm:text-[0.5rem] text-slate-200 text-center truncate w-full px-0.5">{displayItem.name}</span>
            {quantity && quantity > 0 && (
                <span className="absolute bottom-0 right-0 text-[0.45rem] xs:text-[0.5rem] sm:text-[0.55rem] font-bold text-white bg-sky-600 px-0.5 py-0 xs:px-1 rounded-tl-md rounded-br-sm shadow">
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
    const resourceCostToDisplay = hasResourceCost ? uniqueItemDetails.resourceCost : [];


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
  isLoading, initialTab, onOpenSpellCraftingScreen,
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

  type EncyclopediaSubTabType = 'monsters' | 'items' | 'spells' | 'components';
  const [encyclopediaSubTab, setEncyclopediaSubTab] = useState<EncyclopediaSubTabType>('monsters');
  const [selectedEncyclopediaEntry, setSelectedEncyclopediaEntry] = useState<any | null>(null);
  const [encyclopediaSearchTerm, setEncyclopediaSearchTerm] = useState('');


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
                         items.push({ itemDef, quantity });
                    }
                }
            }
        }
    });

    // Add unique items from player.items
    player.items.forEach(item => {
        if (inventoryFilter === 'All' || item.itemType === inventoryFilter) {
            if (!inventorySearchTerm || item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())) {
                items.push(item);
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
    setSelectedInventoryItemDetail(item);
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
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Character Sheet" size="5xl">
      <div className="flex flex-col min-h-[75vh]">
        <div className="flex border-b-2 border-slate-600/80 mb-1.5 xs:mb-2 sm:mb-3 flex-wrap">
          {TABS.map(tab => (
            <SheetTabButton key={tab.id} icon={tab.icon} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        <div className="flex-grow overflow-y-auto styled-scrollbar p-1">
          {activeTab === 'Main' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2">
                <div className="lg:col-span-1 space-y-1 xs:space-y-1.5 sm:space-y-2">
                    <VitalStatisticsDisplay player={player} stats={effectiveStats} />
                    <AttributesDisplay player={player} stats={effectiveStats} />
                </div>
                <div className="lg:col-span-2 p-1 xs:p-1.5 sm:p-2 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
                    <h4 className="text-[0.7rem] xs:text-xs sm:text-sm font-semibold text-sky-200 mb-1 xs:mb-1.5" style={{fontFamily: "'Inter Tight', sans-serif"}}>Equipment</h4>
                    <div className="grid grid-cols-2 gap-0.5 xs:gap-1 sm:gap-1.5">
                        <div className="space-y-0.5 xs:space-y-1 sm:space-y-1.5">
                        {DETAILED_EQUIPMENT_SLOTS_LEFT_COL.map(slot => (
                            <EquipmentSlotDisplay key={slot} slot={slot} itemId={player.equippedItems[slot]} allItems={player.items} onClick={() => handleEquipmentSlotClick(slot)} />
                        ))}
                        </div>
                        <div className="space-y-0.5 xs:space-y-1 sm:space-y-1.5">
                        {DETAILED_EQUIPMENT_SLOTS_RIGHT_COL.map(slot => (
                            <EquipmentSlotDisplay key={slot} slot={slot} itemId={player.equippedItems[slot]} allItems={player.items} onClick={() => handleEquipmentSlotClick(slot)} />
                        ))}
                        <EquipmentSlotDisplay slot="WeaponLeft" itemId={player.equippedItems.WeaponLeft} allItems={player.items} onClick={() => handleEquipmentSlotClick('WeaponLeft')} className="mt-1 xs:mt-1.5 sm:mt-2 col-span-1"/>
                        <EquipmentSlotDisplay slot="WeaponRight" itemId={player.equippedItems.WeaponRight} allItems={player.items} onClick={() => handleEquipmentSlotClick('WeaponRight')} className="mt-1 xs:mt-1.5 sm:mt-2 col-span-1"/>
                        </div>
                    </div>
                     <div className="mt-2 xs:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 xs:gap-1.5">
                        <MainTabSection title="Prepared Spells" items={player.spells.filter(s => player.preparedSpellIds.includes(s.id)).map(s => ({icon: s.iconName, name: s.name, colorClass: 'text-sky-300'}))} onManageClick={() => setActiveTab('Spells')} manageLabel="Manage Spells" />
                        <MainTabSection title="Prepared Abilities" items={player.abilities.filter(a => player.preparedAbilityIds.includes(a.id)).map(a => ({icon: a.iconName, name: a.name, colorClass: 'text-yellow-300'}))} onManageClick={() => setActiveTab('Abilities')} manageLabel="Manage Abilities" />
                     </div>
                </div>
            </div>
          )}
          {activeTab === 'Inventory' && (
            <div className="flex flex-col h-full">
                <div className="flex flex-col sm:flex-row gap-2 mb-2 p-1.5 bg-slate-700/50 rounded-md border border-slate-600">
                    <input type="text" placeholder="Search inventory..." value={inventorySearchTerm} onChange={e => setInventorySearchTerm(e.target.value)} className="flex-grow p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 text-xs"/>
                    <select value={inventoryFilter} onChange={e => setInventoryFilter(e.target.value as InventoryFilterType)} className="p-1.5 bg-slate-600 border border-slate-500 rounded-md text-slate-100 text-xs">
                        {(['All', 'Resource', 'Consumable', 'Equipment', 'LootChest', 'QuestItem'] as InventoryFilterType[]).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-1 xs:gap-1.5 flex-grow overflow-y-auto styled-scrollbar p-1.5 bg-slate-800/40 rounded-md border border-slate-600/50 min-h-[200px]">
                    {getInventoryGridItems().map((gridItem, index) => (
                         <InventoryGridSlot key={('itemDef' in gridItem ? gridItem.itemDef.id : gridItem.id) + '-' + index} item={gridItem} onClick={handleInventoryGridSlotClick} onMouseEnter={handleInventoryItemMouseEnter} onMouseLeave={handleInventoryItemMouseLeave}/>
                    ))}
                     {getInventoryGridItems().length === 0 && <p className="col-span-full text-center text-slate-400 italic py-4">Inventory is empty or no items match filter.</p>}
                </div>
                 {hoveredInventoryItem && tooltipPosition && <ItemTooltip item={hoveredInventoryItem} position={tooltipPosition}/>}
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
    </Modal>
  );
};
