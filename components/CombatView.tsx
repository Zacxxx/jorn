import React, { useState, useEffect, useCallback } from 'react';
import { Player, Enemy, CombatActionLog, Spell, GameState, Consumable, Ability, PlayerEffectiveStats } from '../types';
import { GetSpellIcon, WandIcon, PotionGenericIcon, SwordsIcon, ShieldIcon, BookIcon, FleeIcon, StarIcon } from './IconComponents';
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

// --- Helper Components (Local to CombatView for clarity and encapsulation) ---
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
  isMobile?: boolean;
}
const ActionCategoryButton: React.FC<ActionCategoryButtonProps> = ({ label, icon, isActive, onClick, disabled, isMobile }) => (
  <ActionButton
    onClick={onClick}
    variant={isActive ? 'primary' : 'secondary'}
    className={`w-full ${isMobile ? '!p-1.5 sm:!p-2 !text-[0.6rem] battle-action-category-text flex-col sm:flex-row h-14 sm:h-auto' : '!justify-start !text-xs sm:!text-sm !py-2 sm:!py-2.5'} 
                ${isActive ? 'ring-2 ring-offset-1 ring-offset-slate-800 ring-sky-500' : ''} flex-1 md:flex-none`}
    icon={React.cloneElement(icon as React.ReactElement<IconProps>, { className: `w-4 h-4 ${isMobile ? 'mb-0.5 sm:mb-0 sm:mr-1' : 'sm:w-5 sm:h-5'}` })}
    disabled={disabled}
    title={label}
  >
    <span className={isMobile ? "leading-tight text-center" : ""}>{label}</span>
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
            className={`w-full h-20 sm:h-24 bg-slate-800/90 hover:bg-slate-700/90 border-2 
                        ${finalDisabled ? 'border-slate-700 opacity-60 cursor-not-allowed' : 'border-slate-600 hover:border-sky-400 cursor-pointer'} 
                        rounded-lg flex flex-col items-center justify-center p-1.5 sm:p-2 shadow-lg transition-all duration-150 relative focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-800 focus:ring-sky-400`}
            aria-label={name}
        >
            <GetSpellIcon iconName={iconName} className={`w-8 h-8 sm:w-10 sm:h-10 mb-1 sm:mb-1.5 ${finalDisabled ? 'filter grayscale opacity-70' : iconColor}`} />
            <span className="battle-action-slot-name-text text-slate-100 text-center truncate w-full">{name}</span>
            {costText && <span className={`battle-action-slot-cost-text ${costColor} font-semibold mt-0.5`}>{costText}</span>}
             {!isAffordable && !isDisabledByGameLogic && <span className="absolute top-0.5 right-0.5 text-[0.55rem] text-red-300 bg-red-900/70 px-1 rounded-sm">Low Res</span>}
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
        minWidth: '250px', maxWidth: '300px', pointerEvents: 'none', // Slightly smaller for mobile context
    };
    if (typeof window !== 'undefined') {
        const { innerWidth, innerHeight } = window;
        // Adjust based on typical mobile tooltip needs
        if (position.x + 150 > innerWidth) { // If tooltip (est. 300px wide) goes off screen right
            style.right = 5; // Pin to right edge
            style.left = 'auto';
        } else {
            style.left = position.x - 150 < 0 ? 5 : position.x - 150 ; // Pin to left or center
        }
        if (position.y + 150 > innerHeight) { // If tooltip (est. 150px tall) goes off screen bottom
            style.bottom = innerHeight - position.y + 10;
            style.top = 'auto';
        } else {
            style.top = position.y + 10;
            style.bottom = 'auto';
        }
    }

    return (
        <div style={style} className="bg-slate-900/95 p-3 rounded-xl shadow-2xl border-2 border-sky-500 text-slate-200 backdrop-blur-md">
            <div className="flex items-center mb-2 pb-1.5 border-b border-slate-700">
                <GetSpellIcon iconName={iconName} className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 flex-shrink-0" />
                <h5 className="text-sm sm:text-lg font-bold text-sky-300" style={{fontFamily: "'Inter Tight', sans-serif"}}>{name}</h5>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-2 italic leading-relaxed">{description}</p>
            {'manaCost' in actionItem && (actionItem as Spell).manaCost !== undefined && (<div className="space-y-0.5 text-[0.7rem] sm:text-xs">
                <p>MP Cost: <span className="font-semibold text-blue-300">{(actionItem as Spell).manaCost}</span></p>
                <p>Damage: <span className="font-semibold text-red-300">{(actionItem as Spell).damage} ({(actionItem as Spell).damageType})</span></p>
                {(actionItem as Spell).scalesWith && <p>Scales With: <span className="font-semibold text-purple-300">{(actionItem as Spell).scalesWith}</span></p>}
                {(actionItem as Spell).effect && <p>Effect: <span className="italic text-slate-400">{(actionItem as Spell).effect}</span></p>}
                {(actionItem as Spell).statusEffectInflict && (<p>Status: <span className="font-semibold text-teal-300">{(actionItem as Spell).statusEffectInflict!.chance}% {(actionItem as Spell).statusEffectInflict!.name} ({(actionItem as Spell).statusEffectInflict!.duration}t{(actionItem as Spell).statusEffectInflict!.magnitude ? `, Mag: ${(actionItem as Spell).statusEffectInflict!.magnitude}` : ''})</span></p>)}
            </div>)}
            {'epCost' in actionItem && (actionItem as Ability).epCost !== undefined && (<div className="space-y-0.5 text-[0.7rem] sm:text-xs">
                <p>EP Cost: <span className="font-semibold text-yellow-300">{(actionItem as Ability).epCost}</span></p>
                <p>Effect Type: <span className="font-semibold text-lime-300">{(actionItem as Ability).effectType.replace(/_/g, ' ')}</span></p>
                {(actionItem as Ability).magnitude !== undefined && <p>Magnitude: <span className="font-semibold text-lime-300">{(actionItem as Ability).magnitude}</span></p>}
                {(actionItem as Ability).duration !== undefined && <p>Duration: <span className="font-semibold text-lime-300">{(actionItem as Ability).duration} turns</span></p>}
                {(actionItem as Ability).targetStatusEffect && <p>Targets: <span className="font-semibold text-lime-300">{(actionItem as Ability).targetStatusEffect}</span></p>}
            </div>)}
            {'itemType' in actionItem && actionItem.itemType === 'Consumable' && (<div className="space-y-0.5 text-[0.7rem] sm:text-xs">
                <p>Type: <span className="font-semibold text-green-300">{(actionItem as Consumable).itemType}</span></p>
                <p>Effect: <span className="font-semibold text-green-300">{(actionItem as Consumable).effectType.replace(/_/g, ' ')}{(actionItem as Consumable).magnitude !== undefined && ` (${(actionItem as Consumable).magnitude})`}{(actionItem as Consumable).duration !== undefined && `, ${(actionItem as Consumable).duration}t`}</span></p>
                {(actionItem as Consumable).statusToCure && <p>Cures: <span className="font-semibold text-green-300">{(actionItem as Consumable).statusToCure}</span></p>}
                {(actionItem as Consumable).buffToApply && <p>Buffs: <span className="font-semibold text-green-300">{(actionItem as Consumable).buffToApply}</span></p>}
            </div>)}
        </div>
    );
};

const CombatView: React.FC<CombatViewProps> = ({
  player, effectivePlayerStats, currentEnemies, targetEnemyId, onSetTargetEnemy,
  preparedSpells, onPlayerAttack, onPlayerBasicAttack, onPlayerDefend, onPlayerFlee, onPlayerFreestyleAction,
  combatLog, isPlayerTurn, playerActionSkippedByStun,
  onUseConsumable, onUseAbility, consumables, abilities,
}) => {
  const [activeDynamicView, setActiveDynamicView] = useState<DynamicAreaView>('log');
  const [freestyleActionText, setFreestyleActionText] = useState('');
  const [showEnemyDetailsModal, setShowEnemyDetailsModal] = useState<Enemy | null>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [hoveredCombatActionItem, setHoveredCombatActionItem] = useState<CombatActionItemType | null>(null);
  const [combatActionTooltipPosition, setCombatActionTooltipPosition] = useState<{ x: number, y: number } | null>(null);

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
    // handleCategoryChange('actions'); // No longer needed, view persists or changes based on turn
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
        if (items.length === 0) return <p className="text-center text-slate-400 p-4 italic text-xs sm:text-sm h-full flex items-center justify-center">{type === 'spell' ? "No spells prepared." : type === 'ability' ? "No abilities prepared." : "No consumables available."}</p>;
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 p-1 sm:p-2 h-full overflow-y-auto styled-scrollbar">
                {items.map(item => (
                    <CombatActionGridSlot key={item.id} actionItem={item} player={player}
                        onClick={(action) => {
                            if (!canPlayerAct) return;
                            handleGridSlotMouseLeave();
                            if (type === 'spell') { if(targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId); else alert("Select a target!"); }
                            else if (type === 'ability') onUseAbility((action as Ability).id, targetEnemyId);
                            else if (type === 'consumable') onUseConsumable((action as Consumable).id, null);
                            // Do not change category automatically here, let the user decide or game flow handle it.
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
            <div className="p-1.5 sm:p-2 flex flex-col h-full">
                <form onSubmit={handleFreestyleSubmit} className="mb-1.5 sm:mb-2 flex-grow">
                    <textarea value={freestyleActionText} onChange={(e) => setFreestyleActionText(e.target.value)} placeholder="Describe a custom action..." rows={2} className="w-full p-1.5 sm:p-2 bg-slate-800/70 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 text-xs sm:text-sm styled-scrollbar shadow-inner" disabled={!canPlayerAct} />
                </form>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <ActionButton onClick={() => { if(targetEnemyId) { onPlayerBasicAttack(targetEnemyId); } else alert("Select a target first!");}} variant="danger" size="sm" icon={<SwordsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} disabled={!targetEnemyId || !canPlayerAct} className="!py-1.5 sm:!py-2 text-xs sm:text-sm">Attack</ActionButton>
                    <ActionButton onClick={() => {onPlayerDefend();}} variant="info" size="sm" icon={<ShieldIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} disabled={!canPlayerAct} className="!py-1.5 sm:!py-2 text-xs sm:text-sm">Defend</ActionButton>
                    <ActionButton onClick={() => {onPlayerFlee();}} variant="warning" size="sm" icon={<FleeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} disabled={!canPlayerAct} className="!py-1.5 sm:!py-2 text-xs sm:text-sm">Flee</ActionButton>
                    <ActionButton type="submit" variant="secondary" size="sm" className="!py-1.5 sm:!py-2 text-xs sm:text-sm" disabled={!canPlayerAct || !freestyleActionText.trim()} onClick={handleFreestyleSubmit}>Perform</ActionButton>
                </div>
            </div>
        );
      case 'spells': return renderActionGrid(preparedSpells, 'spell');
      case 'abilities': return renderActionGrid(abilities, 'ability');
      case 'items': return renderActionGrid(consumables, 'consumable');
      case 'log': return <div className="h-full overflow-y-auto styled-scrollbar"><CombatLogDisplay logs={combatLog} /></div>;
      default: return <p className="text-xs sm:text-sm p-4 text-center text-slate-400">Select an action category.</p>;
    }
  };

  const actionCategories: { view: DynamicAreaView; label: string; icon: React.ReactNode }[] = [
    { view: 'actions', label: 'Actions', icon: <SwordsIcon /> },
    { view: 'spells', label: 'Spells', icon: <WandIcon /> },
    { view: 'abilities', label: 'Abilities', icon: <StarIcon /> },
    { view: 'items', label: 'Items', icon: <PotionGenericIcon /> },
    { view: 'log', label: 'Log', icon: <BookIcon /> },
  ];

  if (currentEnemies.length === 0 && !playerActionSkippedByStun) { // Added !playerActionSkippedByStun condition
    return <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center"><LoadingSpinner text="Loading encounter..." size="lg" /></div>;
  }
  
  return (
    <div className="h-full flex flex-col p-1 sm:p-2 md:p-3 bg-slate-900/95 rounded-xl shadow-2xl border-2 border-slate-700/80 space-y-1.5 sm:space-y-2">
      {/* Desktop Layout (hidden on mobile) */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4 sm:h-full">
        <div className="sm:col-span-1 space-y-3 py-2">
          <PlayerBattleDisplay player={player} effectiveStats={effectivePlayerStats} onInfoClick={() => setShowPlayerDetailsModal(true)} />
          <div className="space-y-1.5 p-1 bg-slate-800/70 rounded-lg shadow-md border border-slate-600/50">
            {actionCategories.map(cat => (
              <ActionCategoryButton
                key={cat.view}
                label={cat.label}
                icon={cat.icon}
                isActive={activeDynamicView === cat.view}
                onClick={() => handleCategoryChange(cat.view)}
                disabled={cat.view !== 'log' && !canPlayerAct}
                isMobile={false}
              />
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 space-y-3 py-2 flex flex-col">
          <div className="flex-shrink-0 flex justify-around items-start gap-2 mb-2">
            {currentEnemies.map((enemy) => (
              <EnemyBattleDisplay
                key={enemy.id}
                enemy={enemy}
                isTargeted={targetEnemyId === enemy.id}
                onClick={() => onSetTargetEnemy(enemy.id)}
                onInfoClick={() => setShowEnemyDetailsModal(enemy)}
              />
            ))}
          </div>
          <div className="flex-grow bg-slate-800/70 rounded-lg shadow-md border border-slate-600/50 overflow-hidden min-h-[200px] md:min-h-[240px]">
            {renderDynamicAreaContent()}
          </div>
        </div>
      </div>

      {/* Mobile Layout (hidden on sm and up) */}
      <div className="sm:hidden flex flex-col h-full">
        {/* Battle Scene Area (Enemies at top, Player at bottom of this area) */}
        <div className="flex-grow flex flex-col justify-between items-center p-1 bg-slate-850/30 rounded-lg shadow-inner border border-slate-700/50 min-h-[45vh] max-h-[50vh] overflow-hidden relative">
            {/* Background elements for visual flair */}
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="h-1/2 bg-gradient-to-b from-sky-800 to-sky-900"></div> {/* Sky */}
                <div className="h-1/2 bg-gradient-to-t from-green-800 to-green-900"></div> {/* Ground */}
            </div>
            {/* Enemies Area */}
            <div className="z-10 flex-shrink-0 flex justify-center items-start gap-1 p-1 overflow-x-auto w-full">
                {currentEnemies.map((enemy) => (
                <EnemyBattleDisplay
                    key={enemy.id}
                    enemy={enemy}
                    isTargeted={targetEnemyId === enemy.id}
                    onClick={() => onSetTargetEnemy(enemy.id)}
                    onInfoClick={() => setShowEnemyDetailsModal(enemy)}
                />
                ))}
            </div>
            {/* Player Area */}
            <div className="z-10 flex-shrink-0 p-1">
                <PlayerBattleDisplay 
                    player={player}
                    effectiveStats={effectivePlayerStats}
                    onInfoClick={() => setShowPlayerDetailsModal(true)}
                />
            </div>
        </div>

        {/* Dynamic Content Pane */}
        <div className="flex-grow bg-slate-800/80 rounded-lg shadow-md border border-slate-600/60 overflow-hidden min-h-[30vh] max-h-[35vh] my-1.5">
            {renderDynamicAreaContent()}
        </div>

        {/* Action Category Buttons (Bottom Tabs) */}
        <div className="flex-shrink-0 flex justify-around items-stretch gap-1 p-1 bg-slate-900/80 rounded-lg shadow-md border-t-2 border-slate-700">
           {actionCategories.map(cat => (
              <ActionCategoryButton
                key={cat.view}
                label={cat.label}
                icon={cat.icon}
                isActive={activeDynamicView === cat.view}
                onClick={() => handleCategoryChange(cat.view)}
                disabled={cat.view !== 'log' && !canPlayerAct}
                isMobile={true}
              />
            ))}
        </div>
      </div>


      {showEnemyDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowEnemyDetailsModal(null)} title={showEnemyDetailsModal.name} size="lg"> {/* Adjusted size for mobile better */}
            <EnemyDisplay enemy={showEnemyDetailsModal} />
        </Modal>
      )}
      {showPlayerDetailsModal && (
        <Modal isOpen={true} onClose={() => setShowPlayerDetailsModal(false)} title={`${player.name || "Hero"} - Stats`} size="lg"> {/* Adjusted size */}
            <PlayerStatsDisplay player={player} effectiveStats={effectivePlayerStats} />
        </Modal>
      )}
      {hoveredCombatActionItem && combatActionTooltipPosition && (
        <CombatActionTooltip actionItem={hoveredCombatActionItem} position={combatActionTooltipPosition} />
      )}
      {playerActionSkippedByStun && isPlayerTurn && (
        <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-[1050] rounded-xl backdrop-blur-sm p-4">
            <p className="text-yellow-300 text-xl sm:text-2xl font-bold p-4 sm:p-6 bg-slate-700 rounded-lg shadow-2xl border-2 border-yellow-500 text-center">Player is Stunned!</p>
        </div>
      )}
    </div>
  );
};

export default CombatView;