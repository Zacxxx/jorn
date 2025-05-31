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
}

type DynamicAreaView = 'actions' | 'spells' | 'abilities' | 'items' | 'log';
type CombatActionItemType = Spell | Ability | Consumable;

// --- Enhanced Helper Components ---
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

const ActionCategoryButton: React.FC<ActionCategoryButtonProps> = ({ label, icon, isActive, onClick, disabled, count }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 
      ${isActive 
        ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/40 border-2 border-cyan-400/80 shadow-lg shadow-cyan-500/40' 
        : 'bg-slate-800/50 border-2 border-slate-600/40 hover:border-cyan-400/60 hover:bg-slate-700/60'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      min-h-[100px] backdrop-blur-md group flex-1
    `}
  >
    <div className={`w-8 h-8 mb-2 transition-all duration-300 ${isActive ? 'text-cyan-300 scale-110' : 'text-slate-300 group-hover:text-cyan-400'}`}>
      {icon}
    </div>
    <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-cyan-200' : 'text-slate-300 group-hover:text-cyan-300'}`}>
      {label}
    </span>
    {count !== undefined && count > 0 && (
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
        {count > 99 ? '99+' : count}
      </div>
    )}
  </button>
);

interface EnhancedCombatActionSlotProps {
  actionItem: CombatActionItemType;
  player: Player; 
  onClick: (item: CombatActionItemType) => void;
  onMouseEnter: (event: React.MouseEvent, item: CombatActionItemType) => void;
  onMouseLeave: () => void;
  isDisabledByGameLogic: boolean; 
}

const EnhancedCombatActionSlot: React.FC<EnhancedCombatActionSlotProps> = ({ 
  actionItem, player, onClick, onMouseEnter, onMouseLeave, isDisabledByGameLogic 
}) => {
  const { name, iconName } = actionItem;
  let costText = "";
  let costColor = "text-slate-400";
  let iconColor = "text-sky-300";
  let isAffordable = true;
  let bgGradient = "from-slate-800/60 to-slate-900/80";
  let borderColor = "border-slate-600/50";
  let shadowColor = "shadow-slate-500/10";

  if ('manaCost' in actionItem) { // Spell
    costText = `${actionItem.manaCost} MP`;
    isAffordable = player.mp >= actionItem.manaCost;
    costColor = isAffordable ? "text-blue-300" : "text-red-400";
    iconColor = "text-blue-400";
    bgGradient = "from-blue-900/30 to-indigo-900/40";
    borderColor = "border-blue-500/40";
    shadowColor = "shadow-blue-500/20";
  } else if ('epCost' in actionItem) { // Ability
    costText = `${actionItem.epCost} EP`;
    isAffordable = player.ep >= actionItem.epCost;
    costColor = isAffordable ? "text-yellow-300" : "text-red-400";
    iconColor = "text-yellow-400";
    bgGradient = "from-yellow-900/30 to-orange-900/40";
    borderColor = "border-yellow-500/40";
    shadowColor = "shadow-yellow-500/20";
  } else { // Consumable
    iconColor = "text-green-400";
    bgGradient = "from-green-900/30 to-emerald-900/40";
    borderColor = "border-green-500/40";
    shadowColor = "shadow-green-500/20";
  }
  
  const finalDisabled = isDisabledByGameLogic || !isAffordable;

  return (
    <button
      onClick={() => onClick(actionItem)}
      onMouseEnter={(e) => onMouseEnter(e, actionItem)}
      onMouseLeave={onMouseLeave}
      disabled={finalDisabled}
      className={`
        relative w-full h-24 bg-gradient-to-br ${bgGradient} backdrop-blur-md
        border-2 ${borderColor} rounded-xl transition-all duration-300 group
        ${finalDisabled 
          ? 'opacity-40 cursor-not-allowed' 
          : `hover:${borderColor.replace('/40', '/70')} hover:shadow-lg hover:${shadowColor} cursor-pointer hover:scale-105`
        }
        flex flex-col items-center justify-center p-3 shadow-lg overflow-hidden
      `}
    >
      <div className={`relative z-10 w-10 h-10 mb-1 ${finalDisabled ? 'filter grayscale opacity-50' : iconColor} transition-all duration-300 group-hover:scale-110`}>
        <GetSpellIcon iconName={iconName} className="w-full h-full drop-shadow-lg" />
      </div>
      <span className="relative z-10 text-slate-100 text-center text-xs font-bold truncate w-full mb-1 drop-shadow-md">
        {name}
      </span>
      {costText && (
        <span className={`relative z-10 text-xs font-bold ${costColor} drop-shadow-md`}>
          {costText}
        </span>
      )}
      {!isAffordable && !isDisabledByGameLogic && (
        <div className="absolute top-1 right-1 bg-red-500/90 text-white text-xs px-1.5 py-0.5 rounded-md font-bold shadow-lg">
          LOW
        </div>
      )}
    </button>
  );
};

interface CombatActionTooltipProps {
  actionItem: CombatActionItemType;
  position: { x: number, y: number };
}

const CombatActionTooltip: React.FC<CombatActionTooltipProps> = ({ actionItem, position }) => {
  const { name, iconName, description } = actionItem;
  const style: React.CSSProperties = {
    position: 'fixed', 
    zIndex: 1100, 
    minWidth: '320px', 
    maxWidth: '400px', 
    pointerEvents: 'none',
  };
  
  if (typeof window !== 'undefined') {
    const { innerWidth, innerHeight } = window;
    if (position.x + 200 > innerWidth) {
      style.right = 15;
      style.left = 'auto';
    } else {
      style.left = position.x - 160 < 0 ? 15 : position.x - 160;
    }
    if (position.y + 200 > innerHeight) {
      style.bottom = innerHeight - position.y + 15;
      style.top = 'auto';
    } else {
      style.top = position.y + 15;
      style.bottom = 'auto';
    }
  }

  return (
    <div style={style} className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border-2 border-cyan-400/60 text-slate-200">
      <div className="flex items-center mb-3 pb-2 border-b border-slate-700/50">
        <GetSpellIcon iconName={iconName} className="w-8 h-8 mr-3 flex-shrink-0 drop-shadow-lg" />
        <h5 className="text-lg font-bold text-cyan-300">{name}</h5>
      </div>
      <p className="text-sm text-slate-300 mb-3 italic leading-relaxed">{description}</p>
      
      {'manaCost' in actionItem && (actionItem as Spell).manaCost !== undefined && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>MP Cost:</span>
            <span className="font-bold text-blue-300">{(actionItem as Spell).manaCost}</span>
          </div>
          <div className="flex justify-between">
            <span>Damage:</span>
            <span className="font-bold text-red-300">{(actionItem as Spell).damage} ({(actionItem as Spell).damageType})</span>
          </div>
        </div>
      )}
      
      {'epCost' in actionItem && (actionItem as Ability).epCost !== undefined && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>EP Cost:</span>
            <span className="font-bold text-yellow-300">{(actionItem as Ability).epCost}</span>
          </div>
          <div className="flex justify-between">
            <span>Effect:</span>
            <span className="font-bold text-lime-300">{(actionItem as Ability).effectType.replace(/_/g, ' ')}</span>
          </div>
        </div>
      )}
      
      {'itemType' in actionItem && actionItem.itemType === 'Consumable' && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-bold text-green-300">{(actionItem as Consumable).itemType}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Status Display Component
interface StatusDisplayProps {
  player: Player;
  effectiveStats: PlayerEffectiveStats;
  onInfoClick: () => void;
}

const EnhancedStatusDisplay: React.FC<StatusDisplayProps> = ({ player, effectiveStats, onInfoClick }) => (
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border-2 border-slate-600/40 shadow-xl h-full">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold text-slate-100 tracking-wide">{player.name || "Hero"}</h3>
      <button 
        onClick={onInfoClick}
        className="text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/10"
        title="View detailed stats"
      >
        <BookIcon className="w-5 h-5" />
      </button>
    </div>
    
    <div className="space-y-3">
      {/* Health Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <HealIcon className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-slate-300 font-semibold">Health</span>
          </div>
          <span className="text-red-300 font-bold">{player.hp}/{player.maxHp}</span>
        </div>
        <div className="relative w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Mana Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <LightningBoltIcon className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-slate-300 font-semibold">Mana</span>
          </div>
          <span className="text-blue-300 font-bold">{player.mp}/{player.maxMp}</span>
        </div>
        <div className="relative w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.max(0, (player.mp / player.maxMp) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Energy Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-slate-300 font-semibold">Energy</span>
          </div>
          <span className="text-yellow-300 font-bold">{player.ep}/{player.maxEp}</span>
        </div>
        <div className="relative w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-amber-400 h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{ width: `${Math.max(0, (player.ep / player.maxEp) * 100)}%` }}
          />
        </div>
      </div>
    </div>
    
    {/* Status Effects */}
    {player.activeStatusEffects && player.activeStatusEffects.length > 0 && (
      <div className="mt-3 pt-3 border-t border-slate-600/50">
        <div className="flex flex-wrap gap-1">
          {player.activeStatusEffects.slice(0, 3).map((effect, index) => (
            <div key={index} className="bg-purple-900/60 text-purple-300 text-xs px-2 py-1 rounded-md font-bold">
              {effect.name}
            </div>
          ))}
          {player.activeStatusEffects.length > 3 && (
            <div className="bg-slate-700/60 text-slate-300 text-xs px-2 py-1 rounded-md font-bold">
              +{player.activeStatusEffects.length - 3}
            </div>
          )}
        </div>
      </div>
    )}
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
      {/* Enemy Sprite */}
      <div className="relative mb-4">
        <img 
          src="/assets/default-sprite/jorn-defaultmonster-front.png"
          alt={enemy.name}
          className={`w-24 h-24 object-contain transition-all duration-300 cursor-pointer ${
            isTargeted ? 'scale-110 drop-shadow-2xl' : 'hover:scale-105'
          }`}
          onClick={onClick}
          title={`Target ${enemy.name}`}
        />
        {isTargeted && (
          <div className="absolute -inset-2 border-4 border-red-400/80 rounded-xl animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Enemy Info Card */}
      <button 
        onClick={onInfoClick}
        className={`bg-slate-800/90 backdrop-blur-md p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl ${
          isTargeted 
            ? 'border-red-400/80 shadow-lg shadow-red-500/30' 
            : 'border-slate-600/40 hover:border-slate-500/60'
        }`}
        title={`View ${enemy.name} details`}
      >
        <div className="text-center mb-2">
          <h4 className="text-slate-200 font-bold text-lg">{enemy.name}</h4>
          <span className="text-slate-400 text-sm">Level {enemy.level}</span>
        </div>
        
        <div className="space-y-2 min-w-[120px]">
          <div className="text-xs text-slate-400">Health</div>
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
            />
          </div>
          <div className="text-sm text-red-300 font-semibold text-center">
            {enemy.hp}/{enemy.maxHp}
          </div>
        </div>

        {/* Status Effects */}
        {enemy.activeStatusEffects && enemy.activeStatusEffects.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-600/50">
            <div className="flex flex-wrap gap-1 justify-center">
              {enemy.activeStatusEffects.slice(0, 3).map((effect, index) => (
                <div key={index} className="bg-purple-900/60 text-purple-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
                  {effect.name}
                </div>
              ))}
              {enemy.activeStatusEffects.length > 3 && (
                <div className="bg-slate-700/60 text-slate-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
                  +{enemy.activeStatusEffects.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </button>
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
      {/* Player Sprite */}
      <div className="relative mb-4">
        <img 
          src="/assets/default-sprite/jorn-default-back.png"
          alt={player.name || "Hero"}
          className="w-24 h-24 object-contain drop-shadow-2xl"
          title={player.name || "Hero"}
        />
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-lg -z-10" />
      </div>

      {/* Player Info Card */}
      <button 
        onClick={onInfoClick}
        className="bg-slate-800/90 backdrop-blur-md p-3 rounded-xl border-2 border-cyan-600/40 transition-all duration-300 hover:scale-105 cursor-pointer shadow-xl hover:border-cyan-500/60"
        title={`View ${player.name || "Hero"} details`}
      >
        <div className="text-center mb-2">
          <h4 className="text-slate-200 font-bold text-lg">{player.name || "Hero"}</h4>
          <span className="text-slate-400 text-sm">Level {player.level}</span>
        </div>
        
        <div className="space-y-2 min-w-[120px]">
          {/* Health */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Health</span>
              <span className="text-red-300 font-bold">{player.hp}/{player.maxHp}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Mana */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Mana</span>
              <span className="text-blue-300 font-bold">{player.mp}/{player.maxMp}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (player.mp / player.maxMp) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Energy */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Energy</span>
              <span className="text-yellow-300 font-bold">{player.ep}/{player.maxEp}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (player.ep / player.maxEp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Effects */}
        {player.activeStatusEffects && player.activeStatusEffects.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-600/50">
            <div className="flex flex-wrap gap-1 justify-center">
              {player.activeStatusEffects.slice(0, 3).map((effect, index) => (
                <div key={index} className="bg-purple-900/60 text-purple-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
                  {effect.name}
                </div>
              ))}
              {player.activeStatusEffects.length > 3 && (
                <div className="bg-slate-700/60 text-slate-300 text-xs px-1.5 py-0.5 rounded-md font-bold">
                  +{player.activeStatusEffects.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

const CombatView: React.FC<CombatViewProps> = ({
  player, effectivePlayerStats, currentEnemies, targetEnemyId, onSetTargetEnemy,
  preparedSpells, onPlayerAttack, onPlayerBasicAttack, onPlayerDefend, onPlayerFlee, onPlayerFreestyleAction,
  combatLog, isPlayerTurn, playerActionSkippedByStun,
  onUseConsumable, onUseAbility, consumables, abilities,
}) => {
  const [activeDynamicView, setActiveDynamicView] = useState<DynamicAreaView>('actions');
  const [freestyleActionText, setFreestyleActionText] = useState('');
  const [showEnemyDetailsModal, setShowEnemyDetailsModal] = useState<Enemy | null>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [hoveredCombatActionItem, setHoveredCombatActionItem] = useState<CombatActionItemType | null>(null);
  const [combatActionTooltipPosition, setCombatActionTooltipPosition] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (!isPlayerTurn || playerActionSkippedByStun) {
      setActiveDynamicView('log');
    }
  }, [isPlayerTurn, playerActionSkippedByStun]);

  const handleCategoryChange = useCallback((view: DynamicAreaView) => {
    setActiveDynamicView(view);
    setHoveredCombatActionItem(null);
    setCombatActionTooltipPosition(null);
  }, []);

  const handleFreestyleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freestyleActionText.trim() || !isPlayerTurn || playerActionSkippedByStun) return;
    onPlayerFreestyleAction(freestyleActionText, targetEnemyId);
    setFreestyleActionText('');
  };

  const handleGridSlotMouseEnter = useCallback((event: React.MouseEvent, item: CombatActionItemType) => {
    setHoveredCombatActionItem(item);
    setCombatActionTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleGridSlotMouseLeave = useCallback(() => {
    setHoveredCombatActionItem(null);
    setCombatActionTooltipPosition(null);
  }, []);

  const canPlayerAct = isPlayerTurn && !playerActionSkippedByStun;

  // Calculate enemy positioning for centering single enemies
  const getEnemyGridLayout = () => {
    const enemyCount = currentEnemies.length;
    if (enemyCount === 1) {
      // Center single enemy
      return "flex justify-center";
    } else if (enemyCount <= 3) {
      // Center multiple enemies but with some spacing
      return "flex justify-center gap-8";
    } else {
      // Use grid for many enemies
      return "grid grid-cols-5 gap-6";
    }
  };

  const renderDynamicAreaContent = () => {
    const renderActionGrid = (items: CombatActionItemType[], type: 'spell' | 'ability' | 'consumable') => {
      if (items.length === 0) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 text-slate-500/50">
                {type === 'spell' ? <WandIcon className="w-full h-full" /> :
                 type === 'ability' ? <StarIcon className="w-full h-full" /> :
                 <PotionGenericIcon className="w-full h-full" />}
              </div>
              <p className="text-slate-400 text-lg font-semibold">
                {type === 'spell' ? "No spells prepared" :
                 type === 'ability' ? "No abilities available" :
                 "No consumables available"}
              </p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4 h-full overflow-y-auto">
          {items.map(item => (
            <EnhancedCombatActionSlot 
              key={item.id} 
              actionItem={item} 
              player={player}
              onClick={(action) => {
                if (!canPlayerAct) return;
                handleGridSlotMouseLeave();
                if (type === 'spell') { 
                  if(targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId); 
                  else alert("Select a target first!"); 
                }
                else if (type === 'ability') onUseAbility((action as Ability).id, targetEnemyId);
                else if (type === 'consumable') onUseConsumable((action as Consumable).id, null);
              }}
              onMouseEnter={handleGridSlotMouseEnter} 
              onMouseLeave={handleGridSlotMouseLeave} 
              isDisabledByGameLogic={!canPlayerAct} 
            />
          ))}
        </div>
      );
    };

    switch (activeDynamicView) {
      case 'actions':
        return (
          <div className="p-4 h-full flex flex-col">
            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ActionButton 
                onClick={() => { 
                  if(targetEnemyId) { 
                    onPlayerBasicAttack(targetEnemyId); 
                  } else alert("Select a target first!");
                }} 
                variant="danger" 
                size="lg"
                icon={<SwordsIcon className="w-6 h-6"/>} 
                disabled={!targetEnemyId || !canPlayerAct} 
                className="h-16 text-lg font-bold"
              >
                ATTACK
              </ActionButton>
              <ActionButton 
                onClick={() => {onPlayerDefend();}} 
                variant="info" 
                size="lg"
                icon={<ShieldIcon className="w-6 h-6"/>} 
                disabled={!canPlayerAct} 
                className="h-16 text-lg font-bold"
              >
                DEFEND
              </ActionButton>
              <ActionButton 
                onClick={() => {onPlayerFlee();}} 
                variant="warning" 
                size="lg"
                icon={<FleeIcon className="w-6 h-6"/>} 
                disabled={!canPlayerAct} 
                className="h-16 text-lg font-bold"
              >
                FLEE
              </ActionButton>
              <ActionButton 
                type="submit" 
                variant="secondary" 
                size="lg"
                className="h-16 text-lg font-bold" 
                disabled={!canPlayerAct || !freestyleActionText.trim()} 
                onClick={handleFreestyleSubmit}
              >
                CUSTOM
              </ActionButton>
            </div>
            
            {/* Custom Action */}
            <div className="flex-grow">
              <form onSubmit={handleFreestyleSubmit} className="h-full">
                <textarea 
                  value={freestyleActionText} 
                  onChange={(e) => setFreestyleActionText(e.target.value)} 
                  placeholder="Describe your custom action..." 
                  rows={4}
                  className="w-full h-full p-3 bg-slate-800/60 backdrop-blur-md border-2 border-slate-600/40 rounded-xl text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base resize-none shadow-lg" 
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
          <div className="h-full p-4">
            <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3 h-full border border-slate-600/30 overflow-y-auto">
              <CombatLogDisplay logs={combatLog} />
            </div>
          </div>
        );
      default: 
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-lg font-semibold">Select an action category</p>
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
      {/* Enemies Section - Top */}
      <div className="flex-shrink-0 p-8 pb-4">
        <div className={getEnemyGridLayout()}>
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

      {/* Battlefield - Center */}
      <div className="flex-1 relative bg-gradient-to-b from-indigo-900/20 via-slate-800/60 to-emerald-900/20 mx-8 mb-4 overflow-hidden shadow-xl backdrop-blur-sm rounded-2xl border-2 border-slate-600/40">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        
        {/* Turn Indicator */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`px-8 py-3 rounded-xl font-bold text-xl shadow-xl backdrop-blur-md border-2 transition-all duration-500 ${
            isPlayerTurn 
              ? 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white border-green-400/60' 
              : 'bg-gradient-to-r from-red-500/80 to-rose-600/80 text-white border-red-400/60'
          }`}>
            {playerActionSkippedByStun ? '⚡ STUNNED!' : isPlayerTurn ? '⚔️ YOUR TURN' : '🛡️ ENEMY TURN'}
          </div>
        </div>
        
        {/* Player Area - Bottom with more space */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <EnhancedPlayerDisplay 
            player={player}
            effectiveStats={effectivePlayerStats}
            onInfoClick={() => setShowPlayerDetailsModal(true)}
          />
        </div>
        
        {/* Battle effects */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
      </div>

      {/* Bottom Panel - Actions */}
      <div className="flex-shrink-0 grid grid-cols-12 gap-6 p-6 pt-2">
        {/* Player Stats */}
        <div className="col-span-3">
          <EnhancedStatusDisplay 
            player={player} 
            effectiveStats={effectivePlayerStats} 
            onInfoClick={() => setShowPlayerDetailsModal(true)} 
          />
        </div>
        
        {/* Dynamic Area */}
        <div className="col-span-6">
          <div className="h-full bg-slate-800/40 backdrop-blur-xl rounded-xl border-2 border-slate-600/40 overflow-hidden shadow-xl">
            {renderDynamicAreaContent()}
          </div>
        </div>
        
        {/* Action Categories */}
        <div className="col-span-3">
          <div className="grid grid-rows-5 gap-2 h-full">
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
      {hoveredCombatActionItem && combatActionTooltipPosition && (
        <CombatActionTooltip actionItem={hoveredCombatActionItem} position={combatActionTooltipPosition} />
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