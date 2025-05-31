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
      relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 
      ${isActive 
        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border-2 border-cyan-400/70 shadow-lg shadow-cyan-500/30 scale-105' 
        : 'bg-slate-800/40 border-2 border-slate-600/30 hover:border-cyan-400/50 hover:bg-slate-700/50 hover:scale-102'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      min-h-[90px] backdrop-blur-md group
    `}
  >
    <div className={`w-10 h-10 mb-2 transition-all duration-300 ${isActive ? 'text-cyan-300 scale-110' : 'text-slate-300 group-hover:text-cyan-400'}`}>
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
        relative w-full h-32 bg-gradient-to-br ${bgGradient} backdrop-blur-md
        border-2 ${borderColor} rounded-2xl transition-all duration-300 group
        ${finalDisabled 
          ? 'opacity-40 cursor-not-allowed' 
          : `hover:${borderColor.replace('/40', '/70')} hover:shadow-xl hover:${shadowColor} cursor-pointer hover:scale-105 hover:-translate-y-1`
        }
        flex flex-col items-center justify-center p-4 shadow-lg overflow-hidden
      `}
    >
      {/* Animated background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
      
      <div className={`relative z-10 w-14 h-14 mb-2 ${finalDisabled ? 'filter grayscale opacity-50' : iconColor} transition-all duration-300 group-hover:scale-125 group-hover:rotate-12`}>
        <GetSpellIcon iconName={iconName} className="w-full h-full drop-shadow-lg" />
      </div>
      <span className="relative z-10 text-slate-100 text-center text-sm font-bold truncate w-full mb-1 drop-shadow-md">
        {name}
      </span>
      {costText && (
        <span className={`relative z-10 text-xs font-bold ${costColor} drop-shadow-md`}>
          {costText}
        </span>
      )}
      {!isAffordable && !isDisabledByGameLogic && (
        <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded-lg font-bold shadow-lg animate-bounce">
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
    minWidth: '350px', 
    maxWidth: '450px', 
    pointerEvents: 'none',
  };
  
  if (typeof window !== 'undefined') {
    const { innerWidth, innerHeight } = window;
    if (position.x + 225 > innerWidth) {
      style.right = 15;
      style.left = 'auto';
    } else {
      style.left = position.x - 175 < 0 ? 15 : position.x - 175;
    }
    if (position.y + 250 > innerHeight) {
      style.bottom = innerHeight - position.y + 20;
      style.top = 'auto';
    } else {
      style.top = position.y + 20;
      style.bottom = 'auto';
    }
  }

  return (
    <div style={style} className="bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border-2 border-cyan-400/60 text-slate-200 animate-in fade-in duration-200">
      <div className="flex items-center mb-4 pb-3 border-b border-slate-700/50">
        <GetSpellIcon iconName={iconName} className="w-10 h-10 mr-4 flex-shrink-0 drop-shadow-lg" />
        <h5 className="text-xl font-bold text-cyan-300 tracking-wide">{name}</h5>
      </div>
      <p className="text-sm text-slate-300 mb-4 italic leading-relaxed">{description}</p>
      
      {'manaCost' in actionItem && (actionItem as Spell).manaCost !== undefined && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
            <span className="font-medium">MP Cost:</span>
            <span className="font-bold text-blue-300">{(actionItem as Spell).manaCost}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
            <span className="font-medium">Damage:</span>
            <span className="font-bold text-red-300">{(actionItem as Spell).damage} ({(actionItem as Spell).damageType})</span>
          </div>
          {(actionItem as Spell).scalesWith && (
            <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
              <span className="font-medium">Scales With:</span>
              <span className="font-bold text-purple-300">{(actionItem as Spell).scalesWith}</span>
            </div>
          )}
          {(actionItem as Spell).effect && (
            <div className="mt-3 p-3 bg-slate-800/70 rounded-xl border border-slate-600/30">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Effect:</span>
              <p className="text-slate-300 text-sm mt-1">{(actionItem as Spell).effect}</p>
            </div>
          )}
        </div>
      )}
      
      {'epCost' in actionItem && (actionItem as Ability).epCost !== undefined && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
            <span className="font-medium">EP Cost:</span>
            <span className="font-bold text-yellow-300">{(actionItem as Ability).epCost}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
            <span className="font-medium">Effect Type:</span>
            <span className="font-bold text-lime-300">{(actionItem as Ability).effectType.replace(/_/g, ' ')}</span>
          </div>
          {(actionItem as Ability).magnitude !== undefined && (
            <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
              <span className="font-medium">Magnitude:</span>
              <span className="font-bold text-lime-300">{(actionItem as Ability).magnitude}</span>
            </div>
          )}
        </div>
      )}
      
      {'itemType' in actionItem && actionItem.itemType === 'Consumable' && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
            <span className="font-medium">Type:</span>
            <span className="font-bold text-green-300">{(actionItem as Consumable).itemType}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
            <span className="font-medium">Effect:</span>
            <span className="font-bold text-green-300">
              {(actionItem as Consumable).effectType.replace(/_/g, ' ')}
              {(actionItem as Consumable).magnitude !== undefined && ` (${(actionItem as Consumable).magnitude})`}
            </span>
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
  <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border-2 border-slate-600/40 shadow-2xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-slate-100 tracking-wide drop-shadow-md">{player.name || "Hero"}</h3>
      <button 
        onClick={onInfoClick}
        className="text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-cyan-500/10"
        title="View detailed stats"
      >
        <BookIcon className="w-6 h-6 drop-shadow-lg" />
      </button>
    </div>
    
    <div className="space-y-4">
      {/* Health Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <HealIcon className="w-5 h-5 text-red-400 mr-2 drop-shadow-lg" />
            <span className="text-slate-300 font-semibold">Health</span>
          </div>
          <span className="text-red-300 font-bold text-lg">{player.hp}/{player.maxHp}</span>
        </div>
        <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-red-500 via-red-400 to-red-300 h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
            style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Mana Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <LightningBoltIcon className="w-5 h-5 text-blue-400 mr-2 drop-shadow-lg" />
            <span className="text-slate-300 font-semibold">Mana</span>
          </div>
          <span className="text-blue-300 font-bold text-lg">{player.mp}/{player.maxMp}</span>
        </div>
        <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-300 h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
            style={{ width: `${Math.max(0, (player.mp / player.maxMp) * 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Energy Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400 mr-2 drop-shadow-lg" />
            <span className="text-slate-300 font-semibold">Energy</span>
          </div>
          <span className="text-yellow-300 font-bold text-lg">{player.ep}/{player.maxEp}</span>
        </div>
        <div className="relative w-full bg-slate-700/50 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-300 h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
            style={{ width: `${Math.max(0, (player.ep / player.maxEp) * 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Status Effects */}
    {player.activeStatusEffects && player.activeStatusEffects.length > 0 && (
      <div className="mt-4 pt-4 border-t border-slate-600/50">
        <div className="flex flex-wrap gap-2">
          {player.activeStatusEffects.slice(0, 4).map((effect, index) => (
            <div key={index} className="bg-purple-900/60 text-purple-300 text-xs px-3 py-1.5 rounded-full font-bold border border-purple-500/30 shadow-lg">
              {effect.name}
            </div>
          ))}
          {player.activeStatusEffects.length > 4 && (
            <div className="bg-slate-700/60 text-slate-300 text-xs px-3 py-1.5 rounded-full font-bold border border-slate-500/30 shadow-lg">
              +{player.activeStatusEffects.length - 4}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

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

  const renderDynamicAreaContent = () => {
    const renderActionGrid = (items: CombatActionItemType[], type: 'spell' | 'ability' | 'consumable') => {
      if (items.length === 0) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-10">
              <div className="w-20 h-20 mx-auto mb-6 text-slate-500/50">
                {type === 'spell' ? <WandIcon className="w-full h-full" /> :
                 type === 'ability' ? <StarIcon className="w-full h-full" /> :
                 <PotionGenericIcon className="w-full h-full" />}
              </div>
              <p className="text-slate-400 text-xl font-semibold">
                {type === 'spell' ? "No spells prepared" :
                 type === 'ability' ? "No abilities available" :
                 "No consumables available"}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                {type === 'spell' ? "Visit a spell crafting station to prepare spells" :
                 type === 'ability' ? "Learn abilities through training" :
                 "Find or craft consumable items"}
              </p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6 h-full overflow-y-auto">
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
          <div className="p-6 h-full flex flex-col">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <ActionButton 
                onClick={() => { 
                  if(targetEnemyId) { 
                    onPlayerBasicAttack(targetEnemyId); 
                  } else alert("Select a target first!");
                }} 
                variant="danger" 
                size="lg"
                icon={<SwordsIcon className="w-8 h-8"/>} 
                disabled={!targetEnemyId || !canPlayerAct} 
                className="h-20 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                ATTACK
              </ActionButton>
              <ActionButton 
                onClick={() => {onPlayerDefend();}} 
                variant="info" 
                size="lg"
                icon={<ShieldIcon className="w-8 h-8"/>} 
                disabled={!canPlayerAct} 
                className="h-20 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                DEFEND
              </ActionButton>
              <ActionButton 
                onClick={() => {onPlayerFlee();}} 
                variant="warning" 
                size="lg"
                icon={<FleeIcon className="w-8 h-8"/>} 
                disabled={!canPlayerAct} 
                className="h-20 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                FLEE
              </ActionButton>
              <ActionButton 
                type="submit" 
                variant="secondary" 
                size="lg"
                className="h-20 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" 
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
                  placeholder="Describe your custom action in detail..." 
                  rows={8}
                  className="w-full h-full p-5 bg-slate-800/60 backdrop-blur-md border-2 border-slate-600/40 rounded-2xl text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-lg resize-none shadow-xl font-medium leading-relaxed" 
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
          <div className="h-full p-6">
            <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 h-full border border-slate-600/30">
              <CombatLogDisplay logs={combatLog} />
            </div>
          </div>
        );
      default: 
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-xl font-semibold">Select an action category</p>
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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl">
        <LoadingSpinner text="Preparing battle..." size="lg" />
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-slate-700/60 overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Combat Layout */}
      <div className="flex-1 grid grid-cols-12 gap-8 p-8 relative z-10">
        {/* Left Sidebar - Player Status & Actions */}
        <div className="col-span-3 space-y-6">
          <EnhancedStatusDisplay 
            player={player} 
            effectiveStats={effectivePlayerStats} 
            onInfoClick={() => setShowPlayerDetailsModal(true)} 
          />
          
          {/* Action Categories */}
          <div className="space-y-4">
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
        
        {/* Center - Epic Battlefield */}
        <div className="col-span-6 flex flex-col">
          {/* Battlefield Arena */}
          <div className="flex-1 relative bg-gradient-to-b from-indigo-900/20 via-slate-800/60 to-emerald-900/20 rounded-3xl border-2 border-slate-600/40 overflow-hidden mb-6 shadow-2xl backdrop-blur-sm">
            {/* Dynamic background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10 animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
            
            {/* Battle atmosphere overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
            
            {/* Enemies Area */}
            <div className="relative z-20 flex justify-center items-start gap-8 p-10 pt-16">
              {currentEnemies.map((enemy) => (
                <div key={enemy.id} className="transform transition-all duration-300 hover:scale-110 relative">
                  <EnemyBattleDisplay
                    enemy={enemy}
                    isTargeted={targetEnemyId === enemy.id}
                    onClick={() => onSetTargetEnemy(enemy.id)}
                    onInfoClick={() => setShowEnemyDetailsModal(enemy)}
                  />
                  {targetEnemyId === enemy.id && (
                    <>
                      <div className="absolute -inset-4 border-4 border-red-400/80 rounded-2xl animate-pulse shadow-lg shadow-red-500/30" />
                      <div className="absolute -inset-6 border-2 border-red-300/40 rounded-3xl animate-ping" />
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* Epic Turn Indicator */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
              <div className={`px-8 py-3 rounded-2xl font-bold text-xl shadow-2xl backdrop-blur-md border-2 transition-all duration-500 ${
                isPlayerTurn 
                  ? 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white border-green-400/60 shadow-green-500/30' 
                  : 'bg-gradient-to-r from-red-500/80 to-rose-600/80 text-white border-red-400/60 shadow-red-500/30'
              }`}>
                {playerActionSkippedByStun ? '⚡ STUNNED!' : isPlayerTurn ? '⚔️ YOUR TURN' : '🛡️ ENEMY TURN'}
              </div>
            </div>
            
            {/* Player Area */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
              <div className="relative">
                <PlayerBattleDisplay 
                  player={player}
                  effectiveStats={effectivePlayerStats}
                  onInfoClick={() => setShowPlayerDetailsModal(true)}
                />
                {/* Player glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg -z-10" />
              </div>
            </div>
            
            {/* Battle effects */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Right Sidebar - Action Content */}
        <div className="col-span-3">
          <div className="h-full bg-slate-800/40 backdrop-blur-xl rounded-3xl border-2 border-slate-600/40 overflow-hidden shadow-2xl">
            {renderDynamicAreaContent()}
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
      
      {/* Epic Stun Overlay */}
      {playerActionSkippedByStun && isPlayerTurn && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center z-50 backdrop-blur-lg rounded-3xl">
          <div className="text-center p-12 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border-4 border-yellow-500/80 shadow-2xl backdrop-blur-md relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 animate-pulse" />
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 text-yellow-400 animate-bounce">
                <StarIcon className="w-full h-full drop-shadow-2xl" />
              </div>
              <p className="text-yellow-300 text-4xl font-bold mb-4 tracking-wide drop-shadow-lg">STUNNED!</p>
              <p className="text-slate-300 text-xl">You cannot act this turn</p>
              <div className="mt-6 w-32 h-1 bg-yellow-500/30 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatView;