import React, { useState, useEffect, useCallback } from 'react';
import { Player, PlayerEffectiveStats, DetailedEquipmentSlot, GameItem, Equipment, Spell, ResourceType, Consumable, Quest, CharacterSheetTab, SpellIconName, Ability, EquipmentSlot as GenericEquipmentSlot, ActiveStatusEffect, InventoryFilterType, ItemType, EncyclopediaSubTabId } from '../types';
import Modal from './Modal';
import ActionButton from './ActionButton';
import { 
    GetSpellIcon, UserIcon, GearIcon, BagIcon, WandIcon, StarIcon, BookIcon, MindIcon,
    HealIcon, SpeedIcon, SwordSlashIcon, ShieldIcon, BodyIcon, ReflexIcon, CheckmarkCircleIcon,
    SearchIcon, FilterListIcon, CollectionIcon, SkullIcon, BookOpenIcon
} from './IconComponents';
import { 
    DETAILED_EQUIPMENT_SLOTS_LEFT_COL, DETAILED_EQUIPMENT_SLOTS_RIGHT_COL, 
    DETAILED_SLOT_PLACEHOLDER_ICONS, RESOURCE_ICONS, FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL, STATUS_EFFECT_ICONS, DEFAULT_ENCYCLOPEDIA_ICON, ELEMENT_DATA
} from '../constants';
import SpellbookDisplay from './SpellbookDisplay';
import AbilityBookDisplay from './AbilityBookDisplay'; 

// Props for CharacterSheetModal
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
  onOpenEnhancementModal?: (item: Equipment) => void;
}

// --- Helper Components for "Main" Tab & Character Sheet ---

// Tab Button for Navigation
const SheetTabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col sm:flex-row items-center justify-center p-2.5 md:p-3 rounded-t-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-400/70
                ${isActive 
                    ? 'bg-slate-700 text-sky-300 border-b-2 border-sky-500 shadow-sm' // Active: lighter bg, sky text, distinct border
                    : 'bg-slate-800 text-slate-400 border-b-2 border-transparent hover:bg-slate-750 hover:text-sky-400 hover:border-slate-600'}`} // Inactive: darker bg, dimmer text, transparent border
    aria-pressed={isActive}
    style={{fontFamily: "'Inter Tight', sans-serif"}}
  >
    <div className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 mb-0.5 sm:mb-0 sm:mr-1.5 md:mr-2">{icon}</div>
    <span className={`text-[0.55rem] xs:text-[0.6rem] sm:text-xs ${isActive ? 'font-semibold' : 'font-medium'} tracking-tight uppercase`}>{label}</span>
  </button>
);


// Equipment Slot Display (Paper Doll Slot)
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
      className={`w-full h-[60px] xs:h-[64px] sm:h-[70px] md:h-[76px] bg-slate-700/70 hover:bg-slate-600/70 border-2 border-slate-600/80 hover:border-sky-500 rounded-lg flex flex-col items-center justify-center p-1 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-1 focus:ring-sky-400 ${className}`}
      title={item ? `${item.name} (${slotName})` : `Equip ${slotName}`}
    >
      <GetSpellIcon iconName={iconName} className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${item ? 'text-sky-300' : 'text-slate-500'}`} />
      <span className="text-[0.55rem] xs:text-[0.6rem] sm:text-[0.65rem] text-slate-400 mt-0.5 truncate w-full px-0.5">{item ? item.name : slotName}</span>
    </button>
  );
};

// Vital Statistics Display (Replaces QuickStatBlockDisplay)
const VitalStatisticsDisplay: React.FC<{player: Player, stats: PlayerEffectiveStats}> = ({player, stats}) => {
  const primaryStats = [
    { label: "Health", value: player.hp, maxValue: stats.maxHp, icon: <HealIcon className="text-red-300"/>, valClass: "text-red-200", barClass: "bg-gradient-to-r from-red-500 to-rose-600" },
    { label: "Mana", value: player.mp, maxValue: stats.maxMp, icon: <WandIcon className="text-blue-300"/>, valClass: "text-blue-200", barClass: "bg-gradient-to-r from-blue-500 to-sky-600" },
    { label: "Energy", value: player.ep, maxValue: stats.maxEp, icon: <ReflexIcon className="text-yellow-300"/>, valClass: "text-yellow-200", barClass: "bg-gradient-to-r from-yellow-400 to-amber-500" },
  ];
  
  return (
  <div className="p-2.5 sm:p-3 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
    <h4 className="text-sm sm:text-base font-semibold text-sky-200 mb-2.5" style={{fontFamily: "'Inter Tight', sans-serif"}}>Vital Statistics</h4>
    <div className="space-y-2.5">
        {primaryStats.map(s => (
            <div key={s.label}>
                <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                    <span className="flex items-center font-medium text-slate-100">
                        {React.cloneElement(s.icon, {className: "w-4 h-4 sm:w-5 sm:h-5 mr-1.5"})}
                        {s.label}
                    </span>
                    <span className={`font-mono font-semibold text-sm sm:text-base ${s.valClass}`}>{s.value}<span className="opacity-70 text-xs">/{s.maxValue}</span></span>
                </div>
                <div className="w-full bg-slate-800/70 rounded-full h-3 sm:h-3.5 overflow-hidden shadow-inner border border-slate-600/50">
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

// Attributes Display
const AttributesDisplay: React.FC<{player:Player, stats: PlayerEffectiveStats}> = ({player, stats}) => {
    const combatStats = [
      { label: "Speed", value: stats.speed, icon: <SpeedIcon className="text-lime-300"/>, valClass: "text-lime-200" },
      { label: "Phys. Power", value: stats.physicalPower, icon: <SwordSlashIcon className="text-orange-300"/>, valClass: "text-orange-200" },
      { label: "Mag. Power", value: stats.magicPower, icon: <MindIcon className="text-purple-300"/>, valClass: "text-purple-200" },
      { label: "Defense", value: stats.defense, icon: <ShieldIcon className="text-teal-300"/>, valClass: "text-teal-200" },
  ];
  return (
  <div className="p-2.5 sm:p-3 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
    <h4 className="text-sm sm:text-base font-semibold text-sky-200 mb-2" style={{fontFamily: "'Inter Tight', sans-serif"}}>Core Attributes</h4>
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5">
        {[
            {label: "Body", value: stats.body, base: player.body, icon: <BodyIcon className="text-red-300 w-5 h-5 sm:w-7 sm:h-7"/>, desc: "Affects HP, Physical Power, Defense"},
            {label: "Mind", value: stats.mind, base: player.mind, icon: <MindIcon className="text-blue-300 w-5 h-5 sm:w-7 sm:h-7"/>, desc: "Affects MP, Magic Power"},
            {label: "Reflex", value: stats.reflex, base: player.reflex, icon: <ReflexIcon className="text-yellow-300 w-5 h-5 sm:w-7 sm:h-7"/>, desc: "Affects EP, Speed, Defense"},
        ].map(attr => (
            <div key={attr.label} className="bg-slate-800/60 p-1.5 sm:p-2 rounded-lg text-center shadow-md border border-slate-600/50" title={`${attr.desc}\nBase: ${attr.base} (+${attr.value - attr.base} from effects/gear)`}>
                {React.cloneElement(attr.icon, {className: `${attr.icon.props.className} mx-auto mb-1`})}
                <p className="text-[0.6rem] xs:text-xs sm:text-sm text-slate-200 font-medium">{attr.label}</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-slate-50">{attr.value}</p>
            </div>
        ))}
    </div>
    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-slate-600/60">
        {combatStats.map(s => (
            <div key={s.label} className="flex items-center justify-between bg-slate-800/60 p-1.5 rounded-md shadow-sm text-xs sm:text-sm">
                <span className="flex items-center text-slate-200">
                    {React.cloneElement(s.icon, {className: "w-4 h-4 sm:w-5 sm:h-5 mr-1.5"})}
                    {s.label}:
                </span>
                <span className={`font-bold text-sm sm:text-base ${s.valClass}`}>{s.value}</span>
            </div>
        ))}
    </div>
     {player.activeStatusEffects.length > 0 && (
      <>
        <h5 className="text-xs sm:text-sm font-semibold text-slate-200 mt-2.5 mb-1">Active Effects:</h5>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {player.activeStatusEffects.map(effect => (
            <div key={effect.id} title={`${effect.name}${effect.magnitude ? ` (${effect.magnitude})`: ''} - ${effect.duration}t`}
                 className="text-[0.6rem] xs:text-xs bg-slate-600/80 px-1.5 py-1 rounded-md flex items-center shadow-sm border border-slate-500/70">
              <GetSpellIcon iconName={STATUS_EFFECT_ICONS[effect.name]} className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 opacity-90"/> 
              <span className="text-slate-100">{effect.name.replace('TEMP_','').replace('_UP','')}</span> 
              {effect.magnitude && <span className="ml-0.5 opacity-80">({effect.magnitude})</span>}
              <span className="ml-1 text-slate-300 font-mono bg-slate-800/50 px-1 text-[0.55rem] rounded-sm">{effect.duration}t</span>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);};

// ItemCard definition (used for detailed view modal)
interface ItemCardProps {
  item: GameItem;
  onEquip?: (itemId: string, slot: DetailedEquipmentSlot) => void;
  onUseItem?: (itemId: string) => void;
  isCompact?: boolean;
  isCombatContext?: boolean;
  onClick?: (item: GameItem) => void;
}

const renderStatsBoost = (statsBoost: Partial<Pick<Player, 'body' | 'mind' | 'reflex' | 'speed' | 'maxHp' | 'maxMp' | 'maxEp'>>) => {
  const boosts = Object.entries(statsBoost)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} +${value}`) 
    .join(', ');
  return boosts ? <p className="text-xs sm:text-sm text-green-300">{boosts}</p> : null;
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, onEquip, onUseItem, isCompact, isCombatContext, onClick }) => {
  const cardClasses = `bg-slate-700/90 p-2.5 rounded-lg shadow-md border border-slate-600/70 flex flex-col justify-between transition-all duration-150 hover:border-sky-400`;
  const canUseConsumable = isCombatContext && item.itemType === 'Consumable' && onUseItem;

  const handleMainAction = () => {
    if (item.itemType === 'Consumable' && onUseItem && isCombatContext) {
      onUseItem(item.id);
    } else if (onClick) {
        onClick(item);
    }
  };

  return (
    <div
      className={`${cardClasses} ${(onClick || (onEquip && !isCombatContext)) ? 'cursor-pointer' : ''}`} 
      title={item.description}
      onClick={handleMainAction}
    >
      <div>
        <div className="flex items-center mb-1.5">
          <GetSpellIcon iconName={item.iconName} className="w-7 h-7 mr-2 text-sky-200 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <h5 className="text-sm font-semibold text-slate-100 truncate">{item.name}</h5>
            <p className="text-xs text-slate-400">{item.itemType}</p>
          </div>
        </div>
        {!isCompact && <p className="text-xs sm:text-sm text-slate-300 mb-1 leading-snug">{item.description}</p>}

        {item.itemType === 'Consumable' && (
          <>
            <p className="text-xs sm:text-sm text-lime-300">Effect: {item.effectType.replace(/_/g, ' ')}
              {item.magnitude !== undefined && ` (${item.magnitude})`}
              {item.duration !== undefined && `, ${item.duration}t`}
            </p>
            {item.statusToCure && <p className="text-xs sm:text-sm text-slate-400">Cures: {item.statusToCure}</p>}
            {item.buffToApply && <p className="text-xs sm:text-sm text-slate-400">Buffs: {item.buffToApply}</p>}
          </>
        )}
        {item.itemType === 'Equipment' && (
          <>
            <p className="text-xs sm:text-sm text-orange-300">Slot: {item.slot}</p>
            {item.statsBoost && renderStatsBoost(item.statsBoost)}
          </>
        )}
      </div>
      {item.resourceCost && item.resourceCost.length > 0 && !isCombatContext && (
        <div className="mt-2 pt-1.5 border-t border-slate-600">
          <p className="text-[0.7rem] sm:text-xs text-amber-300 font-medium mb-0.5">Cost:</p>
          <div className="flex flex-wrap gap-1">
            {item.resourceCost.map(cost => (
              <div key={cost.type} className="flex items-center text-[0.65rem] sm:text-[0.7rem] text-amber-200 bg-slate-600/70 px-1 py-0.5 rounded" title={`${cost.quantity} ${cost.type}`}>
                <GetSpellIcon iconName={RESOURCE_ICONS[cost.type] || 'Default'} className="w-2.5 h-2.5 mr-0.5 opacity-70" />
                {cost.quantity} <span className="ml-0.5 opacity-60">{cost.type.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {canUseConsumable && (
        <div className="mt-2">
          <ActionButton onClick={handleMainAction} size="sm" variant="success" className="w-full !py-1 text-xs sm:text-sm">
            Use Consumable
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
    <Modal isOpen={true} onClose={onClose} title={`Select Item for ${targetSlot.replace(/([A-Z0-9])/g, ' $1').trim()}`} size="lg">
      {compatibleItems.length === 0 ? (
        <p className="text-slate-400 italic text-center py-4 text-sm sm:text-base">No compatible items in your inventory for this slot.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto styled-scrollbar p-1">
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
      <div className="mt-4 text-right">
        <ActionButton onClick={onClose} variant="secondary">Close</ActionButton>
      </div>
    </Modal>
  );
};


// --- START: New Inventory Tab Helper Components ---
type InventoryGridItemType = GameItem | { type: ResourceType, quantity: number, id: string };

interface InventoryGridSlotProps {
    item: InventoryGridItemType;
    onClick: (item: InventoryGridItemType) => void;
    onMouseEnter: (event: React.MouseEvent, item: InventoryGridItemType) => void;
    onMouseLeave: () => void;
}

const InventoryGridSlot: React.FC<InventoryGridSlotProps> = ({ item, onClick, onMouseEnter, onMouseLeave }) => {
    const isResource = 'quantity' in item && 'type' in item;
    const iconName = isResource ? RESOURCE_ICONS[item.type] : (item as GameItem).iconName;
    const name = isResource ? item.type : (item as GameItem).name;
    
    return (
        <button
            onClick={() => onClick(item)}
            onMouseEnter={(e) => onMouseEnter(e, item)}
            onMouseLeave={onMouseLeave}
            className="h-20 sm:h-24 bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600 hover:border-sky-400 rounded-md flex flex-col items-center justify-center p-1 shadow-sm transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-sky-400"
            aria-label={name}
        >
            <GetSpellIcon iconName={iconName} className={`w-2/3 h-2/3 ${isResource ? 'text-amber-300' : 'text-sky-300'} mb-0.5`} />
            <span className="text-[0.6rem] text-slate-200 text-center truncate w-full px-0.5">{name}</span>
            {isResource && item.quantity > 0 && (
                <span className="absolute bottom-0 right-0 text-[0.6rem] sm:text-xs font-bold text-white bg-sky-600 px-1 py-0 rounded-tl-md rounded-br-sm shadow">
                    {item.quantity}
                </span>
            )}
        </button>
    );
};

interface ItemTooltipProps {
    item: InventoryGridItemType;
    position: { x: number, y: number };
    player: Player; // Needed for resource costs if shown
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, position, player }) => {
    const isResource = 'quantity' in item && 'type' in item;
    const name = isResource ? item.type : (item as GameItem).name;
    const iconName = isResource ? RESOURCE_ICONS[item.type] : (item as GameItem).iconName;
    const description = isResource ? "A crafting material." : (item as GameItem).description;

    // Ensure tooltip stays within viewport (basic implementation)
    const style: React.CSSProperties = {
        position: 'fixed',
        top: position.y + 15,
        left: position.x + 15,
        transform: 'translate(-50%, 0)', // Adjust to center better if needed
        zIndex: 1050, // Above modal
        maxWidth: '300px',
    };
    if (position.x > window.innerWidth - 150) { // If too close to right edge
        style.left = 'auto';
        style.right = window.innerWidth - position.x + 15;
        style.transform = 'translate(50%, 0)';
    }
     if (position.y > window.innerHeight - 200) { // If too close to bottom edge (estimate tooltip height)
        style.top = 'auto';
        style.bottom = window.innerHeight - position.y + 15;
        style.transform = style.transform ? `${style.transform} translateY(-100%)` : 'translateY(-100%)';

    }


    return (
        <div style={style} className="bg-slate-800/95 p-3 rounded-lg shadow-xl border-2 border-sky-500/70 text-sm text-slate-200 backdrop-blur-sm w-max max-w-xs">
            <div className="flex items-center mb-2 pb-1.5 border-b border-slate-600/80">
                <GetSpellIcon iconName={iconName} className="w-7 h-7 mr-2 flex-shrink-0" />
                <h5 className="font-bold text-sky-300">{name}</h5>
            </div>
            <p className="text-xs text-slate-300 mb-1.5 italic">{description}</p>

            {isResource && <p className="text-xs text-amber-200">Type: Resource, Quantity: {item.quantity}</p>}
            
            {!isResource && (item as GameItem).itemType === 'Consumable' && (
                <>
                    <p className="text-xs text-lime-300">Type: Consumable</p>
                    <p className="text-xs">Effect: {(item as Consumable).effectType.replace(/_/g, ' ')}
                        {(item as Consumable).magnitude !== undefined && ` (${(item as Consumable).magnitude})`}
                        {(item as Consumable).duration !== undefined && `, ${(item as Consumable).duration}t`}
                    </p>
                    {(item as Consumable).statusToCure && <p className="text-xs">Cures: {(item as Consumable).statusToCure}</p>}
                    {(item as Consumable).buffToApply && <p className="text-xs">Buffs: {(item as Consumable).buffToApply}</p>}
                </>
            )}
            {!isResource && (item as GameItem).itemType === 'Equipment' && (
                <>
                    <p className="text-xs text-orange-300">Type: Equipment</p>
                    <p className="text-xs">Slot: {(item as Equipment).slot}</p>
                    {(item as Equipment).statsBoost && Object.keys((item as Equipment).statsBoost).length > 0 && (
                        <div className="text-xs">
                            Stats: {renderStatsBoost((item as Equipment).statsBoost)}
                        </div>
                    )}
                </>
            )}
            {!isResource && (item as GameItem).resourceCost && (item as GameItem).resourceCost!.length > 0 && (
                 <div className="mt-1.5 pt-1 border-t border-slate-700 text-xs">
                    <p className="text-amber-400 font-semibold text-[0.65rem] mb-0.5">Craft Cost:</p>
                    {(item as GameItem).resourceCost!.map(rc => <span key={rc.type} className="mr-1.5 text-amber-200 text-[0.65rem]">{rc.quantity} {rc.type}</span>)}
                 </div>
            )}
        </div>
    );
};

// --- END: New Inventory Tab Helper Components ---

// --- START: Main Tab Helper Components ---
interface MainTabSummaryItemProps {
    icon: SpellIconName;
    name: string;
    colorClass?: string;
}
const MainTabSummaryItem: React.FC<MainTabSummaryItemProps> = ({ icon, name, colorClass = "text-slate-200" }) => (
    <div className={`flex items-center p-1.5 bg-slate-800/70 rounded-md shadow-sm border border-slate-600/70 max-w-[120px] min-w-[80px] transition-all hover:border-current ${colorClass}`} title={name}>
        <GetSpellIcon iconName={icon} className={`w-5 h-5 mr-1.5 flex-shrink-0`} />
        <span className="text-xs truncate">{name}</span>
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
const MainTabSection: React.FC<MainTabSectionProps> = ({ title, items, onManageClick, manageLabel, maxVisible = 4, emptyText = "None.", iconColorClass }) => {
    const visibleItems = items.slice(0, maxVisible);
    const hiddenItemCount = items.length - visibleItems.length;

    return (
        <div className="p-2 sm:p-2.5 bg-slate-700/50 rounded-lg shadow-lg border border-slate-600/70">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                <h4 className="text-sm sm:text-base font-semibold text-sky-200" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{title}</h4>
                <ActionButton onClick={onManageClick} variant="secondary" size="sm" className="!px-2 !py-1 text-[0.65rem] sm:text-xs">
                    {manageLabel}
                </ActionButton>
            </div>
            {items.length === 0 ? (
                <p className="text-[0.7rem] sm:text-xs text-slate-400 italic">{emptyText}</p>
            ) : (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {visibleItems.map(item => <MainTabSummaryItem key={item.name} {...item} colorClass={iconColorClass || item.colorClass} />)}
                    {hiddenItemCount > 0 && (
                        <div className="flex items-center justify-center p-1.5 bg-slate-800/70 rounded-md shadow-sm border border-slate-600/70 text-xs text-slate-300 min-w-[40px]">
                            +{hiddenItemCount}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
// --- END: Main Tab Helper Components ---

// New component to display a single element
interface ElementDisplayCardProps {
  element: { id: string; name: string; description: string; iconName: SpellIconName; };
}

const ElementDisplayCard: React.FC<ElementDisplayCardProps> = ({ element }) => (
  <div className="bg-slate-800/80 p-3 rounded-lg shadow-md border border-slate-600">
    <div className="flex items-center mb-2">
      <GetSpellIcon iconName={element.iconName} className="w-10 h-10 mr-3 text-teal-300"/>
      <div>
        <h5 className="text-lg font-bold text-teal-200">{element.name}</h5>
        <p className="text-xs text-slate-400 italic">{element.description}</p>
      </div>
    </div>
  </div>
);

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  isOpen, onClose, player, effectiveStats, onEquipItem, onUnequipItem,
  maxRegisteredSpells, maxPreparedSpells, maxPreparedAbilities, onEditSpell,
  onPrepareSpell, onUnprepareSpell, onPrepareAbility, onUnprepareAbility, 
  isLoading, initialTab, onOpenSpellCraftingScreen,
  onOpenTraitCraftingScreen, canCraftNewTrait, onOpenEnhancementModal
}) => {
  const [activeTab, setActiveTab] = useState<CharacterSheetTab>(initialTab || 'Main');
  const [itemSelectionModalState, setItemSelectionModalState] = useState<{isOpen: boolean, slot: DetailedEquipmentSlot | null}>({isOpen: false, slot: null});
  const [selectedQuestDetail, setSelectedQuestDetail] = useState<Quest | null>(null);
  
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<InventoryFilterType>('All');
  const [selectedInventoryItemDetail, setSelectedInventoryItemDetail] = useState<InventoryGridItemType | null>(null);

  const [hoveredInventoryItem, setHoveredInventoryItem] = useState<InventoryGridItemType | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  
  const [encyclopediaSubTab, setEncyclopediaSubTab] = useState<EncyclopediaSubTabId>('monsters');


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
    }
    if (!isOpen) { 
        setSelectedQuestDetail(null);
        setInventorySearchTerm('');
        setInventoryFilter('All');
        setSelectedInventoryItemDetail(null);
        setHoveredInventoryItem(null);
        setTooltipPosition(null);
    }
  }, [isOpen, initialTab]);

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
    const currentItemId = player.equippedItems[slot];
    if (currentItemId) {
      onUnequipItem(slot); 
    } else {
      setItemSelectionModalState({isOpen: true, slot: slot});
    }
  };
  
  const handleSelectItemToEquip = (itemId: string, slot: DetailedEquipmentSlot) => {
    onEquipItem(itemId, slot);
    setItemSelectionModalState({isOpen: false, slot: null});
  };

  const handleInventorySlotMouseEnter = (event: React.MouseEvent, item: InventoryGridItemType) => {
    setHoveredInventoryItem(item);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleInventorySlotMouseLeave = () => {
    setHoveredInventoryItem(null);
    setTooltipPosition(null);
  };

  const handleInventorySlotClick = (item: InventoryGridItemType) => {
    setSelectedInventoryItemDetail(item);
  };


  const renderMainTabContent = () => {
    const preparedSpellsSummary = player.spells
        .filter(s => player.preparedSpellIds.includes(s.id))
        .map(s => ({ icon: s.iconName, name: s.name }));
    const preparedAbilitiesSummary = player.abilities
        .filter(a => player.preparedAbilityIds.includes(a.id))
        .map(a => ({ icon: a.iconName, name: a.name }));
    const traitsSummary = player.traits.map(t => ({ icon: t.iconName, name: t.name }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 p-1 text-sm sm:text-base">
            <div className="space-y-2.5 sm:space-y-3">
                <VitalStatisticsDisplay player={player} stats={effectiveStats} />
                <AttributesDisplay player={player} stats={effectiveStats} />
            </div>
            <div className="space-y-2.5 sm:space-y-3">
                <MainTabSection
                    title="Active Spells"
                    items={preparedSpellsSummary}
                    onManageClick={() => setActiveTab('Spells')}
                    manageLabel="Manage Spells"
                    emptyText="No spells prepared."
                    iconColorClass="text-sky-300"
                />
                <MainTabSection
                    title="Active Abilities"
                    items={preparedAbilitiesSummary}
                    onManageClick={() => setActiveTab('Abilities')}
                    manageLabel="Manage Abilities"
                    emptyText="No abilities prepared."
                    iconColorClass="text-yellow-300"
                />
                <MainTabSection
                    title="Active Traits"
                    items={traitsSummary}
                    onManageClick={() => setActiveTab('Traits')}
                    manageLabel="Manage Traits"
                    emptyText="No traits acquired."
                    iconColorClass="text-green-300"
                />
            </div>
        </div>
    );
};


  const renderInventoryTabContent = () => {
    const lowerSearchTerm = inventorySearchTerm.toLowerCase();
    
    const gameItemsToDisplay: GameItem[] = player.items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(lowerSearchTerm);
        if (inventoryFilter === 'All') return nameMatch;
        return item.itemType === inventoryFilter && nameMatch;
    });

    const resourcesToDisplay: { type: ResourceType, quantity: number, id: string }[] = Object.entries(player.inventory)
        .filter(([type, quantity]) => quantity > 0 && type.toLowerCase().includes(lowerSearchTerm))
        .map(([type, quantity]) => ({ type: type as ResourceType, quantity, id: `resource-${type}` }));

    let displayGridItems: InventoryGridItemType[] = [];
    if (inventoryFilter === 'All') {
        displayGridItems = [...gameItemsToDisplay, ...resourcesToDisplay];
    } else if (inventoryFilter === 'Resource') {
        displayGridItems = resourcesToDisplay;
    } else { // Consumable or Equipment
        displayGridItems = gameItemsToDisplay;
    }
    
    const inventoryIsEmpty = displayGridItems.length === 0;

    const inventoryFilterButtons: {label: InventoryFilterType, icon: SpellIconName}[] = [
        {label: 'All', icon: 'FilterListIcon'},
        {label: 'Consumable', icon: 'PotionGeneric'},
        {label: 'Equipment', icon: 'SwordHilt'},
        {label: 'Resource', icon: 'Gem'},
    ];

    return (
        <div className="flex flex-col h-full p-1">
            <div className="mb-2.5 sm:mb-3 p-1.5 sm:p-2 bg-slate-800/60 rounded-lg shadow-md border border-slate-600/60">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input 
                            type="text"
                            placeholder="Search inventory..."
                            value={inventorySearchTerm}
                            onChange={(e) => setInventorySearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-slate-700 border border-slate-500 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
                        />
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    </div>
                    <div className="flex gap-1 sm:gap-1.5 w-full sm:w-auto">
                        {inventoryFilterButtons.map(f => (
                             <ActionButton
                                key={f.label}
                                onClick={() => setInventoryFilter(f.label)}
                                variant={inventoryFilter === f.label ? 'primary' : 'secondary'}
                                size="sm"
                                icon={<GetSpellIcon iconName={f.icon} className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>}
                                className="!px-2 !py-1 sm:!px-2.5 text-[0.65rem] sm:text-xs flex-1 sm:flex-none"
                                title={`Filter by ${f.label}`}
                            >
                                {f.label}
                            </ActionButton>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Modal for clicked item details */}
            {selectedInventoryItemDetail && (
                 <Modal 
                    isOpen={true} 
                    onClose={() => setSelectedInventoryItemDetail(null)} 
                    title={'name' in selectedInventoryItemDetail ? selectedInventoryItemDetail.name : selectedInventoryItemDetail.type} 
                    size="md"
                 >
                    {('type' in selectedInventoryItemDetail && 'quantity' in selectedInventoryItemDetail) ? ( // Is Resource
                         <div className="text-center p-4">
                            <GetSpellIcon iconName={RESOURCE_ICONS[selectedInventoryItemDetail.type]} className="w-16 h-16 mx-auto mb-2 text-amber-300"/>
                            <p className="text-lg text-slate-200">{selectedInventoryItemDetail.type}</p>
                            <p className="text-sm text-slate-400">Quantity: {selectedInventoryItemDetail.quantity}</p>
                            <p className="text-xs text-slate-500 mt-1 italic">A crafting resource.</p>
                        </div>
                    ) : ( // Is GameItem
                        <div className="space-y-3">
                            <ItemCard item={selectedInventoryItemDetail as GameItem} isCompact={false}/>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {/* Equip Button */}
                                {(selectedInventoryItemDetail as GameItem).itemType === 'Equipment' && 
                                 player.equippedItems[(selectedInventoryItemDetail as Equipment).slot] !== (selectedInventoryItemDetail as Equipment).id && (
                                  <ActionButton 
                                    onClick={() => { 
                                        onEquipItem((selectedInventoryItemDetail as Equipment).id, (selectedInventoryItemDetail as Equipment).slot as DetailedEquipmentSlot); 
                                        setSelectedInventoryItemDetail(null); 
                                    }} 
                                    variant="success" 
                                    size="sm"
                                   >
                                    Equip
                                  </ActionButton>
                                )}
                                {/* Unequip Button */}
                                {(selectedInventoryItemDetail as GameItem).itemType === 'Equipment' && 
                                  player.equippedItems[(selectedInventoryItemDetail as Equipment).slot] === (selectedInventoryItemDetail as Equipment).id && (
                                  <ActionButton onClick={() => { onUnequipItem((selectedInventoryItemDetail as Equipment).slot as DetailedEquipmentSlot); setSelectedInventoryItemDetail(null);}} variant="warning" size="sm">
                                    Unequip
                                  </ActionButton>
                                )}
                                
                                {/* Enhance Button - ADDED */}
                                {(selectedInventoryItemDetail as GameItem).itemType === 'Equipment' && onOpenEnhancementModal && (
                                  <ActionButton 
                                    onClick={() => {
                                      if (typeof onOpenEnhancementModal === 'function') {
                                        onOpenEnhancementModal(selectedInventoryItemDetail as Equipment);
                                      }
                                      setSelectedInventoryItemDetail(null); // Close this modal
                                    }}
                                    variant="secondary" 
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 col-span-1"
                                  >
                                    <StarIcon className="w-4 h-4 mr-1.5" /> Enhance
                                  </ActionButton>
                                )}
                                
                                {/* Drop Button */}
                                <ActionButton onClick={() => {
                                    console.log("Drop item attempt:", selectedInventoryItemDetail.id);
                                    // onDropItem(selectedInventoryItemDetail.id); // Future: implement drop
                                    setSelectedInventoryItemDetail(null);
                                }} variant="danger" size="sm" className="col-span-1">
                                  Drop
                                </ActionButton>
                            </div>
                        </div>
                    )}
                 </Modal>
            )}

            {inventoryIsEmpty ? (
                <p className="text-center text-sm sm:text-base text-slate-400 italic py-6 sm:py-10">No items match your criteria.</p>
            ) : (
                <div className="flex-grow overflow-y-auto styled-scrollbar pr-0.5 sm:pr-1 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {displayGridItems.map(item => (
                        <InventoryGridSlot 
                            key={item.id}
                            item={item}
                            onClick={handleInventorySlotClick}
                            onMouseEnter={handleInventorySlotMouseEnter}
                            onMouseLeave={handleInventorySlotMouseLeave}
                        />
                    ))}
                </div>
            )}
            {/* Hover Tooltip */}
            {hoveredInventoryItem && tooltipPosition && (
                <ItemTooltip item={hoveredInventoryItem} position={tooltipPosition} player={player} />
            )}
        </div>
    );
  };
  
  const renderSpellsTabContent = () => {
    const preparedSpells = player.spells.filter(spell => player.preparedSpellIds.includes(spell.id));
    const availableSpells = player.spells.filter(spell => !player.preparedSpellIds.includes(spell.id));
    const canPrepareMoreSpells = player.preparedSpellIds.length < maxPreparedSpells;
    const canLearnMoreSpellsCurrent = player.spells.length < maxRegisteredSpells;
    return (
        <div className="space-y-2.5 sm:space-y-3 p-1 h-full overflow-y-auto styled-scrollbar">
             <div className="flex flex-col sm:flex-row justify-between items-center p-2 sm:p-2.5 bg-slate-800/70 rounded-lg shadow-md border border-slate-600/60" style={{fontFamily: "'Inter Tight', sans-serif"}}>
                <div className="text-xs sm:text-sm text-slate-300 font-semibold mb-1 sm:mb-0">
                    Known: <span className={`${!canLearnMoreSpellsCurrent ? 'text-red-400' : 'text-sky-300'}`}>{player.spells.length}/{maxRegisteredSpells}</span>
                    <span className="mx-1 sm:mx-1.5 text-slate-500">|</span> 
                    Prepared: <span className={`${!canPrepareMoreSpells && player.preparedSpellIds.length >= maxPreparedSpells ? 'text-red-400' : 'text-green-300'}`}>{player.preparedSpellIds.length}/{maxPreparedSpells}</span>
                </div>
                {onOpenSpellCraftingScreen && (
                    <ActionButton onClick={onOpenSpellCraftingScreen} variant="info" size="sm" icon={<WandIcon className="w-3.5 h-3.5"/>} disabled={!canLearnMoreSpellsCurrent || isLoading} title={canLearnMoreSpellsCurrent ? "Craft new" : "Full"}>
                        Craft New
                    </ActionButton>
                )}
            </div>
            <SpellbookDisplay spells={availableSpells} playerMana={player.mp} title="Collection" onPrepareSpell={onPrepareSpell} onEditSpell={onEditSpell} canPrepareMore={canPrepareMoreSpells} preparedSpellIds={player.preparedSpellIds} emptyStateMessage="All spells prepared or collection empty."/>
            <SpellbookDisplay spells={preparedSpells} playerMana={player.mp} title="Prepared" onUnprepareSpell={onUnprepareSpell} onEditSpell={onEditSpell} preparedSpellIds={player.preparedSpellIds} emptyStateMessage="No spells prepared."/>
        </div>
    );
  };

  const renderAbilitiesTabContent = () => {
        const preparedAbilities = player.abilities.filter(ability => player.preparedAbilityIds.includes(ability.id));
        const availableAbilities = player.abilities.filter(ability => !player.preparedAbilityIds.includes(ability.id));
        const canPrepareMoreAbilities = player.preparedAbilityIds.length < maxPreparedAbilities;
        return (
            <div className="space-y-2.5 sm:space-y-3 p-1 h-full overflow-y-auto styled-scrollbar">
                <div className="flex flex-col sm:flex-row justify-between items-center p-2 sm:p-2.5 bg-slate-800/70 rounded-lg shadow-md border border-slate-600/60" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                    <div className="text-xs sm:text-sm text-slate-300 font-semibold mb-1 sm:mb-0">
                        Known: <span className="text-sky-300">{player.abilities.length}</span>
                        <span className="mx-1 sm:mx-1.5 text-slate-500">|</span>
                        Prepared: <span className={`${!canPrepareMoreAbilities && player.preparedAbilityIds.length >= maxPreparedAbilities ? 'text-red-400' : 'text-green-300'}`}>{player.preparedAbilityIds.length}/{maxPreparedAbilities}</span>
                    </div>
                     <ActionButton variant="secondary" size="sm" icon={<MindIcon className="w-3.5 h-3.5" />} disabled={true} title="Learn via progression/discovery.">Learn New</ActionButton>
                </div>
                <AbilityBookDisplay abilities={availableAbilities} playerEp={player.ep} title="Collection" onPrepareAbility={onPrepareAbility} canPrepareMore={canPrepareMoreAbilities} preparedAbilityIds={player.preparedAbilityIds} emptyStateMessage="All abilities prepared or collection empty."/>
                <AbilityBookDisplay abilities={preparedAbilities} playerEp={player.ep} title="Prepared" onUnprepareAbility={onUnprepareAbility} preparedAbilityIds={player.preparedAbilityIds} emptyStateMessage="No abilities prepared."/>
            </div>
        );
  };
  
  const renderTraitsTabContent = () => {
    const expectedTraitsAtCurrentLevel = player.level >= FIRST_TRAIT_LEVEL ? Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1 : 0;
    return (
        <div className="p-1 h-full overflow-y-auto styled-scrollbar">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-2.5 pb-1.5 sm:pb-2 border-b border-slate-500/50">
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1 sm:mb-0" style={{fontFamily: "'Inter Tight', sans-serif"}}>Passive Traits</h3>
                {onOpenTraitCraftingScreen && (
                    <ActionButton onClick={onOpenTraitCraftingScreen} variant="success" size="sm" icon={<StarIcon className="w-3.5 h-3.5"/>} disabled={!canCraftNewTrait || isLoading} title={canCraftNewTrait ? "Define new" : "No new slots"}>
                        Define New
                    </ActionButton>
                )}
            </div>
            {!canCraftNewTrait && player.level >= FIRST_TRAIT_LEVEL && player.traits.length >= expectedTraitsAtCurrentLevel && (
                <p className="text-xs sm:text-sm text-yellow-300 italic p-2 bg-slate-800/50 rounded-md text-center shadow-inner mb-2">Level up or complete quests for more trait slots.</p>
            )}
            {player.traits.length > 0 ? (
            <ul className="space-y-2 sm:space-y-2.5">
                {player.traits.map(trait => (
                <li key={trait.id} className="p-2 sm:p-3 bg-slate-800/70 rounded-lg shadow-md border border-slate-600/60">
                    <div className="flex items-center font-semibold text-yellow-300 mb-1 text-sm sm:text-base">
                    <GetSpellIcon iconName={trait.iconName || 'Star'} className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    {trait.name}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 italic ml-[22px] sm:ml-[28px] leading-normal">{trait.description}</p>
                </li>
                ))}
            </ul>
            ) : (
            <p className={`text-sm text-slate-400 italic p-3 bg-slate-800/50 rounded-md text-center shadow-inner ${canCraftNewTrait ? 'mt-1' : ''}`}>
                No traits. {canCraftNewTrait ? 'Click "Define New Trait"!' : 'Level up to unlock.'}
            </p>
            )}
        </div>
    );
  };

  const renderQuestsTabContent = () => {
    const activeQuests = player.quests.filter(q => q.status === 'active');
    const completedQuests = player.quests.filter(q => q.status === 'completed');

    const renderQuestList = (questList: Quest[], listTitle: string, titleColor: string) => (
        <div className="mb-2 sm:mb-2.5">
            <h4 className={`text-sm sm:text-base font-semibold ${titleColor} mb-1 sm:mb-1.5 border-b border-slate-500/50 pb-1`} style={{fontFamily: "'Inter Tight', sans-serif"}}>{listTitle} ({questList.length})</h4>
            {questList.length === 0 ? ( <p className="text-xs sm:text-sm text-slate-500 italic px-1">None.</p> ) : (
            <ul className="space-y-1 sm:space-y-1.5">
                {questList.map(quest => (
                <li key={quest.id} onClick={() => setSelectedQuestDetail(quest)}
                    className={`p-1.5 sm:p-2 rounded-md hover:bg-slate-500/70 cursor-pointer transition-colors shadow-sm border ${selectedQuestDetail?.id === quest.id ? 'bg-slate-500/60 border-sky-500 ring-1 ring-sky-400' : 'bg-slate-600/80 border-slate-500/60'}`}>
                    <div className="flex items-center"><GetSpellIcon iconName={quest.iconName || 'Book'} className="w-4 h-4 mr-1.5 sm:mr-2 text-yellow-300 flex-shrink-0" />
                    <span className={`font-medium text-xs sm:text-sm truncate ${quest.isMainQuest ? 'text-yellow-200' : 'text-slate-100'}`}>{quest.title}</span></div>
                </li>))}
            </ul>)}
        </div>
    );
    return (
        <div className="p-1 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 h-full overflow-hidden">
            <div className="space-y-2 sm:space-y-2.5 overflow-y-auto styled-scrollbar pr-1 sm:pr-1.5 bg-slate-800/60 p-2 sm:p-2.5 rounded-lg border border-slate-600/60 shadow-inner">
                {renderQuestList(activeQuests, "Active", "text-sky-300")}
                {renderQuestList(completedQuests, "Completed", "text-green-400")}
                {player.quests.filter(q => q.status === 'failed').length > 0 && renderQuestList(player.quests.filter(q => q.status === 'failed'), "Failed", "text-red-400")}
                {player.quests.length === 0 && <p className="text-slate-400 italic text-sm p-2 text-center">No quests.</p>}
            </div>
            <div className="bg-slate-800/60 p-2.5 sm:p-3 rounded-lg border border-slate-600/60 overflow-y-auto styled-scrollbar shadow-inner">
            {selectedQuestDetail ? ( <>
                <div className="flex items-center mb-1.5 sm:mb-2"><GetSpellIcon iconName={selectedQuestDetail.iconName || 'Book'} className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-2.5 text-yellow-300 flex-shrink-0" />
                <h3 className={`text-base sm:text-lg font-bold ${selectedQuestDetail.isMainQuest ? 'text-yellow-200' : 'text-sky-200'}`} style={{fontFamily: "'Inter Tight', sans-serif"}}>{selectedQuestDetail.title}</h3></div>
                {selectedQuestDetail.isMainQuest && <p className="text-[0.7rem] sm:text-xs text-yellow-400 mb-1.5 sm:mb-2 uppercase tracking-wide font-semibold">Main Story</p>}
                <p className="text-xs sm:text-sm text-slate-200 mb-2.5 sm:mb-3 leading-normal whitespace-pre-wrap">{selectedQuestDetail.description}</p>
                <h5 className="text-sm sm:text-base font-semibold text-slate-100 mb-1 sm:mb-1.5">Objectives:</h5>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-slate-200 pl-2 sm:pl-2.5">
                    {selectedQuestDetail.objectives.map((obj, index) => <li key={index} className="leading-snug">{obj}</li>)}
                </ul>
                <p className="mt-2.5 sm:mt-3 text-[0.65rem] sm:text-xs text-slate-400">Status: <span className={`font-semibold px-1.5 py-0.5 rounded ${selectedQuestDetail.status === 'active' ? 'bg-blue-600 text-blue-100' : selectedQuestDetail.status === 'completed' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`}>{selectedQuestDetail.status.toUpperCase()}</span></p>
            </>) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-4 sm:py-8">
                <BookIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-2 sm:mb-3"/><p className="text-sm sm:text-base">Select a quest.</p></div>
            )}
            </div>
        </div>
    );
  };

  const renderEncyclopediaTabContent = () => {
    const encyclopediaSubTabs: {id: EncyclopediaSubTabId, label: string, icon: React.ReactElement}[] = [
        { id: 'monsters', label: 'Bestiary', icon: <SkullIcon className="w-4 h-4" /> },
        { id: 'spells', label: 'Spells', icon: <WandIcon className="w-4 h-4" /> },
        { id: 'abilities', label: 'Abilities', icon: <MindIcon className="w-4 h-4" /> },
        { id: 'traits', label: 'Traits', icon: <StarIcon className="w-4 h-4" /> },
        { id: 'items', label: 'Items', icon: <BagIcon className="w-4 h-4" /> },
        { id: 'elements', label: 'Elements', icon: <CollectionIcon className="w-4 h-4" /> }, 
        { id: 'biomes', label: 'Biomes', icon: <BookOpenIcon className="w-4 h-4" /> },
        { id: 'npcs', label: 'NPCs', icon: <UserIcon className="w-4 h-4" /> }, 
    ];

    const bestiaryEntries = Object.values(player.bestiary);

    return (
        <div className="flex flex-col h-full p-1">
            <div className="flex flex-wrap gap-1 mb-2 p-1.5 bg-slate-800/60 rounded-md border border-slate-600">
                {encyclopediaSubTabs.map(subTab => (
                    <ActionButton
                        key={subTab.id}
                        onClick={() => setEncyclopediaSubTab(subTab.id) }
                        variant={encyclopediaSubTab === subTab.id ? 'info' : 'secondary'}
                        size="sm"
                        icon={subTab.icon}
                        className="!text-xs flex-grow sm:flex-grow-0"
                    >
                        {subTab.label}
                    </ActionButton>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto styled-scrollbar p-1 bg-slate-700/40 rounded-md shadow-inner">
                {encyclopediaSubTab === 'monsters' && (
                    bestiaryEntries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {bestiaryEntries.map(monster => (
                                <div key={monster.id} className="bg-slate-800/80 p-3 rounded-lg shadow-md border border-slate-600">
                                    <div className="flex items-center mb-2">
                                        <GetSpellIcon iconName={monster.iconName} className="w-10 h-10 mr-3 text-red-300"/>
                                        <div>
                                            <h5 className="text-lg font-bold text-red-200">{monster.name} <span className="text-xs text-slate-400">(Lvl {monster.level || '?'})</span></h5>
                                            <p className="text-xs text-slate-400 italic">{monster.description}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-300">Vanquished: <span className="font-semibold text-green-400">{monster.vanquishedCount}</span></p>
                                    {monster.weakness && <p className="text-xs text-yellow-400">Weakness: {monster.weakness}</p>}
                                    {monster.resistance && <p className="text-xs text-cyan-400">Resistance: {monster.resistance}</p>}
                                    {monster.specialAbilityName && <p className="text-xs text-purple-300">Special: {monster.specialAbilityName}</p>}
                                    {/* Placeholder for loot/location */}
                                    <p className="text-xs mt-1 text-slate-500">Loot/Location data coming soon...</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-center text-slate-400 italic py-6">No monsters encountered yet.</p>
                )}
                 {encyclopediaSubTab === 'spells' && (
                    player.spells.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {player.spells.map(spell => <SpellbookDisplay key={spell.id} spells={[spell]} playerMana={player.mp} title="" />)}
                        </div>
                    ) : <p className="text-center text-slate-400 italic py-6">No spells crafted yet.</p>
                )}
                {encyclopediaSubTab === 'abilities' && (
                     player.abilities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {player.abilities.map(ability => <AbilityBookDisplay key={ability.id} abilities={[ability]} playerEp={player.ep} title="" />)}
                        </div>
                    ) : <p className="text-center text-slate-400 italic py-6">No abilities learned yet.</p>
                )}
                {encyclopediaSubTab === 'traits' && (
                    player.traits.length > 0 ? (
                        <ul className="space-y-2">
                            {player.traits.map(trait => (
                                <li key={trait.id} className="p-3 bg-slate-800/70 rounded-lg shadow-md border border-slate-600/60">
                                    <div className="flex items-center font-semibold text-yellow-300 mb-1 text-base">
                                        <GetSpellIcon iconName={trait.iconName || 'Star'} className="w-5 h-5 mr-2" />{trait.name}
                                    </div>
                                    <p className="text-sm text-slate-300 italic ml-7 leading-normal">{trait.description}</p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-slate-400 italic py-6">No traits acquired yet.</p>
                )}
                {encyclopediaSubTab === 'items' && (
                    player.items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                           {player.items.map(item => <ItemCard key={item.id} item={item} isCompact={false} />)}
                        </div>
                    ) : <p className="text-center text-slate-400 italic py-6">No items found in inventory.</p>
                )}
                {encyclopediaSubTab === 'elements' && (
                    ELEMENT_DATA.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ELEMENT_DATA.map(element => (
                                <ElementDisplayCard key={element.id} element={{...element, iconName: element.iconName as SpellIconName}} />
                            ))}
                        </div>
                    ) : <p className="text-center text-slate-400 italic py-6">No element data found.</p>
                )}
                {encyclopediaSubTab === 'biomes' && (
                    <div className="text-center text-slate-400 italic py-6">
                        <BookOpenIcon className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                        <p>Biome information will be available here as you explore.</p>
                        <p className="text-xs mt-1">Data on discovered biomes, their characteristics, and points of interest within them will be logged.</p>
                    </div>
                )}
                {encyclopediaSubTab === 'npcs' && (
                    <div className="text-center text-slate-400 italic py-6">
                        <UserIcon className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                        <p>Details about non-hostile NPCs encountered will appear here.</p>
                        <p className="text-xs mt-1">Learn about characters, their stories, and potential quests or services.</p>
                    </div>
                )}
            </div>
        </div>
    );
  };


  const tabRenderers: Record<CharacterSheetTab, () => React.ReactNode> = {
    Main: renderMainTabContent,
    Inventory: renderInventoryTabContent,
    Spells: renderSpellsTabContent,
    Abilities: renderAbilitiesTabContent,
    Traits: renderTraitsTabContent,
    Quests: renderQuestsTabContent,
    Encyclopedia: renderEncyclopediaTabContent,
  };
  
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="7xl">
      <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 h-full p-0"> 
        {/* Paper Doll Area - Updated 3-column grid */}
        <div className="w-full lg:w-auto bg-slate-700/80 p-2 sm:p-2.5 rounded-xl shadow-2xl border-2 border-slate-600/80 flex-shrink-0">
            <p className="text-base sm:text-lg md:text-xl font-bold text-center text-slate-100 mb-1 sm:mb-1.5 truncate max-w-full px-1" style={{fontFamily: "'Inter Tight', sans-serif"}} title={player.name || "Hero"}>{player.name || "Hero"}</p>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,3.5fr)_minmax(0,1fr)] gap-1.5 sm:gap-2 items-start">
                {/* Left Column Slots */}
                <div className="space-y-1.5 sm:space-y-2 col-start-1">
                    {DETAILED_EQUIPMENT_SLOTS_LEFT_COL.map(slot => <EquipmentSlotDisplay key={slot} slot={slot} itemId={player.equippedItems[slot]} allItems={player.items} onClick={() => handleEquipmentSlotClick(slot)} />)}
                </div>

                {/* Center "Model" Area */}
                <div className="col-start-2 flex flex-col items-center justify-start pt-[calc(1*(70px+6px))]"> {/* Approx 1 slot height + gap */}
                    <div className="p-2 bg-slate-600/70 rounded-full shadow-lg border-2 border-sky-500/80 mb-2 sm:mb-3 flex items-center justify-center 
                                    w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-72 lg:h-72">
                        <GetSpellIcon iconName={player.iconName || 'UserIcon'} className="w-full h-full text-sky-200" />
                    </div>
                    {/* Weapon Slots directly below model */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full max-w-[calc(2*(78px)+8px)] mx-auto mt-auto"> {/* Max width based on 2 large slots + gap */}
                        <EquipmentSlotDisplay slot={'WeaponLeft'} itemId={player.equippedItems['WeaponLeft']} allItems={player.items} onClick={() => handleEquipmentSlotClick('WeaponLeft')} />
                        <EquipmentSlotDisplay slot={'WeaponRight'} itemId={player.equippedItems['WeaponRight']} allItems={player.items} onClick={() => handleEquipmentSlotClick('WeaponRight')} />
                    </div>
                </div>
                
                {/* Right Column Slots */}
                <div className="space-y-1.5 sm:space-y-2 col-start-3">
                    {DETAILED_EQUIPMENT_SLOTS_RIGHT_COL.map(slot => <EquipmentSlotDisplay key={slot} slot={slot} itemId={player.equippedItems[slot]} allItems={player.items} onClick={() => handleEquipmentSlotClick(slot)} />)}
                </div>
            </div>
        </div>

        {/* Right Dynamic Panel */}
        <div className="w-full flex-grow flex flex-col bg-slate-800/90 rounded-xl shadow-2xl border-2 border-slate-700/70 overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-0">
          <div className="flex flex-wrap sm:flex-nowrap bg-slate-800 rounded-t-lg z-10 shadow-md flex-shrink-0 gap-x-0.5">
            <SheetTabButton icon={<UserIcon />} label="Main" isActive={activeTab === 'Main'} onClick={() => setActiveTab('Main')} />
            <SheetTabButton icon={<BagIcon />} label="Inventory" isActive={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} />
            <SheetTabButton icon={<WandIcon />} label="Spells" isActive={activeTab === 'Spells'} onClick={() => setActiveTab('Spells')} />
            <SheetTabButton icon={<MindIcon />} label="Abilities" isActive={activeTab === 'Abilities'} onClick={() => setActiveTab('Abilities')} />
            <SheetTabButton icon={<StarIcon />} label="Traits" isActive={activeTab === 'Traits'} onClick={() => setActiveTab('Traits')} />
            <SheetTabButton icon={<BookIcon />} label="Quests" isActive={activeTab === 'Quests'} onClick={() => setActiveTab('Quests')} />
            <SheetTabButton icon={<CollectionIcon />} label="Logs" isActive={activeTab === 'Encyclopedia'} onClick={() => setActiveTab('Encyclopedia')} />
          </div>
          <div className="flex-grow overflow-y-auto p-1.5 sm:p-2 md:p-2.5 bg-slate-700/60 shadow-inner styled-scrollbar">
            {tabRenderers[activeTab]()}
          </div>
        </div>
      </div>
      {itemSelectionModalState.isOpen && itemSelectionModalState.slot && (
        <ItemSelectionSubModal
            isOpen={itemSelectionModalState.isOpen}
            onClose={() => setItemSelectionModalState({isOpen: false, slot: null})}
            targetSlot={itemSelectionModalState.slot}
            compatibleItems={getCompatibleItemsForSlot(itemSelectionModalState.slot)}
            onSelectItem={handleSelectItemToEquip}
        />
      )}
    </Modal>
  );
};