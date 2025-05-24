
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

// --- Enhanced Jorn Battle Configuration Types ---
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface UIElement {
  position: Position;
  size: Size;
  visible: boolean;
  zIndex?: number;
}

interface GridLayout {
  battleArea: UIElement;
  actionMenu: UIElement;
  contentArea: UIElement;
  playerSprite: UIElement & { scale: number };
  enemySprites: Array<UIElement & { scale: number }>;
}

interface JornBattleConfig {
  // Layout configuration
  battleAreaHeight: number;
  useFullHeight: boolean;
  gridColumns: number;
  gridRows: number;
  layout: GridLayout;
  
  // Classic positioning (fallback)
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
  
  // Edit mode configuration
  editMode?: {
    enabled: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };
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
  battleAreaHeight: 500,
  useFullHeight: true,
  gridColumns: 12,
  gridRows: 8,
  layout: {
    battleArea: {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 65 },
      visible: true,
      zIndex: 1
    },
    actionMenu: {
      position: { x: 0, y: 65 },
      size: { width: 25, height: 35 },
      visible: true,
      zIndex: 2
    },
    contentArea: {
      position: { x: 25, y: 65 },
      size: { width: 75, height: 35 },
      visible: true,
      zIndex: 2
    },
    playerSprite: {
      position: { x: 75, y: 70 },
      size: { width: 15, height: 20 },
      visible: true,
      zIndex: 3,
      scale: 1.0
    },
    enemySprites: [
      {
        position: { x: 25, y: 30 },
        size: { width: 15, height: 20 },
        visible: true,
        zIndex: 3,
        scale: 1.0
      },
      {
        position: { x: 15, y: 20 },
        size: { width: 15, height: 20 },
        visible: true,
        zIndex: 3,
        scale: 1.0
      },
      {
        position: { x: 35, y: 25 },
        size: { width: 15, height: 20 },
        visible: true,
        zIndex: 3,
        scale: 1.0
      }
    ]
  },
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
  },
  editMode: {
    enabled: false,
    showGrid: false,
    snapToGrid: true,
    gridSize: 20
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
  const [currentConfig, setCurrentConfig] = useState<JornBattleConfig>({ ...defaultJornBattleConfig, ...config });
  const mergedConfig = currentConfig;
  
  const [activeDynamicView, setActiveDynamicView] = useState<DynamicAreaView>('log');
  const [freestyleActionText, setFreestyleActionText] = useState('');
  const [showEnemyDetailsModal, setShowEnemyDetailsModal] = useState<Enemy | null>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [hoveredCombatActionItem, setHoveredCombatActionItem] = useState<CombatActionItemType | null>(null);
  const [combatActionTooltipPosition, setCombatActionTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // Refs for the battle arena
  const battleAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // --- Layout Management Functions ---
  const saveLayoutToStorage = useCallback((layoutName: string) => {
    const layouts = JSON.parse(localStorage.getItem('jorn-battle-layouts') || '{}');
    layouts[layoutName] = currentConfig;
    localStorage.setItem('jorn-battle-layouts', JSON.stringify(layouts));
  }, [currentConfig]);

  const loadLayoutFromStorage = useCallback((layoutName: string) => {
    const layouts = JSON.parse(localStorage.getItem('jorn-battle-layouts') || '{}');
    if (layouts[layoutName]) {
      setCurrentConfig(layouts[layoutName]);
    }
  }, []);

  const exportLayout = useCallback(() => {
    const dataStr = JSON.stringify(currentConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jorn-battle-layout.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [currentConfig]);

  const importLayout = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setCurrentConfig({ ...defaultJornBattleConfig, ...importedConfig });
        } catch (error) {
          console.error('Failed to import layout:', error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const resetLayout = useCallback(() => {
    setCurrentConfig({ ...defaultJornBattleConfig });
  }, []);

  const updateElementPosition = useCallback((elementKey: string, newPosition: Position) => {
    setCurrentConfig(prev => {
      const newConfig = { ...prev };
      if (elementKey === 'actionMenu') {
        newConfig.layout.actionMenu.position = newPosition;
      } else if (elementKey === 'contentArea') {
        newConfig.layout.contentArea.position = newPosition;
      } else if (elementKey === 'battleArea') {
        newConfig.layout.battleArea.position = newPosition;
      } else if (elementKey === 'playerSprite') {
        newConfig.layout.playerSprite.position = newPosition;
      }
      return newConfig;
    });
  }, []);

  const updateElementSize = useCallback((elementKey: string, newSize: Size) => {
    setCurrentConfig(prev => {
      const newConfig = { ...prev };
      if (elementKey === 'actionMenu') {
        newConfig.layout.actionMenu.size = newSize;
      } else if (elementKey === 'contentArea') {
        newConfig.layout.contentArea.size = newSize;
      } else if (elementKey === 'battleArea') {
        newConfig.layout.battleArea.size = newSize;
      }
      return newConfig;
    });
  }, []);

  // --- Drag & Drop Functions ---
  const snapToGrid = useCallback((value: number) => {
    if (!mergedConfig.editMode?.snapToGrid) return value;
    const gridSize = mergedConfig.editMode.gridSize;
    return Math.round(value / gridSize) * gridSize;
  }, [mergedConfig.editMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementKey: string) => {
    if (!isEditMode || e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedElement(elementKey);
    setDragStart({
      x: (e.clientX - rect.left) / rect.width * 100,
      y: (e.clientY - rect.top) / rect.height * 100
    });
    setIsDragging(true);
  }, [isEditMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement || !dragStart || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const currentMouseX = (e.clientX - rect.left) / rect.width * 100;
    const currentMouseY = (e.clientY - rect.top) / rect.height * 100;

    const deltaX = currentMouseX - dragStart.x;
    const deltaY = currentMouseY - dragStart.y;

    const currentElement = mergedConfig.layout[selectedElement as keyof typeof mergedConfig.layout] as UIElement;
    if (!currentElement) return;

    const newX = snapToGrid(Math.max(0, Math.min(100 - currentElement.size.width, currentElement.position.x + deltaX)));
    const newY = snapToGrid(Math.max(0, Math.min(100 - currentElement.size.height, currentElement.position.y + deltaY)));

    updateElementPosition(selectedElement, { x: newX, y: newY });
    
    setDragStart({ x: currentMouseX, y: currentMouseY });
  }, [isDragging, selectedElement, dragStart, updateElementPosition, snapToGrid, mergedConfig.layout]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEditMode || !selectedElement) return;

    const step = e.shiftKey ? 0.5 : 2; // Fine vs coarse movement
    const currentElement = mergedConfig.layout[selectedElement as keyof typeof mergedConfig.layout] as UIElement;
    if (!currentElement) return;

    let newX = currentElement.position.x;
    let newY = currentElement.position.y;

    switch (e.key) {
      case 'ArrowLeft':
        newX = Math.max(0, currentElement.position.x - step);
        break;
      case 'ArrowRight':
        newX = Math.min(100 - currentElement.size.width, currentElement.position.x + step);
        break;
      case 'ArrowUp':
        newY = Math.max(0, currentElement.position.y - step);
        break;
      case 'ArrowDown':
        newY = Math.min(100 - currentElement.size.height, currentElement.position.y + step);
        break;
      case 'Escape':
        setSelectedElement(null);
        return;
      default:
        return;
    }

    e.preventDefault();
    updateElementPosition(selectedElement, { x: snapToGrid(newX), y: snapToGrid(newY) });
  }, [isEditMode, selectedElement, mergedConfig.layout, updateElementPosition, snapToGrid]);

  // Mouse and keyboard event listeners
  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isEditMode, handleMouseMove, handleMouseUp, handleKeyDown]);

  // --- Resize Handle Component ---
  const ResizeHandles: React.FC<{ elementKey: string }> = ({ elementKey }) => {
    if (!isEditMode || selectedElement !== elementKey) return null;

    const handleResizeStart = (e: React.MouseEvent, handle: string) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeHandle(handle);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: (e.clientX - rect.left) / rect.width * 100,
          y: (e.clientY - rect.top) / rect.height * 100
        });
      }
    };

    return (
      <>
        {/* Corner handles */}
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        <div
          className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div
          className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        
        {/* Edge handles */}
        <div
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-500 border border-white cursor-n-resize"
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-blue-500 border border-white cursor-s-resize"
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        <div
          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-blue-500 border border-white cursor-w-resize"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
        <div
          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 bg-blue-500 border border-white cursor-e-resize"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
      </>
    );
  };

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
        
        // Calculate responsive grid columns based on items count and container size
        const itemCount = items.length;
        let gridCols = 'grid-cols-2';
        if (itemCount <= 2) gridCols = 'grid-cols-2';
        else if (itemCount <= 4) gridCols = 'grid-cols-2 md:grid-cols-4';
        else if (itemCount <= 6) gridCols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
        else if (itemCount <= 8) gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
        else gridCols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
        
        return (
            <div className={`grid ${gridCols} gap-2 p-2 h-full auto-rows-min`}>
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
    <div 
      ref={containerRef}
      className="relative w-full bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-700 overflow-hidden"
      style={{ 
        height: mergedConfig.useFullHeight ? '85vh' : `${mergedConfig.battleAreaHeight + 300}px`,
        minHeight: '600px'
      }}
    >
      {/* Edit Mode Toolbar */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-50 bg-slate-800/95 p-3 rounded-lg border border-slate-600 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-300">Layout Editor</span>
            <ActionButton 
              onClick={() => setShowLayoutManager(true)} 
              variant="secondary" 
              className="!py-1 !px-2 !text-xs"
            >
              Manage
            </ActionButton>
            <ActionButton 
              onClick={() => setIsEditMode(false)} 
              variant="primary" 
              className="!py-1 !px-2 !text-xs"
            >
              Done
            </ActionButton>
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Click elements to select • Drag to move • Use resize handles</div>
            <div>• Arrow keys: Move • Shift+Arrow: Fine move • Esc: Deselect</div>
            <div>• {selectedElement ? `Selected: ${selectedElement}` : 'No element selected'}</div>
          </div>
        </div>
      )}

      {/* Edit Mode Toggle */}
      {!isEditMode && (
        <ActionButton 
          onClick={() => setIsEditMode(true)}
          variant="secondary"
          className="absolute top-2 right-2 z-50 !py-1 !px-2 !text-xs opacity-70 hover:opacity-100"
        >
          ⚙️ Edit Layout
        </ActionButton>
      )}

      {/* Grid Overlay for Edit Mode */}
      {isEditMode && mergedConfig.editMode?.showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.2) 1px, transparent 1px)`,
            backgroundSize: `${mergedConfig.editMode.gridSize}px ${mergedConfig.editMode.gridSize}px`
          }}
        />
      )}

      {/* Battle Arena */}
      <div 
        ref={battleAreaRef}
        className={`absolute rounded-lg shadow-inner overflow-hidden ${isEditMode ? 'border-2 border-blue-400' : 'border border-slate-700/60'} ${isDragging && selectedElement === 'battleArea' ? 'cursor-move' : ''}`}
        style={{
          left: `${mergedConfig.layout.battleArea.position.x}%`,
          top: `${mergedConfig.layout.battleArea.position.y}%`,
          width: `${mergedConfig.layout.battleArea.size.width}%`,
          height: `${mergedConfig.layout.battleArea.size.height}%`,
          zIndex: mergedConfig.layout.battleArea.zIndex
        }}
        onClick={() => isEditMode && setSelectedElement('battleArea')}
        onMouseDown={(e) => isEditMode && handleMouseDown(e, 'battleArea')}
      >
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${mergedConfig.backgroundGradient?.from} ${mergedConfig.backgroundGradient?.to}`}>
          <div className="absolute inset-0 opacity-60">
            <div className="h-1/2"></div>
            <div className="h-1/2"></div>
          </div>
        </div>

        {/* Character Sprites Container */}
        <div className="absolute inset-0">
          {renderEnemySprites()}
          {renderPlayerSprite()}
        </div>

        {isEditMode && selectedElement === 'battleArea' && (
          <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 pointer-events-none">
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Battle Arena ({mergedConfig.layout.battleArea.size.width.toFixed(1)}% × {mergedConfig.layout.battleArea.size.height.toFixed(1)}%)
            </div>
          </div>
        )}
        
        <ResizeHandles elementKey="battleArea" />
      </div>

      {/* Action Menu */}
      <div 
        className={`absolute rounded-lg shadow-md overflow-hidden ${isEditMode ? 'border-2 border-green-400' : 'border border-slate-700/60'} ${isDragging && selectedElement === 'actionMenu' ? 'cursor-move' : ''}`}
        style={{
          left: `${mergedConfig.layout.actionMenu.position.x}%`,
          top: `${mergedConfig.layout.actionMenu.position.y}%`,
          width: `${mergedConfig.layout.actionMenu.size.width}%`,
          height: `${mergedConfig.layout.actionMenu.size.height}%`,
          backgroundColor: mergedConfig.menuStyle?.backgroundColor,
          borderColor: isEditMode ? undefined : mergedConfig.messageBoxStyle?.borderColor,
          zIndex: mergedConfig.layout.actionMenu.zIndex
        }}
        onClick={() => isEditMode && setSelectedElement('actionMenu')}
        onMouseDown={(e) => isEditMode && handleMouseDown(e, 'actionMenu')}
      >
        {/* Responsive Action Categories - No scrolling needed */}
        <div className="h-full p-2">
          <div className={`grid gap-1 h-full ${actionCategories.length <= 3 ? 'grid-rows-3' : actionCategories.length <= 4 ? 'grid-rows-4' : 'grid-rows-5'}`}>
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

        {isEditMode && selectedElement === 'actionMenu' && (
          <div className="absolute inset-0 border-2 border-green-500 bg-green-500/10 pointer-events-none">
            <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Action Menu ({mergedConfig.layout.actionMenu.size.width.toFixed(1)}% × {mergedConfig.layout.actionMenu.size.height.toFixed(1)}%)
            </div>
          </div>
        )}
        
        <ResizeHandles elementKey="actionMenu" />
      </div>

      {/* Content Area */}
      <div 
        className={`absolute rounded-lg shadow-md overflow-hidden ${isEditMode ? 'border-2 border-purple-400' : 'border border-slate-700/60'} ${isDragging && selectedElement === 'contentArea' ? 'cursor-move' : ''}`}
        style={{
          left: `${mergedConfig.layout.contentArea.position.x}%`,
          top: `${mergedConfig.layout.contentArea.position.y}%`,
          width: `${mergedConfig.layout.contentArea.size.width}%`,
          height: `${mergedConfig.layout.contentArea.size.height}%`,
          backgroundColor: mergedConfig.menuStyle?.backgroundColor,
          borderColor: isEditMode ? undefined : mergedConfig.messageBoxStyle?.borderColor,
          zIndex: mergedConfig.layout.contentArea.zIndex
        }}
        onClick={() => isEditMode && setSelectedElement('contentArea')}
        onMouseDown={(e) => isEditMode && handleMouseDown(e, 'contentArea')}
      >
        <div className="h-full overflow-hidden" key={activeDynamicView}>
          {renderDynamicAreaContent()}
        </div>

        {isEditMode && selectedElement === 'contentArea' && (
          <div className="absolute inset-0 border-2 border-purple-500 bg-purple-500/10 pointer-events-none">
            <div className="absolute -top-6 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded">
              Content Area ({mergedConfig.layout.contentArea.size.width.toFixed(1)}% × {mergedConfig.layout.contentArea.size.height.toFixed(1)}%)
            </div>
          </div>
        )}
        
        <ResizeHandles elementKey="contentArea" />
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

      {/* Layout Manager Modal */}
      {showLayoutManager && (
        <Modal isOpen={true} onClose={() => setShowLayoutManager(false)} title="Layout Manager" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <ActionButton onClick={resetLayout} variant="warning" className="w-full !py-2 !text-sm">
                    Reset to Default
                  </ActionButton>
                  <ActionButton onClick={exportLayout} variant="secondary" className="w-full !py-2 !text-sm">
                    Export Layout
                  </ActionButton>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importLayout}
                      className="hidden"
                      id="layout-import"
                    />
                    <ActionButton 
                      onClick={() => document.getElementById('layout-import')?.click()} 
                      variant="secondary" 
                      className="w-full !py-2 !text-sm"
                    >
                      Import Layout
                    </ActionButton>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Layout Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Full Height</span>
                    <input
                      type="checkbox"
                      checked={mergedConfig.useFullHeight}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, useFullHeight: e.target.checked }))}
                      className="rounded border-slate-600 bg-slate-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Show Grid</span>
                    <input
                      type="checkbox"
                      checked={mergedConfig.editMode?.showGrid || false}
                      onChange={(e) => setCurrentConfig(prev => ({ 
                        ...prev, 
                        editMode: { ...prev.editMode!, showGrid: e.target.checked }
                      }))}
                      className="rounded border-slate-600 bg-slate-800"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Snap to Grid</span>
                    <input
                      type="checkbox"
                      checked={mergedConfig.editMode?.snapToGrid || false}
                      onChange={(e) => setCurrentConfig(prev => ({ 
                        ...prev, 
                        editMode: { ...prev.editMode!, snapToGrid: e.target.checked }
                      }))}
                      className="rounded border-slate-600 bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Save/Load Layouts</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Layout name..."
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        saveLayoutToStorage(target.value.trim());
                        target.value = '';
                      }
                    }
                  }}
                />
                <ActionButton 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Layout name..."]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      saveLayoutToStorage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  variant="primary" 
                  className="!py-2 !text-sm"
                >
                  Save
                </ActionButton>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Press Enter or click Save to store current layout
              </div>
            </div>

            <div className="flex justify-end">
              <ActionButton onClick={() => setShowLayoutManager(false)} variant="primary">
                Close
              </ActionButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CombatView;

