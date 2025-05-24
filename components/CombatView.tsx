
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Enemy, CombatActionLog, Spell, GameState, Consumable, Ability, PlayerEffectiveStats, SpellIconName } from '../types';
import { GetSpellIcon, UserIcon, SkullIcon, WandIcon, MindIcon, PotionGenericIcon, SwordsIcon, ShieldIcon, SpeedIcon, BookIcon, HealIcon, BodyIcon, ReflexIcon, FleeIcon, StarIcon } from './IconComponents';
import ActionButton from './ActionButton';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import CombatLogDisplay from './CombatLogDisplay';
import PlayerStatsDisplay from './PlayerStatsDisplay'; // Kept for modal use
import EnemyDisplay from './EnemyDisplay'; // Kept for modal use
import PlayerBattleDisplay from './PlayerBattleDisplay';
import EnemyBattleDisplay from './EnemyBattleDisplay';
import { STATUS_EFFECT_ICONS } from '../constants';

// --- Jorn Battle Configuration Types ---
interface Position {
  x: number;
  y: number;
}

interface JornBattleConfig {
  // Layout configuration
  battleAreaHeight: number;
  playerPosition: Position;
  enemyPositions: Position[];
  playerStatusPosition: Position;
  enemyStatusPosition: Position;
  
  // Background configuration
  backgroundGradient?: { from: string; to: string };
  
  // UI style configuration
  messageBoxStyle?: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
  menuStyle?: {
    backgroundColor: string;
    buttonColor: string;
    textColor: string;
    hoverColor: string;
    activeColor: string;
  };
  
  // Animation configuration
  animationSpeed?: number;
  showDamageNumbers?: boolean;
}

// Extended types for positioning
interface PositionedPlayer extends Player {
  battlePosition?: Position;
}

interface PositionedEnemy extends Enemy {
  battlePosition?: Position;
}

// --- Default Configuration ---
const defaultJornBattleConfig: JornBattleConfig = {
  battleAreaHeight: 400,
  playerPosition: { x: 75, y: 70 },
  enemyPositions: [
    { x: 25, y: 30 },
    { x: 15, y: 20 },
    { x: 35, y: 25 }
  ],
  playerStatusPosition: { x: 60, y: 75 },
  enemyStatusPosition: { x: 5, y: 5 },
  backgroundGradient: { from: 'from-sky-700/40', to: 'to-green-700/40' },
  animationSpeed: 1,
  showDamageNumbers: true,
  messageBoxStyle: {
    backgroundColor: 'bg-slate-800/70',
    textColor: 'text-slate-200',
    borderColor: 'border-slate-600/50'
  },
  menuStyle: {
    backgroundColor: 'bg-slate-800/70',
    buttonColor: 'bg-slate-700',
    textColor: 'text-slate-200',
    hoverColor: 'hover:bg-slate-600',
    activeColor: 'bg-sky-600'
  }
};

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
  config?: Partial<JornBattleConfig>;
}

type DynamicAreaView = 'actions' | 'spells' | 'abilities' | 'items' | 'log';
type CombatActionItemType = Spell | Ability | Consumable;

// --- Helper Components (Local to CombatView for clarity and encapsulation) ---
interface IconProps {
  className?: string;
  title?: string;
}

interface ActionCategoryButtonProps {
  label: string;
  icon: React.ReactNode;
  view: DynamicAreaView;
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}
const ActionCategoryButton: React.FC<ActionCategoryButtonProps> = ({ label, icon, view, isActive, onClick, disabled }) => (
  <ActionButton
    onClick={onClick}
    variant={isActive ? 'primary' : 'secondary'}
    className={`w-full !justify-start !text-xs sm:!text-sm !py-2 sm:!py-2.5 
                ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-sky-500' : ''}`}
    icon={React.cloneElement(icon as React.ReactElement<IconProps>, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
    disabled={disabled}
    title={label}
  >
    {label}
  </ActionButton>
);

interface CombatActionGridSlotProps {
    actionItem: CombatActionItemType;
    player: Player; 
    onClick: (item: CombatActionItemType) => void;
    onMouseEnter: (event: React.MouseEvent, item: CombatActionItemType) => void;
    onMouseLeave: () => void;
    isDisabledByGameLogic: boolean; 
}
const CombatActionGridSlot: React.FC<CombatActionGridSlotProps> = ({ actionItem, player, onClick, onMouseEnter, onMouseLeave, isDisabledByGameLogic }) => {
    const { name, iconName } = actionItem;
    let costText = "";
    let costColor = "text-slate-400";
    let iconColor = "text-sky-300";
    let isAffordable = true;

    if ('manaCost' in actionItem) { // Spell
        costText = `MP: ${actionItem.manaCost}`;
        isAffordable = player.mp >= actionItem.manaCost;
        costColor = isAffordable ? "text-blue-300" : "text-red-400";
        iconColor = "text-sky-300";
    } else if ('epCost' in actionItem) { // Ability
        costText = `EP: ${actionItem.epCost}`;
        isAffordable = player.ep >= actionItem.epCost;
        costColor = isAffordable ? "text-yellow-300" : "text-red-400";
        iconColor = "text-yellow-300";
    } else { // Consumable
        iconColor = "text-lime-300";
    }
    
    const finalDisabled = isDisabledByGameLogic || !isAffordable;

    return (
        <button
            onClick={() => onClick(actionItem)}
            onMouseEnter={(e) => onMouseEnter(e, actionItem)}
            onMouseLeave={onMouseLeave}
            disabled={finalDisabled}
            className={`w-full h-24 bg-slate-800/90 hover:bg-slate-700/90 border-2 
                        ${finalDisabled ? 'border-slate-700 opacity-60 cursor-not-allowed' : 'border-slate-600 hover:border-sky-400 cursor-pointer'} 
                        rounded-lg flex flex-col items-center justify-center p-2 shadow-lg transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-800 focus:ring-sky-400`}
            aria-label={name}
        >
            <GetSpellIcon iconName={iconName} className={`w-10 h-10 mb-1.5 ${finalDisabled ? 'filter grayscale opacity-70' : iconColor}`} />
            <span className="text-xs text-slate-100 text-center truncate w-full">{name}</span>
            {costText && <span className={`text-[0.7rem] ${costColor} font-semibold mt-0.5`}>{costText}</span>}
             {!isAffordable && !isDisabledByGameLogic && <span className="absolute top-1 right-1 text-[0.6rem] text-red-300 bg-red-900/70 px-1 rounded-sm">Low Res</span>}
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
        position: 'fixed', zIndex: 1100, 
        minWidth: '280px', maxWidth: '320px', pointerEvents: 'none',
    };
    if (typeof window !== 'undefined') {
        const { innerWidth, innerHeight } = window;
        if (position.x + 15 + 320 > innerWidth) { 
            style.right = innerWidth - position.x + 10;
        } else {
            style.left = position.x + 10;
        }
        if (position.y + 15 + 200 > innerHeight) { 
            style.bottom = innerHeight - position.y + 10;
        } else {
            style.top = position.y + 10;
        }
    }

    return (
        <div style={style} className="bg-slate-900/95 p-3.5 rounded-xl shadow-2xl border-2 border-sky-500 text-slate-200 backdrop-blur-md">
            <div className="flex items-center mb-2.5 pb-2 border-b border-slate-700">
                <GetSpellIcon iconName={iconName} className="w-8 h-8 mr-3 flex-shrink-0" />
                <h5 className="text-lg font-bold text-sky-300" style={{fontFamily: "'Inter Tight', sans-serif"}}>{name}</h5>
            </div>
            <p className="text-sm text-slate-300 mb-2 italic leading-relaxed">{description}</p>
            {'manaCost' in actionItem && (<div className="space-y-1 text-xs">
                <p>MP Cost: <span className="font-semibold text-blue-300">{actionItem.manaCost}</span></p>
                <p>Damage: <span className="font-semibold text-red-300">{actionItem.damage} ({actionItem.damageType})</span></p>
                {actionItem.scalesWith && <p>Scales With: <span className="font-semibold text-purple-300">{actionItem.scalesWith}</span></p>}
                {actionItem.effect && <p>Effect: <span className="italic text-slate-400">{actionItem.effect}</span></p>}
                {actionItem.statusEffectInflict && (<p>Status: <span className="font-semibold text-teal-300">{actionItem.statusEffectInflict.chance}% to apply {actionItem.statusEffectInflict.name} ({actionItem.statusEffectInflict.duration}t{actionItem.statusEffectInflict.magnitude ? `, Mag: ${actionItem.statusEffectInflict.magnitude}` : ''})</span></p>)}
            </div>)}
            {'epCost' in actionItem && (<div className="space-y-1 text-xs">
                <p>EP Cost: <span className="font-semibold text-yellow-300">{actionItem.epCost}</span></p>
                <p>Effect Type: <span className="font-semibold text-lime-300">{actionItem.effectType.replace(/_/g, ' ')}</span></p>
                {actionItem.magnitude !== undefined && <p>Magnitude: <span className="font-semibold text-lime-300">{actionItem.magnitude}</span></p>}
                {actionItem.duration !== undefined && <p>Duration: <span className="font-semibold text-lime-300">{actionItem.duration} turns</span></p>}
                {actionItem.targetStatusEffect && <p>Targets: <span className="font-semibold text-lime-300">{actionItem.targetStatusEffect}</span></p>}
            </div>)}
            {'itemType' in actionItem && actionItem.itemType === 'Consumable' && (<div className="space-y-1 text-xs">
                <p>Type: <span className="font-semibold text-green-300">{actionItem.itemType}</span></p>
                <p>Effect: <span className="font-semibold text-green-300">{actionItem.effectType.replace(/_/g, ' ')}{actionItem.magnitude !== undefined && ` (${actionItem.magnitude})`}{actionItem.duration !== undefined && `, ${actionItem.duration}t`}</span></p>
                {actionItem.statusToCure && <p>Cures: <span className="font-semibold text-green-300">{actionItem.statusToCure}</span></p>}
                {actionItem.buffToApply && <p>Buffs: <span className="font-semibold text-green-300">{actionItem.buffToApply}</span></p>}
            </div>)}
        </div>
    );
};

const CombatView: React.FC<CombatViewProps> = ({
  player, effectivePlayerStats, currentEnemies, targetEnemyId, onSetTargetEnemy,
  preparedSpells, onPlayerAttack, onPlayerBasicAttack, onPlayerDefend, onPlayerFlee, onPlayerFreestyleAction,
  combatLog, isPlayerTurn, playerActionSkippedByStun,
  onUseConsumable, onUseAbility, consumables, abilities,
  config = {}
}) => {
  // Merge provided config with default config
  const mergedConfig: JornBattleConfig = { ...defaultJornBattleConfig, ...config };
  
  const [activeDynamicView, setActiveDynamicView] = useState<DynamicAreaView>('log');
  const [freestyleActionText, setFreestyleActionText] = useState('');
  const [showEnemyDetailsModal, setShowEnemyDetailsModal] = useState<Enemy | null>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [hoveredCombatActionItem, setHoveredCombatActionItem] = useState<CombatActionItemType | null>(null);
  const [combatActionTooltipPosition, setCombatActionTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Refs for the battle arena
  const battleAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlayerTurn) {
      if (activeDynamicView !== 'log') setActiveDynamicView('log');
    } else { 
      if (playerActionSkippedByStun) {
        if (activeDynamicView !== 'log') setActiveDynamicView('log');
      } else { 
        if (activeDynamicView === 'log') { 
          setActiveDynamicView('actions');
        }
      }
    }
  }, [isPlayerTurn, playerActionSkippedByStun, activeDynamicView]); 

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
    handleCategoryChange('actions'); 
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

  // --- Character Rendering Functions (Pokemon-battle.tsx inspired) ---
  const renderPlayerSprite = useCallback(() => {
    const position = mergedConfig.playerPosition;
    
    return (
      <div
        key={`player-${player.id || 'hero'}`}
        className="absolute transition-all duration-300 cursor-pointer hover:scale-105"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translateX(-50%) translateY(-50%)',
        }}
        onClick={() => setShowPlayerDetailsModal(true)}
      >
        <PlayerBattleDisplay 
          player={player}
          effectiveStats={effectivePlayerStats}
          onInfoClick={() => setShowPlayerDetailsModal(true)}
        />
      </div>
    );
  }, [player, effectivePlayerStats, mergedConfig.playerPosition]);

  const renderEnemySprites = useCallback(() => {
    return currentEnemies.map((enemy, index) => {
      const position = mergedConfig.enemyPositions[index] || mergedConfig.enemyPositions[0];
      
      return (
        <div
          key={`enemy-${enemy.id}`}
          className="absolute transition-all duration-300 cursor-pointer hover:scale-105"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translateX(-50%) translateY(-50%)',
          }}
          onClick={() => onSetTargetEnemy(enemy.id)}
        >
          <EnemyBattleDisplay
            enemy={enemy}
            isTargeted={targetEnemyId === enemy.id}
            onClick={() => onSetTargetEnemy(enemy.id)}
            onInfoClick={() => setShowEnemyDetailsModal(enemy)}
          />
        </div>
      );
    });
  }, [currentEnemies, targetEnemyId, onSetTargetEnemy, mergedConfig.enemyPositions]);

  const renderDynamicAreaContent = () => {
    const renderActionGrid = (items: CombatActionItemType[], type: 'spell' | 'ability' | 'consumable') => {
        if (items.length === 0) return <p className="text-center text-slate-400 p-4 italic text-sm h-full flex items-center justify-center">{type === 'spell' ? "No spells prepared." : type === 'ability' ? "No abilities prepared." : "No consumables available."}</p>;
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 overflow-y-auto h-full styled-scrollbar">
                {items.map(item => (
                    <CombatActionGridSlot key={item.id} actionItem={item} player={player}
                        onClick={(action) => {
                            if (!canPlayerAct) return;
                            if (type === 'spell') { if(targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId); else alert("Select a target!"); }
                            else if (type === 'ability') onUseAbility((action as Ability).id, targetEnemyId);
                            else if (type === 'consumable') onUseConsumable((action as Consumable).id, null);
                            handleCategoryChange(activeDynamicView);
                        }}
                        onMouseEnter={handleGridSlotMouseEnter} onMouseLeave={handleGridSlotMouseLeave} 
                        isDisabledByGameLogic={!canPlayerAct} 
                    />
                ))}
            </div>
        );
    };

    switch (activeDynamicView) {
      case 'actions':
        return (
            <div className="p-2 sm:p-3 flex flex-col h-full">
                <form onSubmit={handleFreestyleSubmit} className="mb-2 flex-grow">
                    <textarea value={freestyleActionText} onChange={(e) => setFreestyleActionText(e.target.value)} placeholder="Describe a custom action..." rows={3} className="w-full p-2 bg-slate-800/70 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 text-sm styled-scrollbar shadow-inner" disabled={!canPlayerAct} />
                </form>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <ActionButton onClick={() => { if(targetEnemyId) { onPlayerBasicAttack(targetEnemyId); handleCategoryChange('actions'); } else alert("Select a target first!");}} variant="danger" size="md" icon={<SwordsIcon className="w-4 h-4"/>} disabled={!targetEnemyId || !canPlayerAct} className="!py-2 text-sm">Attack</ActionButton>
                    <ActionButton onClick={() => {onPlayerDefend(); handleCategoryChange('actions');}} variant="info" size="md" icon={<ShieldIcon className="w-4 h-4"/>} disabled={!canPlayerAct} className="!py-2 text-sm">Defend</ActionButton>
                    <ActionButton onClick={() => {onPlayerFlee(); handleCategoryChange('actions');}} variant="warning" size="md" icon={<FleeIcon className="w-4 h-4"/>} disabled={!canPlayerAct} className="!py-2 text-sm">Flee</ActionButton>
                    <ActionButton type="submit" variant="secondary" size="md" className="!py-2 text-sm" disabled={!canPlayerAct || !freestyleActionText.trim()} onClick={handleFreestyleSubmit}>Perform</ActionButton>
                </div>
            </div>
        );
      case 'spells': return renderActionGrid(preparedSpells, 'spell');
      case 'abilities': return renderActionGrid(abilities, 'ability');
      case 'items': return renderActionGrid(consumables, 'consumable');
      case 'log': return <CombatLogDisplay logs={combatLog} />;
      default: return <p className="text-sm p-4 text-center text-slate-400">Select an action category.</p>;
    }
  };

  const actionCategories: { view: DynamicAreaView; label: string; icon: React.ReactNode }[] = [
    { view: 'actions', label: 'Actions', icon: <SwordsIcon /> },
    { view: 'spells', label: 'Spells', icon: <WandIcon /> },
    { view: 'abilities', label: 'Abilities', icon: <StarIcon /> },
    { view: 'items', label: 'Items', icon: <PotionGenericIcon /> },
    { view: 'log', label: 'Log', icon: <BookIcon /> },
  ];

  if (currentEnemies.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full p-8 text-center"><LoadingSpinner text="Loading encounter..." size="lg" /></div>;
  }
  
  const enemyAreaClasses = `relative flex flex-wrap ${currentEnemies.length > 1 ? 'justify-around items-start w-3/5' : 'justify-start items-center w-1/2'} h-1/2 pl-4 pt-4`;
  const playerAreaClasses = "relative flex justify-end items-center w-1/2 h-1/2 pr-4 pb-4";


  return (
    <div className="h-full flex flex-col p-2 md:p-3 bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-700">
      {/* Battle Arena - Pokemon-battle.tsx inspired structure */}
      <div 
        ref={battleAreaRef}
        className="relative w-full overflow-hidden rounded-lg border border-slate-700/60 shadow-inner"
        style={{ height: `${mergedConfig.battleAreaHeight}px` }}
      >
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${mergedConfig.backgroundGradient?.from} ${mergedConfig.backgroundGradient?.to}`}>
          {/* Background pattern */}
          <div className="absolute inset-0">
            <div className="h-1/2 opacity-60"></div> {/* Sky */}
            <div className="h-1/2 opacity-60"></div> {/* Ground */}
          </div>
        </div>

        {/* Character Sprites Container */}
        <div className="absolute inset-0">
          {/* Enemy sprites */}
          {renderEnemySprites()}
          
          {/* Player sprite */}
          {renderPlayerSprite()}
        </div>
      </div>

      {/* Visual separator */}
      <div className="h-1 w-full bg-slate-800 my-2"></div>


      {/* Combat Interface - Pokemon-battle.tsx inspired structure */}
      <div className="flex h-48">
        {/* Menu Section */}
        <div 
          className="w-1/3 border-t-2 border-r-2 rounded-lg shadow-md overflow-hidden"
          style={{
            backgroundColor: mergedConfig.menuStyle?.backgroundColor,
            borderColor: mergedConfig.messageBoxStyle?.borderColor,
          }}
        >
          <div className="h-full flex flex-col">
            {/* Action Categories */}
            <div className="flex-1 p-2 space-y-1 overflow-y-auto styled-scrollbar">
              {actionCategories.map(cat => (
                <ActionCategoryButton
                  key={cat.view}
                  label={cat.label}
                  icon={cat.icon}
                  view={cat.view}
                  isActive={activeDynamicView === cat.view}
                  onClick={() => handleCategoryChange(cat.view)}
                  disabled={cat.view !== 'log' && !canPlayerAct}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div 
          className="w-2/3 border-t-2 rounded-lg shadow-md overflow-hidden"
          style={{
            backgroundColor: mergedConfig.menuStyle?.backgroundColor,
            borderColor: mergedConfig.messageBoxStyle?.borderColor,
          }}
        >
          <div className="h-full" key={activeDynamicView}>
            {renderDynamicAreaContent()}
          </div>
        </div>
      </div>

      {showEnemyDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowEnemyDetailsModal(null)} title={showEnemyDetailsModal.name} size="xl">
            <EnemyDisplay enemy={showEnemyDetailsModal} />
        </Modal>
      )}
      {showPlayerDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowPlayerDetailsModal(false)} title={`${player.name || "Hero"} - Stats`} size="xl">
            <PlayerStatsDisplay player={player} effectiveStats={effectivePlayerStats} />
        </Modal>
      )}
      {hoveredCombatActionItem && combatActionTooltipPosition && (
        <CombatActionTooltip actionItem={hoveredCombatActionItem} position={combatActionTooltipPosition} />
      )}
      {playerActionSkippedByStun && isPlayerTurn && (
        <div className="absolute inset-0 bg-slate-900/85 flex items-center justify-center z-[1050] rounded-xl backdrop-blur-sm">
            <p className="text-yellow-300 text-2xl font-bold p-6 bg-slate-700 rounded-lg shadow-2xl border-2 border-yellow-500">Player is Stunned!</p>
        </div>
      )}
    </div>
  );
};

export default CombatView;
