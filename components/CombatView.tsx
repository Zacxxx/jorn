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

// Import refactored components and hooks
import { useCombatLayout, useDragAndDrop, useLayoutHistory } from './hooks';
import { EditModeToolbar, ResizeHandles, GridOverlay } from './battle-ui/layout';
import { BattleArena, CharacterSprites } from './battle-ui/combat';
import { ActionMenu, CombatActionGrid, CombatActionGridSlot, CombatActionTooltip } from './battle-ui/actions';
import { ContentArea, DynamicContent } from './battle-ui/content';
import { LayoutManagerModal } from './battle-ui/modals';

// Import types from the types index file
import { JornBattleConfig, Position, Size, UIElement, GridLayout } from '../types/layout';
import { DynamicAreaView, CombatActionItemType, CombatViewProps } from '../types/combat';

// --- Default Configuration ---
const defaultJornBattleConfig: JornBattleConfig = {
  battleAreaHeight: 500,
  useFullHeight: true,
  gridColumns: 12,
  gridRows: 8,
  canvasWidth: 100,
  canvasHeight: '85vh',
  canvasMinWidth: 800,
  canvasMinHeight: 600,
  layout: {
    battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 65 }, visible: true, zIndex: 1 },
    actionMenu: { position: { x: 0, y: 65 }, size: { width: 25, height: 35 }, visible: true, zIndex: 2 },
    contentArea: { position: { x: 25, y: 65 }, size: { width: 75, height: 35 }, visible: true, zIndex: 2 },
    playerSprite: { position: { x: 75, y: 70 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
    enemySprites: [
      { position: { x: 25, y: 30 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
      { position: { x: 15, y: 20 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 },
      { position: { x: 35, y: 25 }, size: { width: 15, height: 20 }, visible: true, zIndex: 3, scale: 1.0 }
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
  fontSizes: {
    base: 1.0, small: 0.75, large: 1.25, heading: 1.5, ui: 0.875
  },
  animationSpeed: 1, showDamageNumbers: true,
  messageBoxStyle: {
    backgroundColor: 'bg-slate-800/70', textColor: 'text-slate-200', borderColor: 'border-slate-600/50'
  },
  menuStyle: {
    backgroundColor: 'bg-slate-800/70', buttonColor: 'bg-slate-700', textColor: 'text-slate-200', hoverColor: 'hover:bg-slate-600', activeColor: 'bg-sky-600'
  },
  editMode: { enabled: false, showGrid: false, snapToGrid: true, gridSize: 20 }
};

const CombatView: React.FC<CombatViewProps> = ({
  player, effectivePlayerStats, currentEnemies, targetEnemyId, onSetTargetEnemy,
  preparedSpells, onPlayerAttack, onPlayerBasicAttack, onPlayerDefend, onPlayerFlee, onPlayerFreestyleAction,
  combatLog, isPlayerTurn, playerActionSkippedByStun,
  onUseConsumable, onUseAbility, consumables, abilities,
  config = {}
}) => {
  // Merge provided config with default config
  const initialConfig = { ...defaultJornBattleConfig, ...config };
  const { currentConfig, setCurrentConfig, isEditMode, setIsEditMode, selectedElement, setSelectedElement, updateElementPosition, updateElementSize, applyPresetLayout } = useCombatLayout(initialConfig);
  const { isDragging, isResizing, dragStart, resizeHandle, containerRef, handleMouseDown, handleMouseUp, handleKeyDown, snapToGrid, setResizeHandle } = useDragAndDrop({ config: currentConfig, isEditMode, selectedElement, setSelectedElement, updateElementPosition, updateElementSize });
  const { layoutHistory, historyIndex, saveToHistory, undo, redo, canUndo, canRedo } = useLayoutHistory();

  const [activeDynamicView, setActiveDynamicView] = useState<DynamicAreaView>('log');
  const [freestyleActionText, setFreestyleActionText] = useState('');
  const [showEnemyDetailsModal, setShowEnemyDetailsModal] = useState<Enemy | null>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [hoveredCombatActionItem, setHoveredCombatActionItem] = useState<CombatActionItemType | null>(null);
  const [combatActionTooltipPosition, setCombatActionTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  
  // Handlers for layout management from hooks - these were placeholders before
  const saveLayoutToStorage = useCallback((layoutName: string) => {
    const layouts = JSON.parse(localStorage.getItem('jorn-battle-layouts') || '{}');
    layouts[layoutName] = currentConfig; // Save current config from hook
    localStorage.setItem('jorn-battle-layouts', JSON.stringify(layouts));
  }, [currentConfig]);

  const loadLayoutFromStorage = useCallback((layoutName: string) => {
    const layouts = JSON.parse(localStorage.getItem('jorn-battle-layouts') || '{}');
    if (layouts[layoutName]) {
      setCurrentConfig(layouts[layoutName]); // Load config into hook state
    }
  }, [setCurrentConfig]);

  const exportLayout = useCallback(() => {
    const dataStr = JSON.stringify(currentConfig, null, 2); // Export current config from hook
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
          // Merge imported config with default and current to maintain structure and add new defaults
          setCurrentConfig((prev: JornBattleConfig) => ({ ...defaultJornBattleConfig, ...prev, ...importedConfig }));
        } catch (error) {
          console.error('Failed to import layout:', error);
        }
      };
      reader.readAsText(file);
    }
  }, [setCurrentConfig]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        applyPresetLayout('mobile');
      } else {
        applyPresetLayout('classic'); // Or your default desktop preset
      }
    };

    handleResize(); // Apply initial layout on mount

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [applyPresetLayout]);

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

  const resetLayout = useCallback(() => {
    saveToHistory(currentConfig); // Save current state before reset
    setCurrentConfig({ ...defaultJornBattleConfig });
  }, [saveToHistory, currentConfig, setCurrentConfig]);

  const undoHandler = useCallback(() => undo(setCurrentConfig, layoutHistory), [undo, setCurrentConfig, layoutHistory]);
  const redoHandler = useCallback(() => redo(setCurrentConfig, layoutHistory), [redo, setCurrentConfig, layoutHistory]);

  if (currentEnemies.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full p-8 text-center"><LoadingSpinner text="Loading encounter..." size="lg" /></div>;
  }

  return (
    <>
      {/* Inject font scaling CSS */}
      <style>
        {`
          .combat-view-container * {
            font-size: calc(var(--font-base) * 1) !important;
          }
          .combat-view-container .text-xs {
            font-size: calc(var(--font-ui) * 0.75) !important;
          }
          .combat-view-container .text-sm {
            font-size: calc(var(--font-ui) * 0.875) !important;
          }
          .combat-view-container .text-lg {
            font-size: calc(var(--font-large) * 1) !important;
          }
          .combat-view-container .text-xl, .combat-view-container .text-2xl {
            font-size: calc(var(--font-heading) * 1) !important;
          }
        `}
      </style>
      <div
        ref={containerRef}
        className="combat-view-container relative bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-700 overflow-hidden"
        style={{
          width: `${currentConfig.canvasWidth}%`,
          height: currentConfig.useFullHeight ? currentConfig.canvasHeight : `${currentConfig.battleAreaHeight + 300}px`,
          minWidth: `${currentConfig.canvasMinWidth}px`,
          minHeight: `${currentConfig.canvasMinHeight}px`,
          // Apply comprehensive font scaling using CSS custom properties
          '--font-base': `${currentConfig.fontSizes?.base || 1}rem`,
          '--font-small': `${currentConfig.fontSizes?.small || 0.75}rem`,
          '--font-large': `${currentConfig.fontSizes?.large || 1.25}rem`,
          '--font-heading': `${currentConfig.fontSizes?.heading || 1.5}rem`,
          '--font-ui': `${currentConfig.fontSizes?.ui || 0.875}rem`,
          fontSize: `var(--font-base)`
        } as React.CSSProperties}
        onClick={(e) => {
          // Deselect when clicking on the main container (but not children)
          if (isEditMode && e.target === e.currentTarget) {
            setSelectedElement(null);
          }
        }}
      >
        {/* Edit Mode Toolbar */}
        {isEditMode && (
          <EditModeToolbar
            selectedElement={selectedElement}
            onUndo={undoHandler}
            onRedo={redoHandler}
            onOpenLayoutManager={() => setShowLayoutManager(true)}
            onExitEditMode={() => setIsEditMode(false)}
            canUndo={canUndo}
            canRedo={canRedo}
            config={currentConfig}
            isDragging={isDragging}
            isResizing={isResizing}
          />
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
        <GridOverlay config={currentConfig} isEditMode={isEditMode} />

        {/* Battle Arena */}
        <BattleArena
          config={currentConfig}
          isEditMode={isEditMode}
          selectedElement={selectedElement}
          isDragging={isDragging}
          onElementSelect={setSelectedElement}
          onMouseDown={handleMouseDown}
          containerRef={containerRef}
        >
          <CharacterSprites
            player={player}
            effectivePlayerStats={effectivePlayerStats}
            currentEnemies={currentEnemies}
            config={currentConfig}
            isEditMode={isEditMode}
            selectedElement={selectedElement}
            isDragging={isDragging}
            onElementSelect={setSelectedElement}
            onMouseDown={handleMouseDown}
            targetEnemyId={targetEnemyId}
            onSetTargetEnemy={onSetTargetEnemy}
            onShowPlayerDetails={() => setShowPlayerDetailsModal(true)}
            onShowEnemyDetails={(enemy) => setShowEnemyDetailsModal(enemy)}
            containerRef={containerRef}
          />
        </BattleArena>

        {/* Action Menu */}
        <ActionMenu
          config={currentConfig}
          isEditMode={isEditMode}
          selectedElement={selectedElement}
          activeDynamicView={activeDynamicView}
          onCategoryChange={handleCategoryChange}
          onElementSelect={setSelectedElement}
          onMouseDown={handleMouseDown}
          canPlayerAct={canPlayerAct}
        />

        {/* Content Area */}
        <ContentArea
          config={currentConfig}
          isEditMode={isEditMode}
          selectedElement={selectedElement}
          isDragging={isDragging}
          onElementSelect={setSelectedElement}
          onMouseDown={handleMouseDown}
          containerRef={containerRef}
        >
          <DynamicContent
            activeDynamicView={activeDynamicView}
            preparedSpells={preparedSpells}
            abilities={abilities}
            consumables={consumables}
            combatLog={combatLog}
            player={player}
            canPlayerAct={canPlayerAct}
            targetEnemyId={targetEnemyId}
            onPlayerBasicAttack={onPlayerBasicAttack}
            onPlayerDefend={onPlayerDefend}
            onPlayerFlee={onPlayerFlee}
            onPlayerFreestyleAction={onPlayerFreestyleAction}
            onActionSelect={(action, type) => {
              if (!canPlayerAct) return;
              if (type === 'spell') { if(targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId); else alert("Select a target!"); }
              else if (type === 'ability') onUseAbility((action as Ability).id, targetEnemyId);
              else if (type === 'consumable') onUseConsumable((action as Consumable).id, null);
              handleCategoryChange(activeDynamicView);
             }}
            onMouseEnterAction={handleGridSlotMouseEnter}
            onMouseLeaveAction={handleGridSlotMouseLeave}
            freestyleActionText={freestyleActionText}
            setFreestyleActionText={setFreestyleActionText}
            handleCategoryChange={handleCategoryChange}
          />
        </ContentArea>

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
          <LayoutManagerModal
            isOpen={showLayoutManager}
            onClose={() => setShowLayoutManager(false)}
            config={currentConfig}
            setCurrentConfig={setCurrentConfig}
            saveLayoutToStorage={saveLayoutToStorage}
            loadLayoutFromStorage={loadLayoutFromStorage}
            exportLayout={exportLayout}
            importLayout={importLayout}
            resetLayout={resetLayout}
            applyPresetLayout={applyPresetLayout}
          />
        )}
      </div>
    </>
  );
};

export default CombatView;

