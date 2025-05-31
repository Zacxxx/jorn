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
      relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 
      ${isActive 
        ? 'bg-gradient-to-br from-blue-600/30 to-blue-700/30 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20' 
        : 'bg-slate-800/60 border-2 border-slate-600/40 hover:border-slate-500/60 hover:bg-slate-700/60'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      min-h-[80px] flex-1
    `}
  >
    <div className={`w-8 h-8 mb-2 ${isActive ? 'text-blue-300' : 'text-slate-300'}`}>
      {icon}
    </div>
    <span className={`text-sm font-medium ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>
      {label}
    </span>
    {count !== undefined && count > 0 && (
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
  let bgGradient = "from-slate-800/90 to-slate-700/90";

  if ('manaCost' in actionItem) { // Spell
    costText = `${actionItem.manaCost} MP`;
    isAffordable = player.mp >= actionItem.manaCost;
    costColor = isAffordable ? "text-blue-300" : "text-red-400";
    iconColor = "text-blue-300";
    bgGradient = "from-blue-900/20 to-blue-800/20";
  } else if ('epCost' in actionItem) { // Ability
    costText = `${actionItem.epCost} EP`;
    isAffordable = player.ep >= actionItem.epCost;
    costColor = isAffordable ? "text-yellow-300" : "text-red-400";
    iconColor = "text-yellow-300";
    bgGradient = "from-yellow-900/20 to-yellow-800/20";
  } else { // Consumable
    iconColor = "text-green-300";
    bgGradient = "from-green-900/20 to-green-800/20";
  }
  
  const finalDisabled = isDisabledByGameLogic || !isAffordable;

  return (
    <button
      onClick={() => onClick(actionItem)}
      onMouseEnter={(e) => onMouseEnter(e, actionItem)}
      onMouseLeave={onMouseLeave}
      disabled={finalDisabled}
      className={`
        relative w-full h-28 bg-gradient-to-br ${bgGradient} backdrop-blur-sm
        border-2 rounded-xl transition-all duration-200 group
        ${finalDisabled 
          ? 'border-slate-700/50 opacity-50 cursor-not-allowed' 
          : 'border-slate-600/60 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer hover:scale-105'
        }
        flex flex-col items-center justify-center p-3 shadow-lg
      `}
    >
      <div className={`w-12 h-12 mb-2 ${finalDisabled ? 'filter grayscale opacity-70' : iconColor} transition-transform group-hover:scale-110`}>
        <GetSpellIcon iconName={iconName} className="w-full h-full" />
      </div>
      <span className="text-slate-100 text-center text-sm font-medium truncate w-full mb-1">
        {name}
      </span>
      {costText && (
        <span className={`text-xs font-semibold ${costColor}`}>
          {costText}
        </span>
      )}
      {!isAffordable && !isDisabledByGameLogic && (
        <div className="absolute top-1 right-1 bg-red-500/80 text-white text-xs px-1.5 py-0.5 rounded-md font-bold">
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
      style.right = 10;
      style.left = 'auto';
    } else {
      style.left = position.x - 160 < 0 ? 10 : position.x - 160;
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
    <div style={style} className="bg-slate-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border-2 border-blue-500/60 text-slate-200">
      <div className="flex items-center mb-3 pb-2 border-b border-slate-700">
        <GetSpellIcon iconName={iconName} className="w-8 h-8 mr-3 flex-shrink-0" />
        <h5 className="text-lg font-bold text-blue-300">{name}</h5>
      </div>
      <p className="text-sm text-slate-300 mb-3 italic leading-relaxed">{description}</p>
      
      {'manaCost' in actionItem && (actionItem as Spell).manaCost !== undefined && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>MP Cost:</span>
            <span className="font-semibold text-blue-300">{(actionItem as Spell).manaCost}</span>
          </div>
          <div className="flex justify-between">
            <span>Damage:</span>
            <span className="font-semibold text-red-300">{(actionItem as Spell).damage} ({(actionItem as Spell).damageType})</span>
          </div>
          {(actionItem as Spell).scalesWith && (
            <div className="flex justify-between">
              <span>Scales With:</span>
              <span className="font-semibold text-purple-300">{(actionItem as Spell).scalesWith}</span>
            </div>
          )}
          {(actionItem as Spell).effect && (
            <div className="mt-2 p-2 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400 text-xs">Effect:</span>
              <p className="text-slate-300 text-sm">{(actionItem as Spell).effect}</p>
            </div>
          )}
        </div>
      )}
      
      {'epCost' in actionItem && (actionItem as Ability).epCost !== undefined && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>EP Cost:</span>
            <span className="font-semibold text-yellow-300">{(actionItem as Ability).epCost}</span>
          </div>
          <div className="flex justify-between">
            <span>Effect Type:</span>
            <span className="font-semibold text-lime-300">{(actionItem as Ability).effectType.replace(/_/g, ' ')}</span>
          </div>
          {(actionItem as Ability).magnitude !== undefined && (
            <div className="flex justify-between">
              <span>Magnitude:</span>
              <span className="font-semibold text-lime-300">{(actionItem as Ability).magnitude}</span>
            </div>
          )}
        </div>
      )}
      
      {'itemType' in actionItem && actionItem.itemType === 'Consumable' && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-semibold text-green-300">{(actionItem as Consumable).itemType}</span>
          </div>
          <div className="flex justify-between">
            <span>Effect:</span>
            <span className="font-semibold text-green-300">
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
  <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border-2 border-slate-600/50">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold text-slate-200">{player.name || "Hero"}</h3>
      <button 
        onClick={onInfoClick}
        className="text-blue-400 hover:text-blue-300 transition-colors"
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
            <HealIcon className="w-4 h-4 text-red-400 mr-1" />
            <span className="text-slate-300">Health</span>
          </div>
          <span className="text-red-300 font-semibold">{player.hp}/{player.maxHp}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Mana Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <LightningBoltIcon className="w-4 h-4 text-blue-400 mr-1" />
            <span className="text-slate-300">Mana</span>
          </div>
          <span className="text-blue-300 font-semibold">{player.mp}/{player.maxMp}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, (player.mp / player.maxMp) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Energy Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-slate-300">Energy</span>
          </div>
          <span className="text-yellow-300 font-semibold">{player.ep}/{player.maxEp}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, (player.ep / player.maxEp) * 100)}%` }}
          />
        </div>
      </div>
    </div>
    
    {/* Status Effects */}
    {player.activeStatusEffects && player.activeStatusEffects.length > 0 && (
      <div className="mt-3 pt-3 border-t border-slate-600">
        <div className="flex flex-wrap gap-1">
          {player.activeStatusEffects.slice(0, 4).map((effect, index) => (
            <div key={index} className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded-md">
              {effect.name}
            </div>
          ))}
          {player.activeStatusEffects.length > 4 && (
            <div className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-md">
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
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 text-slate-500">
                {type === 'spell' ? <WandIcon className="w-full h-full" /> :
                 type === 'ability' ? <StarIcon className="w-full h-full" /> :
                 <PotionGenericIcon className="w-full h-full" />}
              </div>
              <p className="text-slate-400 text-lg">
                {type === 'spell' ? "No spells prepared" :
                 type === 'ability' ? "No abilities available" :
                 "No consumables available"}
              </p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 h-full overflow-y-auto">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                className="h-16 text-lg font-semibold"
              >
                Attack
              </ActionButton>
              <ActionButton 
                onClick={() => {onPlayerDefend();}} 
                variant="info" 
                size="lg"
                icon={<ShieldIcon className="w-6 h-6"/>} 
                disabled={!canPlayerAct} 
                className="h-16 text-lg font-semibold"
              >
                Defend
              </ActionButton>
              <ActionButton 
                onClick={() => {onPlayerFlee();}} 
                variant="warning" 
                size="lg"
                icon={<FleeIcon className="w-6 h-6"/>} 
                disabled={!canPlayerAct} 
                className="h-16 text-lg font-semibold"
              >
                Flee
              </ActionButton>
              <ActionButton 
                type="submit" 
                variant="secondary" 
                size="lg"
                className="h-16 text-lg font-semibold" 
                disabled={!canPlayerAct || !freestyleActionText.trim()} 
                onClick={handleFreestyleSubmit}
              >
                Custom
              </ActionButton>
            </div>
            
            {/* Custom Action */}
            <div className="flex-grow">
              <form onSubmit={handleFreestyleSubmit} className="h-full">
                <textarea 
                  value={freestyleActionText} 
                  onChange={(e) => setFreestyleActionText(e.target.value)} 
                  placeholder="Describe a custom action..." 
                  rows={6}
                  className="w-full h-full p-4 bg-slate-800/70 border-2 border-slate-600 rounded-xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg resize-none" 
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
            <CombatLogDisplay logs={combatLog} />
          </div>
        );
      default: 
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-lg">Select an action category</p>
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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <LoadingSpinner text="Loading encounter..." size="lg" />
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border-2 border-slate-700/80 overflow-hidden">
      {/* Main Combat Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Left Sidebar - Player Status & Actions */}
        <div className="col-span-3 space-y-6">
          <EnhancedStatusDisplay 
            player={player} 
            effectiveStats={effectivePlayerStats} 
            onInfoClick={() => setShowPlayerDetailsModal(true)} 
          />
          
          {/* Action Categories */}
          <div className="space-y-3">
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
        
        {/* Center - Battlefield */}
        <div className="col-span-6 flex flex-col">
          {/* Battlefield Area */}
          <div className="flex-1 relative bg-gradient-to-b from-sky-900/30 via-slate-800/50 to-green-900/30 rounded-xl border-2 border-slate-600/50 overflow-hidden mb-6">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/assets/battlefield-bg.jpg')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
            
            {/* Enemies Area */}
            <div className="relative z-10 flex justify-center items-start gap-6 p-8 pt-12">
              {currentEnemies.map((enemy) => (
                <div key={enemy.id} className="transform transition-all duration-200 hover:scale-105">
                  <EnemyBattleDisplay
                    enemy={enemy}
                    isTargeted={targetEnemyId === enemy.id}
                    onClick={() => onSetTargetEnemy(enemy.id)}
                    onInfoClick={() => setShowEnemyDetailsModal(enemy)}
                  />
                  {targetEnemyId === enemy.id && (
                    <div className="absolute -inset-2 border-4 border-red-400 rounded-xl animate-pulse" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Turn Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className={`px-6 py-2 rounded-full font-bold text-lg ${
                isPlayerTurn 
                  ? 'bg-green-500/80 text-white' 
                  : 'bg-red-500/80 text-white'
              }`}>
                {playerActionSkippedByStun ? 'STUNNED!' : isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN'}
              </div>
            </div>
            
            {/* Player Area */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <PlayerBattleDisplay 
                player={player}
                effectiveStats={effectivePlayerStats}
                onInfoClick={() => setShowPlayerDetailsModal(true)}
              />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar - Action Content */}
        <div className="col-span-3">
          <div className="h-full bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-600/50 overflow-hidden">
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
      
      {/* Stun Overlay */}
      {playerActionSkippedByStun && isPlayerTurn && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-50 backdrop-blur-sm rounded-2xl">
          <div className="text-center p-8 bg-slate-800 rounded-xl border-4 border-yellow-500 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 text-yellow-400">
              <StarIcon className="w-full h-full animate-pulse" />
            </div>
            <p className="text-yellow-300 text-2xl font-bold mb-2">STUNNED!</p>
            <p className="text-slate-300">You cannot act this turn</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatView;