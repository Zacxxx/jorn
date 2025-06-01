import React, { useState, useEffect, useCallback } from 'react';
import { Player, Enemy, CombatActionLog, Spell, GameState, Consumable, Ability, PlayerEffectiveStats } from '../../types';
import { GetSpellIcon, WandIcon, PotionGenericIcon, SwordsIcon, ShieldIcon, BookIcon, FleeIcon, StarIcon, HealIcon, LightningBoltIcon } from './IconComponents';
import ActionButton from './ActionButton';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import CombatLogDisplay from './CombatLogDisplay';
import PlayerStatsDisplay from './PlayerStatsDisplay'; 
import EnemyDisplay from './EnemyDisplay'; 
import PlayerBattleDisplay from './PlayerBattleDisplay';
import EnemyBattleDisplay from './EnemyBattleDisplay';

// --- Types for CombatView ---
interface CombatViewProps {
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  currentEnemies: Enemy[];
  targetEnemyId: string | null;
  onSetTargetEnemy: (enemyId: string) => void;
  preparedSpells: Spell[];
  onPlayerAttack: (spell: Spell, targetId: string) => void;
  onPlayerBasicAttack: (targetId: string) => void;
  onPlayerDefend: () => void;
  onPlayerFlee: () => void;
  onPlayerFreestyleAction: (actionText: string, targetId: string | null) => void;
  combatLog: CombatActionLog[];
  isPlayerTurn: boolean;
  playerActionSkippedByStun: boolean;
  onSetGameState: (state: GameState) => void; 
  onUseConsumable: (consumableId: string, targetId: string | null) => void;
  onUseAbility: (abilityId: string, targetId: string | null) => void;
  consumables: Consumable[];
  abilities: Ability[];
  onSeekBattle?: () => void;
}

type DynamicAreaView = 'actions' | 'spells' | 'abilities' | 'items' | 'log';
type CombatActionItemType = Spell | Ability | Consumable;

// --- Component Interfaces ---
interface IconProps {
  className?: string;
  title?: string;
}

interface ActionCategoryButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  count?: number;
}

const ActionCategoryButton: React.FC<ActionCategoryButtonProps> = ({ label, icon, isActive, onClick, disabled, count }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (label === "Actions") { // Log only once, for the first category button typically
    console.log("Developer note: 'public/assets/activity-card/combat.gif' is missing. Using 'public/assets/activity-card/camp.gif' as a placeholder for ActionCategoryButton hover effects.");
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 border-2 h-full group overflow-hidden
        ${isActive
          ? 'bg-gradient-to-br from-cyan-600/40 to-blue-600/40 border-cyan-400/60 text-cyan-200 shadow-lg shadow-cyan-500/20'
          : disabled
            ? 'bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed opacity-50'
            : 'bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/60 hover:border-slate-500/60 hover:text-slate-200'
        }
      `}
    >
      <img
        src="/assets/activity-card/camp.gif" // Fallback GIF
        alt="Combat category background"
        className={`transition-all duration-500 ease-in-out absolute inset-0 w-full h-full object-cover ${
          isHovered && !disabled ? 'opacity-10 scale-110' : 'opacity-0 scale-100'
        }`}
      />
      <div className="relative z-10 w-5 h-5 mb-1 flex-shrink-0">
        {icon}
      </div>
      <span className="relative z-10 text-xs font-semibold truncate w-full text-center">{label}</span>
      {count !== undefined && count > 0 && (
        <div className="relative z-10 absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
        {count > 99 ? '99+' : count}
      </div>
    )}
  </button>
);

// Enhanced Combat Action Slot with Long Press Support
interface EnhancedCombatActionSlotProps {
    actionItem: CombatActionItemType;
    player: Player; 
    onClick: (item: CombatActionItemType) => void;
    isDisabledByGameLogic: boolean; 
}

const EnhancedCombatActionSlot: React.FC<EnhancedCombatActionSlotProps> = ({ 
  actionItem, player, onClick, isDisabledByGameLogic 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { name, iconName } = actionItem;

    // Console log for missing GIF - attempt to log once per component type creation
    // This might log multiple times if many slots are created, alternative is a global flag or context.
    // For now, a simple approach:
    if (name) { // A simple condition to ensure it runs within the component instance
        const componentName = 'EnhancedCombatActionSlot';
        if (!(window as any)[`hasLoggedMissingGif_${componentName}`]) {
            console.log(`Developer note: 'public/assets/activity-card/combat.gif' is missing. Using 'public/assets/activity-card/camp.gif' as a placeholder for ${componentName} hover effects.`);
            (window as any)[`hasLoggedMissingGif_${componentName}`] = true;
        }
    }
    
    let costText = "";
    let costColor = "text-slate-400";
    let iconColor = "text-sky-300";
    let isAffordable = true;
    let bgGradient = "from-slate-800/60 to-slate-900/80";
    let borderColor = "border-slate-600/50";

    if ('manaCost' in actionItem) { // Spell
        costText = `${actionItem.manaCost} MP`;
        isAffordable = player.mp >= actionItem.manaCost;
        costColor = isAffordable ? "text-blue-300" : "text-red-400";
        iconColor = "text-blue-400";
        bgGradient = "from-blue-900/30 to-indigo-900/40";
        borderColor = "border-blue-500/40";
    } else if ('epCost' in actionItem) { // Ability
        costText = `${actionItem.epCost} EP`;
        isAffordable = player.ep >= actionItem.epCost;
        costColor = isAffordable ? "text-yellow-300" : "text-red-400";
        iconColor = "text-yellow-400";
        bgGradient = "from-yellow-900/30 to-orange-900/40";
        borderColor = "border-yellow-500/40";
    } else { // Consumable
        iconColor = "text-green-400";
        bgGradient = "from-green-900/30 to-emerald-900/40";
        borderColor = "border-green-500/40";
    }
    
    const finalDisabled = isDisabledByGameLogic || !isAffordable;

    const handleClick = () => {
        if (!finalDisabled) {
            onClick(actionItem);
        }
    };

    // Split name into words for better wrapping
    const nameWords = name.split(' ');
    const displayName = nameWords.length > 1 && name.length > 12 
        ? nameWords.map(word => word.length > 8 ? word.slice(0, 6) + '...' : word).join(' ')
        : name.length > 12 ? name.slice(0, 12) + '...' : name;

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={finalDisabled}
            className={`
                relative w-full h-20 bg-gradient-to-br ${bgGradient} backdrop-blur-md
                border ${borderColor} rounded-lg transition-all duration-200 group
                ${finalDisabled 
                    ? 'opacity-40 cursor-not-allowed' 
                    : `hover:${borderColor.replace('/40', '/70')} cursor-pointer hover:scale-105 hover:shadow-xl`
                }
                flex flex-col items-center justify-center p-2 shadow-lg overflow-hidden
            `}
        >
            <img
              src="/assets/activity-card/camp.gif" // Fallback GIF
              alt="Action slot background"
              className={`transition-all duration-500 ease-in-out absolute inset-0 w-full h-full object-cover ${
                isHovered && !finalDisabled ? 'opacity-10 scale-110' : 'opacity-0 scale-100'
              }`}
            />
            <div className={`relative z-10 w-8 h-8 mb-1 ${finalDisabled ? 'filter grayscale opacity-50' : iconColor} transition-all duration-200`}>
                <GetSpellIcon iconName={iconName} className="w-full h-full drop-shadow-lg" />
            </div>
            
            {/* Improved text with line breaking */}
            <div className="relative z-10 text-slate-100 text-center text-xs font-semibold leading-tight mb-1 px-1 h-6 flex items-center justify-center">
                <span className="break-words" title={name}>
                    {displayName}
                </span>
            </div>
            
            {costText && (
                <span className={`relative z-10 text-xs font-bold ${costColor} drop-shadow-md`}>
                    {costText}
                </span>
            )}
            
            {!isAffordable && !isDisabledByGameLogic && (
                <div className="absolute top-1 right-1 bg-red-500/90 text-white text-xs px-1 py-0.5 rounded font-bold shadow-lg">
                    LOW
                </div>
            )}
        </button>
    );
};

// Enhanced Status Display Component
interface StatusDisplayProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onInfoClick: () => void;
}

const EnhancedStatusDisplay: React.FC<StatusDisplayProps> = ({ player, effectiveStats, onInfoClick }) => (
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-lg p-3 border border-slate-600/40 shadow-xl h-full">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-bold text-slate-100 tracking-wide truncate">{player.name || "Hero"}</h3>
      <button 
        onClick={onInfoClick}
        className="text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110 p-1 rounded hover:bg-cyan-500/10"
        title="View detailed stats"
      >
        <BookIcon className="w-4 h-4" />
      </button>
    </div>
    
    <div className="space-y-2">
      {/* Health Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center min-w-0">
          <HealIcon className="w-4 h-4 text-red-400 mr-1 flex-shrink-0" />
          <span className="text-slate-300 font-semibold text-sm">HP</span>
        </div>
        <div className="flex-1 relative bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.max(0, (player.hp / effectiveStats.maxHp) * 100)}%` }}
          />
        </div>
        <span className="text-red-300 font-bold text-sm min-w-0 flex-shrink-0">{player.hp}/{effectiveStats.maxHp}</span>
      </div>
      
      {/* Mana Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center min-w-0">
          <LightningBoltIcon className="w-4 h-4 text-blue-400 mr-1 flex-shrink-0" />
          <span className="text-slate-300 font-semibold text-sm">MP</span>
        </div>
        <div className="flex-1 relative bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.max(0, (player.mp / effectiveStats.maxMp) * 100)}%` }}
          />
        </div>
        <span className="text-blue-300 font-bold text-sm min-w-0 flex-shrink-0">{player.mp}/{effectiveStats.maxMp}</span>
      </div>
      
      {/* Energy Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center min-w-0">
          <StarIcon className="w-4 h-4 text-yellow-400 mr-1 flex-shrink-0" />
          <span className="text-slate-300 font-semibold text-sm">EP</span>
        </div>
        <div className="flex-1 relative bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-amber-400 h-2 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.max(0, (player.ep / effectiveStats.maxEp) * 100)}%` }}
          />
        </div>
        <span className="text-yellow-300 font-bold text-sm min-w-0 flex-shrink-0">{player.ep}/{effectiveStats.maxEp}</span>
      </div>
    </div>
  </div>
);

// Enhanced Enemy Display Component with Sprite
interface EnhancedEnemyDisplayProps {
  enemy: Enemy;
  isTargeted: boolean;
  onClick: () => void;
  onInfoClick: () => void;
}

const EnhancedEnemyDisplay: React.FC<EnhancedEnemyDisplayProps> = ({ enemy, isTargeted, onClick, onInfoClick }) => {
  return (
    <div className="flex flex-col items-center relative">
      {/* Enemy Sprite with Health Bar Overlay */}
      <div className="relative mb-2">
        {/* Health Bar Overlay - Positioned above sprite */}
        <div 
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 cursor-pointer hover:bg-slate-800/70 transition-all duration-200 rounded-md z-10"
          onClick={onInfoClick}
          title={`View ${enemy.name} details`}
        >
          {/* Name */}
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-t-md px-2 py-0.5 border-x border-t border-slate-600/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold text-xs truncate flex-1">{enemy.name}</span>
              <span className="text-slate-400 text-xs ml-1">L{enemy.level}</span>
            </div>
          </div>
          
          {/* Health Bar */}
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-b-md px-2 py-1 border border-slate-600/50">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-slate-400 text-xs">HP</span>
              <span className="text-red-300 font-mono text-xs">{enemy.hp}/{enemy.maxHp}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enemy Sprite */}
        <img 
          src="/assets/default-sprite/jorn-defaultmonster-front.png"
          alt={enemy.name}
          className={`w-32 h-32 object-contain transition-all duration-300 cursor-pointer ${
            isTargeted ? 'scale-110 drop-shadow-2xl' : 'hover:scale-105'
          }`}
          onClick={onClick}
          title={`Target ${enemy.name}`}
        />
        
        {/* Targeting Indicator */}
        {isTargeted && (
          <div className="absolute -inset-2 border-4 border-red-400/80 rounded-xl animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Status Effects (if any) */}
      {enemy.activeStatusEffects && enemy.activeStatusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center max-w-32">
          {enemy.activeStatusEffects.slice(0, 3).map((effect, index) => (
            <div key={index} className="bg-purple-900/80 text-purple-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
              {effect.name}
            </div>
          ))}
          {enemy.activeStatusEffects.length > 3 && (
            <div className="bg-slate-700/80 text-slate-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
              +{enemy.activeStatusEffects.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Player Display Component with Sprite
interface EnhancedPlayerDisplayProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onInfoClick: () => void;
}

const EnhancedPlayerDisplay: React.FC<EnhancedPlayerDisplayProps> = ({ player, effectiveStats, onInfoClick }) => {
    return (
    <div className="flex flex-col items-center relative">
      {/* Player Sprite - Clean without overlay */}
      <div className="relative mb-2">
        <img 
          src="/assets/default-sprite/jorn-default-back.png"
          alt={player.name || "Hero"}
          className="w-32 h-32 object-contain drop-shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300"
          title={`${player.name || "Hero"} - Click for details`}
          onClick={onInfoClick}
        />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg -z-10" />
      </div>

      {/* Status Effects (if any) */}
      {player.activeStatusEffects && player.activeStatusEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center max-w-32">
          {player.activeStatusEffects.slice(0, 3).map((effect, index) => (
            <div key={index} className="bg-purple-900/80 text-purple-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
              {effect.name}
            </div>
          ))}
          {player.activeStatusEffects.length > 3 && (
            <div className="bg-slate-700/80 text-slate-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
              +{player.activeStatusEffects.length - 3}
            </div>
          )}
        </div>
      )}
        </div>
    );
};

const CombatView: React.FC<CombatViewProps> = ({
  player, effectivePlayerStats, currentEnemies, targetEnemyId, onSetTargetEnemy,
  preparedSpells, onPlayerAttack, onPlayerBasicAttack, onPlayerDefend, onPlayerFlee, onPlayerFreestyleAction,
  combatLog, isPlayerTurn, playerActionSkippedByStun,
  onUseConsumable, onUseAbility, consumables, abilities,
  onSeekBattle,
}) => {
  const [activeDynamicView, setActiveDynamicView] = useState<DynamicAreaView>('actions');
  const [freestyleActionText, setFreestyleActionText] = useState('');
  const [showEnemyDetailsModal, setShowEnemyDetailsModal] = useState<Enemy | null>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [showMobileDynamicModal, setShowMobileDynamicModal] = useState(false);
  
  // Pagination states for swipeable spell/ability/item grids
  const [spellPage, setSpellPage] = useState(0);
  const [abilityPage, setAbilityPage] = useState(0);
  const [itemPage, setItemPage] = useState(0);
  
  const canPlayerAct = isPlayerTurn && !playerActionSkippedByStun;
  const ITEMS_PER_PAGE = 4; // 4 items per row on mobile

  const handleFreestyleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freestyleActionText.trim() || !canPlayerAct) return;
    onPlayerFreestyleAction(freestyleActionText, targetEnemyId);
    setFreestyleActionText('');
  };

  const handleCategoryChange = (view: DynamicAreaView) => {
    setActiveDynamicView(view);
    // Reset pagination when switching categories
    setSpellPage(0);
    setAbilityPage(0);
    setItemPage(0);
    // Show mobile modal on mobile devices
    if (window.innerWidth < 768) {
      setShowMobileDynamicModal(true);
    }
  };

  const getEnemyGridLayout = () => {
    const count = currentEnemies.length;
    if (count === 1) return "flex justify-center";
    if (count === 2) return "grid grid-cols-2 gap-8 justify-items-center";
    if (count <= 4) return "grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center";
    return "grid grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center";
  };

  // Swipeable pagination component
  const SwipeablePagination: React.FC<{
    items: CombatActionItemType[];
    currentPage: number;
    onPageChange: (page: number) => void;
    type: 'spell' | 'ability' | 'consumable';
  }> = ({ items, currentPage, onPageChange, type }) => {
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, items.length);
    const currentItems = items.slice(startIndex, endIndex);
    
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe && currentPage < totalPages - 1) {
        onPageChange(currentPage + 1);
      }
      if (isRightSwipe && currentPage > 0) {
        onPageChange(currentPage - 1);
      }
    };

    return (
      <div className="h-full flex flex-col">
        {/* Items Grid */}
        <div 
          className="flex-1 grid grid-cols-4 gap-2 p-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentItems.map(item => (
            <EnhancedCombatActionSlot 
              key={item.id} 
              actionItem={item} 
              player={player}
              onClick={(action) => {
                if (!canPlayerAct) return;
                if (type === 'spell') { 
                  if(targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId); 
                  else alert("Select a target first!"); 
                }
                else if (type === 'ability') onUseAbility((action as Ability).id, targetEnemyId);
                else if (type === 'consumable') onUseConsumable((action as Consumable).id, null);
                // Close modal after action on mobile
                if (window.innerWidth < 768) {
                  setShowMobileDynamicModal(false);
                }
              }}
              isDisabledByGameLogic={!canPlayerAct} 
            />
          ))}
          
          {/* Fill empty slots to maintain grid */}
          {Array.from({ length: ITEMS_PER_PAGE - currentItems.length }).map((_, index) => (
            <div key={`empty-${index}`} className="w-full h-20 opacity-0"></div>
          ))}
        </div>
        
        {/* Page Indicator */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2 bg-slate-800/30 border-t border-slate-600/30">
            <button
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="w-6 h-6 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold disabled:opacity-30 hover:bg-slate-600/50 transition-colors"
            >
              ‹
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => onPageChange(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentPage 
                      ? 'bg-cyan-400 scale-125' 
                      : 'bg-slate-600/50 hover:bg-slate-500/50'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="w-6 h-6 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold disabled:opacity-30 hover:bg-slate-600/50 transition-colors"
            >
              ›
            </button>
            
            <span className="text-xs text-slate-400 ml-2">
              {currentPage + 1}/{totalPages}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderDynamicAreaContent = () => {
    const renderActionGrid = (items: CombatActionItemType[], type: 'spell' | 'ability' | 'consumable') => {
      if (items.length === 0) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-3">
              <div className="w-12 h-12 mx-auto mb-2 text-slate-500/50">
                {type === 'spell' ? <WandIcon className="w-full h-full" /> :
                 type === 'ability' ? <StarIcon className="w-full h-full" /> :
                 <PotionGenericIcon className="w-full h-full" />}
              </div>
              <p className="text-slate-400 text-sm font-semibold">
                {type === 'spell' ? "No spells prepared" :
                 type === 'ability' ? "No abilities available" :
                 "No items available"}
              </p>
            </div>
            </div>
        );
      }
      
      // Desktop layout - show all items in a scrollable grid
      const renderDesktopGrid = () => (
        <div className="h-full p-3 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {items.map(item => (
              <EnhancedCombatActionSlot 
                key={item.id} 
                actionItem={item} 
                player={player}
                onClick={(action) => {
                  if (!canPlayerAct) return;
                  if (type === 'spell') { 
                    if(targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId); 
                    else alert("Select a target first!"); 
                  }
                  else if (type === 'ability') onUseAbility((action as Ability).id, targetEnemyId);
                  else if (type === 'consumable') onUseConsumable((action as Consumable).id, null);
                }}
                isDisabledByGameLogic={!canPlayerAct} 
              />
            ))}
          </div>
        </div>
      );
      
      // Mobile layout - use swipeable pagination
      const renderMobileGrid = () => {
        const currentPage = type === 'spell' ? spellPage : type === 'ability' ? abilityPage : itemPage;
        const setCurrentPage = type === 'spell' ? setSpellPage : type === 'ability' ? setAbilityPage : setItemPage;
        
        return (
          <SwipeablePagination
            items={items}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            type={type}
          />
        );
      };
      
      // Return desktop grid for desktop, mobile grid for mobile
      return (
        <>
          <div className="hidden md:block h-full">
            {renderDesktopGrid()}
          </div>
          <div className="md:hidden h-full">
            {renderMobileGrid()}
          </div>
        </>
      );
    };

    switch (activeDynamicView) {
      case 'actions':
        return (
          <div className="p-3 h-full flex flex-col gap-3">
            {/* Quick Actions - 2x2 grid */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              <ActionButton 
                onClick={() => { 
                  if(targetEnemyId) { 
                    onPlayerBasicAttack(targetEnemyId); 
                  } else alert("Select a target first!");
                  // Close modal after action on mobile
                  if (window.innerWidth < 768) {
                    setShowMobileDynamicModal(false);
                  }
                }} 
                variant="danger" 
                size="md"
                icon={<SwordsIcon className="w-5 h-5"/>} 
                disabled={!targetEnemyId || !canPlayerAct} 
                className="h-full text-sm font-bold px-2 flex flex-col items-center justify-center gap-1"
              >
                ATTACK
              </ActionButton>
              <ActionButton 
                onClick={() => {
                  onPlayerDefend();
                  // Close modal after action on mobile
                  if (window.innerWidth < 768) {
                    setShowMobileDynamicModal(false);
                  }
                }} 
                variant="info" 
                size="md"
                icon={<ShieldIcon className="w-5 h-5"/>} 
                disabled={!canPlayerAct} 
                className="h-full text-sm font-bold px-2 flex flex-col items-center justify-center gap-1"
              >
                DEFEND
              </ActionButton>
              <ActionButton 
                onClick={() => {
                  onPlayerFlee();
                  // Close modal after action on mobile
                  if (window.innerWidth < 768) {
                    setShowMobileDynamicModal(false);
                  }
                }} 
                variant="warning" 
                size="md"
                icon={<FleeIcon className="w-5 h-5"/>} 
                disabled={!canPlayerAct} 
                className="h-full text-sm font-bold px-2 flex flex-col items-center justify-center gap-1"
              >
                FLEE
              </ActionButton>
              <ActionButton 
                type="submit" 
                variant="secondary" 
                size="md"
                className="h-full text-sm font-bold px-2 flex flex-col items-center justify-center gap-1" 
                disabled={!canPlayerAct || !freestyleActionText.trim()} 
                onClick={() => {
                  handleFreestyleSubmit(new Event('submit') as any);
                  // Close modal after action on mobile
                  if (window.innerWidth < 768) {
                    setShowMobileDynamicModal(false);
                  }
                }}
              >
                CUSTOM
              </ActionButton>
            </div>
            
            {/* Custom Action */}
            <div className="h-20">
              <form onSubmit={handleFreestyleSubmit} className="h-full">
                <textarea 
                  value={freestyleActionText} 
                  onChange={(e) => setFreestyleActionText(e.target.value)} 
                  placeholder="Describe your custom action..." 
                  rows={3}
                  className="w-full h-full p-3 bg-slate-800/60 backdrop-blur-md border border-slate-600/40 rounded-lg text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm resize-none shadow-lg" 
                  disabled={!canPlayerAct} 
                />
                </form>
            </div>
            </div>
        );
      case 'spells': return renderActionGrid(preparedSpells, 'spell');
      case 'abilities': return renderActionGrid(abilities, 'ability');
      case 'items': return renderActionGrid(consumables, 'consumable');
      case 'log': 
        return (
          <div className="h-full p-2">
            <div className="bg-slate-800/40 backdrop-blur-md rounded-lg p-2 h-full border border-slate-600/30 overflow-y-auto">
              <CombatLogDisplay logs={combatLog} />
            </div>
          </div>
        );
      default: 
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-sm font-semibold">Select an action category</p>
          </div>
        );
    }
  };

  const actionCategories: { view: DynamicAreaView; label: string; icon: React.ReactNode; count?: number }[] = [
    { view: 'actions', label: 'Actions', icon: <SwordsIcon className="w-full h-full" /> },
    { view: 'spells', label: 'Spells', icon: <WandIcon className="w-full h-full" />, count: preparedSpells.length },
    { view: 'abilities', label: 'Abilities', icon: <StarIcon className="w-full h-full" />, count: abilities.length },
    { view: 'items', label: 'Items', icon: <PotionGenericIcon className="w-full h-full" />, count: consumables.length },
    { view: 'log', label: 'Log', icon: <BookIcon className="w-full h-full" /> },
  ];

  if (currentEnemies.length === 0 && !playerActionSkippedByStun) {
    return (
      <div className="fixed inset-0 top-16 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 to-slate-800 z-40">
        <LoadingSpinner text="Preparing battle..." size="lg" />
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden z-40">
      {/* Background effects - Extended beyond battle area */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-slate-800/60 to-emerald-900/20" />
      
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Top Section - Enemy Display */}
        <div className="flex-shrink-0 pt-28 pb-4">
          <div className="flex justify-center">
            {currentEnemies.map(enemy => (
              <EnhancedEnemyDisplay
                key={enemy.id}
                enemy={enemy}
                isTargeted={targetEnemyId === enemy.id}
                onClick={() => onSetTargetEnemy(enemy.id)}
                onInfoClick={() => setShowEnemyDetailsModal(enemy)}
              />
            ))}
          </div>
        </div>

        {/* Middle Section - Player Sprite Area */}
        <div className="flex-1 flex items-center justify-center relative">
          <EnhancedPlayerDisplay 
            player={player}
            effectiveStats={effectivePlayerStats}
            onInfoClick={() => setShowPlayerDetailsModal(true)}
          />
        </div>

        {/* Bottom Section - Player Stats */}
        <div className="flex-shrink-0 p-2">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-lg border border-slate-600/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-bold text-sm">{player.name || "Hero"}</span>
              <div className="flex gap-2">
                {/* Action Category Buttons - Horizontal */}
                {actionCategories.map(cat => (
                  <button
                    key={cat.view}
                    onClick={() => handleCategoryChange(cat.view)}
                    disabled={cat.view !== 'log' && !canPlayerAct}
                    className={`
                      w-8 h-8 rounded-lg transition-all duration-200 border flex items-center justify-center relative
                      ${activeDynamicView === cat.view 
                        ? 'bg-cyan-600/40 border-cyan-400/60 text-cyan-200' 
                        : cat.view !== 'log' && !canPlayerAct
                          ? 'bg-slate-800/40 border-slate-700/40 text-slate-500 opacity-50'
                          : 'bg-slate-800/60 border-slate-600/40 text-slate-300 hover:bg-slate-700/60'
                      }
                    `}
                  >
                    <div className="w-4 h-4">
                      {cat.icon}
                    </div>
                    {cat.count !== undefined && cat.count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                        {cat.count > 9 ? '9+' : cat.count}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Health, Mana, and Energy Bars */}
            <div className="space-y-1">
              {/* Health Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-red-300 font-semibold text-xs w-6">HP</span>
                <div className="flex-1 relative bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, (player.hp / effectivePlayerStats.maxHp) * 100)}%` }}
                  />
                </div>
                <span className="text-red-300 font-bold text-xs min-w-0">{player.hp}/{effectivePlayerStats.maxHp}</span>
              </div>
              
              {/* Mana Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-blue-300 font-semibold text-xs w-6">MP</span>
                <div className="flex-1 relative bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, (player.mp / effectivePlayerStats.maxMp) * 100)}%` }}
                  />
                </div>
                <span className="text-blue-300 font-bold text-xs min-w-0">{player.mp}/{effectivePlayerStats.maxMp}</span>
              </div>

              {/* Energy Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-yellow-300 font-semibold text-xs w-6">EP</span>
                <div className="flex-1 relative bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, (player.ep / effectivePlayerStats.maxEp) * 100)}%` }}
                  />
                </div>
                <span className="text-yellow-300 font-bold text-xs min-w-0">{player.ep}/{effectivePlayerStats.maxEp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Keep existing */}
      <div className="hidden md:flex md:flex-col h-full">
        {/* Battlefield - Full Center with proper background and height */}
        <div className="flex-1 relative mx-4 md:mx-8 mb-2 md:mb-4 overflow-hidden backdrop-blur-sm rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/50 border border-slate-700/30 min-h-[400px]">
          {/* Background battlefield effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
          
          {/* Enemies Section - Top of battlefield */}
          <div className="absolute top-16 md:top-28 left-1/2 transform -translate-x-1/2 z-30 w-full">
            <div className={`${getEnemyGridLayout()} px-4 md:px-8`}>
              {currentEnemies.map(enemy => (
                <EnhancedEnemyDisplay
                    key={enemy.id}
                    enemy={enemy}
                    isTargeted={targetEnemyId === enemy.id}
                    onClick={() => onSetTargetEnemy(enemy.id)}
                    onInfoClick={() => setShowEnemyDetailsModal(enemy)}
                />
                ))}
            </div>
          </div>

          {/* Player Area - Bottom */}
          <div className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20">
            <EnhancedPlayerDisplay 
                    player={player}
                    effectiveStats={effectivePlayerStats}
                    onInfoClick={() => setShowPlayerDetailsModal(true)}
                />
            </div>
          
          {/* Battle effects */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
        </div>

        {/* Desktop Bottom Panel */}
        <div className="flex-shrink-0 p-2 md:p-4">
          <div className="flex flex-row gap-4 h-36">
            {/* Player Stats */}
            <div className="w-1/4">
              <EnhancedStatusDisplay 
                player={player}
                effectiveStats={effectivePlayerStats}
                onInfoClick={() => setShowPlayerDetailsModal(true)}
              />
            </div>

            {/* Dynamic Area */}
            <div className="w-1/2">
              <div className="h-full bg-slate-800/40 backdrop-blur-xl rounded-lg border border-slate-600/40 overflow-hidden shadow-xl">
                {renderDynamicAreaContent()}
              </div>
            </div>

            {/* Action Categories */}
            <div className="w-1/4">
              <div className="grid grid-rows-5 gap-1 h-full">
                {actionCategories.map(cat => (
                  <ActionCategoryButton
                    key={cat.view}
                    label={cat.label}
                    icon={cat.icon}
                    isActive={activeDynamicView === cat.view}
                    onClick={() => handleCategoryChange(cat.view)}
                    disabled={cat.view !== 'log' && !canPlayerAct}
                    count={cat.count}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dynamic Modal Overlay */}
      {showMobileDynamicModal && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowMobileDynamicModal(false)}
          />
          
          {/* Modal Content - Panel over bottom section */}
          <div className="absolute left-2 right-2 bottom-2">
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden max-h-[45vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-2 border-b border-slate-600/50 bg-slate-900/50">
                <h3 className="text-sm font-bold text-slate-100 capitalize">
                  {activeDynamicView === 'actions' ? 'Combat Actions' : 
                   activeDynamicView === 'spells' ? 'Spells' :
                   activeDynamicView === 'abilities' ? 'Abilities' :
                   activeDynamicView === 'items' ? 'Items' : 'Combat Log'}
                </h3>
                <button
                  onClick={() => setShowMobileDynamicModal(false)}
                  className="w-6 h-6 rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-slate-200 transition-colors flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
              
              {/* Modal Body - Optimized height for panel */}
              <div className="h-56">
                {renderDynamicAreaContent()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showEnemyDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowEnemyDetailsModal(null)} title={showEnemyDetailsModal.name} size="lg">
            <EnemyDisplay enemy={showEnemyDetailsModal} />
        </Modal>
      )}
      {showPlayerDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowPlayerDetailsModal(false)} title={`${player.name || "Hero"} - Stats`} size="lg">
            <PlayerStatsDisplay player={player} effectiveStats={effectivePlayerStats} />
        </Modal>
      )}
      
      {/* Stun Overlay */}
      {playerActionSkippedByStun && isPlayerTurn && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-50 backdrop-blur-lg">
          <div className="text-center p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border-4 border-yellow-500/80 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-bounce">
              <StarIcon className="w-full h-full" />
            </div>
            <p className="text-yellow-300 text-3xl font-bold mb-2">STUNNED!</p>
            <p className="text-slate-300 text-lg">You cannot act this turn</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatView;