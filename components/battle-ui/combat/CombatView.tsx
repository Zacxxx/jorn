import React, { useState, useEffect, useCallback } from 'react';
import { Enemy, Spell, Consumable, Ability, CombatActionLog, Player, PlayerEffectiveStats } from '../../../types';
import ActionButton from '../layout/ActionButton';
import LoadingSpinner from '../../ui/LoadingSpinner';
import Modal from '../../ui/Modal';
import PlayerStatsDisplay from '../../characterwindow/character/PlayerStatsDisplay';
import EnemyDisplay from '../layout/EnemyDisplay';

// Import refactored components and hooks
import { useCombatLayout, useDragAndDrop, useLayoutHistory } from '../../hooks';
import { EditModeToolbar, GridOverlay } from '../layout';
import { BattleArena, CharacterSprites } from '../combat';
import { ActionMenu, CombatActionTooltip } from '../actions';
import { ContentArea, DynamicContent } from '../content';
import { LayoutManagerModal } from '../modals';

// Import types from the types index file
import { JornBattleConfig, BattleLayoutConfig } from '../../../types';
import { DynamicAreaView, CombatActionItemType, CombatViewProps } from '../../../types/combat';

// --- Default Configuration ---
const defaultJornBattleConfig: JornBattleConfig = {
  battleAreaHeight: 500,
  useFullHeight: true,
  gridColumns: 12,
  gridRows: 8,
  canvasWidth: '100%',
  canvasHeight: '85vh',
  canvasMinWidth: '320px',
  canvasMinHeight: '480px',
  layout: {
    battleArea: { position: { x: 0, y: 0 }, size: { width: 100, height: 60 }, visible: true, zIndex: 1 },
    actionMenu: { position: { x: 0, y: 60 }, size: { width: 100, height: 20 }, visible: true, zIndex: 2 },
    contentArea: { position: { x: 0, y: 80 }, size: { width: 100, height: 20 }, visible: true, zIndex: 2 },
    playerSprite: { position: { x: 75, y: 45 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 1.0 },
    enemySprites: [
      { position: { x: 25, y: 20 }, size: { width: 20, height: 25 }, visible: true, zIndex: 3, scale: 1.0 },
    ],
    playerStatus: { position: { x: 5, y: 5 }, size: { width: 40, height: 10 }, visible: true, zIndex: 10 },
    enemyStatus: { position: { x: 55, y: 5 }, size: { width: 40, height: 10 }, visible: true, zIndex: 10 },
    actionGrid: { position: { x: 5, y: 65 }, size: { width: 90, height: 30 }, visible: false, zIndex: 5 },
    turnIndicator: { position: { x: 45, y: 1 }, size: { width: 10, height: 5 }, visible: true, zIndex: 10 },
    combatLog: { position: { x: 5, y: 85 }, size: { width: 90, height: 10 }, visible: false, zIndex: 5 },
    dynamicViewContainer: { position: { x: 25, y: 65 }, size: { width: 75, height: 35 }, visible: true, zIndex: 2 }
  },
  playerPosition: { x: 75, y: 45 },
  enemyPositions: [
    { x: 25, y: 20 }
  ],
  playerStatusPosition: { x: 5, y: 5 },
  enemyStatusPosition: { x: 55, y: 5 },
  background: {
    backgroundGradient: { from: 'from-sky-700/40', to: 'to-green-700/40' }
  },
  fontSizes: {
    base: '1rem', small: '0.75rem', large: '1.25rem', heading: '1.5rem', ui: '0.875rem'
  },
  animationSpeed: 1,
  showDamageNumbers: true,
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
  combatLog: combatLogFromProps,
  isPlayerTurn, playerActionSkippedByStun,
  onUseConsumable, onUseAbility, consumables, abilities,
  config = {}
}) => {
  // --- NEW LOGIC FOR AOE TARGETING ---
  // State to store selected enemy ids (for AOE)
  const [selectedEnemyIds, setSelectedEnemyIds] = useState<string[]>([]);
  // State to store the currently selected spell (for UI highlight)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  // Helper to determine if a spell is AOE
  const isAOESpell = (spell: Spell | null | undefined) => {
    if (!spell) return false;
    if (spell.targetType) return spell.targetType === 'aoe';
    return spell.aoe === true;
  };

  // When a spell is selected, update selectedEnemyIds if AOE
  const handleSpellSelect = (spell: Spell) => {
    setSelectedSpell(spell);
    if (isAOESpell(spell)) {
      // Select all alive enemy IDs
      const allEnemyIds = currentEnemies.filter(e => e.hp > 0).map(e => e.id);
      setSelectedEnemyIds(allEnemyIds);
      // Optionally: call onSetTargetEnemy(null) to clear single target
    } else {
      setSelectedEnemyIds([]);
    }
  };

  // When an enemy is clicked (single target)
  const handleEnemyClick = (enemyId: string) => {
    if (selectedSpell && isAOESpell(selectedSpell)) {
      // Do nothing or show info: selection multiple automatique
      return;
    } else {
      setSelectedEnemyIds([enemyId]);
      onSetTargetEnemy(enemyId);
    }
  };

  // When an action is triggered (attack/cast)
  const handleAction = (action: Spell | Ability | Consumable, type: string) => {
    if (!isPlayerTurn || playerActionSkippedByStun) return;
    if (type === 'spell') {
      if (selectedSpell && isAOESpell(selectedSpell)) {
        // AOE: passer tous les IDs d'ennemis sélectionnés
        if (selectedEnemyIds.length > 0) {
          onPlayerAttack(action as Spell, selectedEnemyIds);
        } else {
          alert("Aucune cible valide pour le sort AOE");
        }
      } else {
        // Single target
        if (targetEnemyId) onPlayerAttack(action as Spell, targetEnemyId);
        else alert("Select a target!");
      }
    } else if (type === 'ability') {
      onUseAbility((action as Ability).id, targetEnemyId);
    } else if (type === 'consumable') {
      onUseConsumable((action as Consumable).id, null);
    }
    // Reset spell selection after action
    setSelectedSpell(null);
    setSelectedEnemyIds([]);
  };

  // Synchronize selectedEnemyIds if enemies die or change
  useEffect(() => {
    if (selectedSpell && isAOESpell(selectedSpell)) {
      const allEnemyIds = currentEnemies.filter(e => e.hp > 0).map(e => e.id);
      setSelectedEnemyIds(allEnemyIds);
    }
  }, [currentEnemies, selectedSpell]);
  // --- END NEW LOGIC ---

  const initialConfig: JornBattleConfig = (() => {
    const d = defaultJornBattleConfig; // Alias for default
    const p = config || {};          // Alias for props config, ensuring it's an object

    const getLayout = (): BattleLayoutConfig => {
      const dL = d.layout;
      const pL = (p.layout || {}) as Partial<BattleLayoutConfig>; // Props layout, or empty, as Partial
      return {
        battleArea: pL.battleArea || dL.battleArea,
        actionMenu: pL.actionMenu || dL.actionMenu,
        contentArea: pL.contentArea || dL.contentArea,
        playerSprite: pL.playerSprite || dL.playerSprite,
        enemySprites: pL.enemySprites || dL.enemySprites,
        playerStatus: pL.playerStatus || dL.playerStatus,
        enemyStatus: pL.enemyStatus || dL.enemyStatus,
        actionGrid: pL.actionGrid || dL.actionGrid,
        turnIndicator: pL.turnIndicator || dL.turnIndicator,
        combatLog: pL.combatLog || dL.combatLog,
        dynamicViewContainer: pL.dynamicViewContainer || dL.dynamicViewContainer,
      };
    };

    return {
      battleAreaHeight: p.battleAreaHeight ?? d.battleAreaHeight,
      useFullHeight: p.useFullHeight ?? d.useFullHeight,
      gridColumns: p.gridColumns ?? d.gridColumns, 
      gridRows: p.gridRows ?? d.gridRows,
      canvasWidth: p.canvasWidth ?? d.canvasWidth,
      canvasHeight: p.canvasHeight ?? d.canvasHeight,
      canvasMinWidth: p.canvasMinWidth ?? d.canvasMinWidth,
      canvasMinHeight: p.canvasMinHeight ?? d.canvasMinHeight,
      layout: getLayout(), // layout is always fully constructed by getLayout
      playerPosition: p.playerPosition ?? d.playerPosition,
      enemyPositions: p.enemyPositions ?? d.enemyPositions,
      playerStatusPosition: p.playerStatusPosition ?? d.playerStatusPosition,
      enemyStatusPosition: p.enemyStatusPosition ?? d.enemyStatusPosition,
      // For nested objects, ensure merging happens safely
      background: { ...(d.background || {}), ...(p.background || {}) },
      fontSizes: { ...(d.fontSizes || {}), ...(p.fontSizes || {}) },
      animationSpeed: p.animationSpeed ?? d.animationSpeed,
      showDamageNumbers: p.showDamageNumbers ?? d.showDamageNumbers,
      messageBoxStyle: { ...(d.messageBoxStyle || {}), ...(p.messageBoxStyle || {}) },
      menuStyle: { ...(d.menuStyle || {}), ...(p.menuStyle || {}) },
      editMode: { ...(d.editMode || {}), ...(p.editMode || {}) },
    } as JornBattleConfig; // Final assertion
  })();

  const { currentConfig, setCurrentConfig, isEditMode, setIsEditMode, selectedElement, setSelectedElement, updateElementPosition, updateElementSize, applyPresetLayout } = useCombatLayout(initialConfig);
  const { 
    isDragging, 
    isResizing, 
    containerRef, 
    handleMouseDown, 
    setDragStart,
    setIsDragging,
    setIsResizing,
    setResizeHandle
  } = useDragAndDrop({ config: currentConfig, isEditMode, selectedElement, setSelectedElement, updateElementPosition, updateElementSize });
  const { layoutHistory, saveToHistory, undo, redo, canUndo, canRedo } = useLayoutHistory();

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
          const importedConfig = JSON.parse(e.target?.result as string) as Partial<JornBattleConfig>; 
          setCurrentConfig((prev: JornBattleConfig): JornBattleConfig => {
            const d = defaultJornBattleConfig; // Default config alias
            const p = prev || {}; // Previous state alias
            const i = importedConfig || {}; // Imported config alias
            
            const getMergedLayout = (): BattleLayoutConfig => {
              const dL = d.layout;
              const pL = (p.layout || {}) as Partial<BattleLayoutConfig>; 
              const iL = (i.layout || {}) as Partial<BattleLayoutConfig>; 
              return {
                battleArea: iL.battleArea || pL.battleArea || dL.battleArea,
                actionMenu: iL.actionMenu || pL.actionMenu || dL.actionMenu,
                contentArea: iL.contentArea || pL.contentArea || dL.contentArea,
                playerSprite: iL.playerSprite || pL.playerSprite || dL.playerSprite,
                enemySprites: iL.enemySprites || pL.enemySprites || dL.enemySprites,
                playerStatus: iL.playerStatus || pL.playerStatus || dL.playerStatus,
                enemyStatus: iL.enemyStatus || pL.enemyStatus || dL.enemyStatus,
                actionGrid: iL.actionGrid || pL.actionGrid || dL.actionGrid,
                turnIndicator: iL.turnIndicator || pL.turnIndicator || dL.turnIndicator,
                combatLog: iL.combatLog || pL.combatLog || dL.combatLog,
                dynamicViewContainer: iL.dynamicViewContainer || pL.dynamicViewContainer || dL.dynamicViewContainer,
              };
            };

            return {
              battleAreaHeight: i.battleAreaHeight ?? p.battleAreaHeight ?? d.battleAreaHeight,
              useFullHeight: i.useFullHeight ?? p.useFullHeight ?? d.useFullHeight,
              gridColumns: i.gridColumns ?? p.gridColumns ?? d.gridColumns,
              gridRows: i.gridRows ?? p.gridRows ?? d.gridRows,
              canvasWidth: i.canvasWidth ?? p.canvasWidth ?? d.canvasWidth,
              canvasHeight: i.canvasHeight ?? p.canvasHeight ?? d.canvasHeight,
              canvasMinWidth: i.canvasMinWidth ?? p.canvasMinWidth ?? d.canvasMinWidth,
              canvasMinHeight: i.canvasMinHeight ?? p.canvasMinHeight ?? d.canvasMinHeight,
              layout: getMergedLayout(),
              playerPosition: i.playerPosition ?? p.playerPosition ?? d.playerPosition,
              enemyPositions: i.enemyPositions ?? p.enemyPositions ?? d.enemyPositions,
              playerStatusPosition: i.playerStatusPosition ?? p.playerStatusPosition ?? d.playerStatusPosition,
              enemyStatusPosition: i.enemyStatusPosition ?? p.enemyStatusPosition ?? d.enemyStatusPosition,
              background: { ...(d.background || {}), ...(p.background || {}), ...(i.background || {}) },
              fontSizes: { ...(d.fontSizes || {}), ...(p.fontSizes || {}), ...(i.fontSizes || {}) },
              animationSpeed: i.animationSpeed ?? p.animationSpeed ?? d.animationSpeed,
              showDamageNumbers: i.showDamageNumbers ?? p.showDamageNumbers ?? d.showDamageNumbers,
              messageBoxStyle: { ...(d.messageBoxStyle || {}), ...(p.messageBoxStyle || {}), ...(i.messageBoxStyle || {}) },
              menuStyle: { ...(d.menuStyle || {}), ...(p.menuStyle || {}), ...(i.menuStyle || {}) },
              editMode: { ...(d.editMode || {}), ...(p.editMode || {}), ...(i.editMode || {}) },
            } as JornBattleConfig;
          });
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
    saveToHistory(currentConfig);
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
          .combat-view-container {
            /* Base font size for scaling, set via JS style prop */
          }
          .combat-view-container * {
            /* Consider if this global override is too aggressive. 
               It might be better to let Tailwind's text utilities handle most cases 
               and apply specific scaling where needed.
               For now, making it scale with --font-base-rem from CSS variables. */
            font-size: calc(var(--font-base-rem, 1rem) * 1) !important; /* Default to 1rem if --font-base-rem is not set */
          }
          .combat-view-container .text-xs {
            font-size: calc(var(--font-ui-rem, 0.75rem) * 0.8) !important; /* Adjusted for better scaling */
          }
          .combat-view-container .text-sm {
            font-size: calc(var(--font-ui-rem, 0.875rem) * 0.9) !important; /* Adjusted for better scaling */
          }
          .combat-view-container .text-lg {
            font-size: calc(var(--font-large-rem, 1.25rem) * 1) !important;
          }
          .combat-view-container .text-xl, .combat-view-container .text-2xl {
            font-size: calc(var(--font-heading-rem, 1.5rem) * 1) !important;
          }
        `}
      </style>
      <div
        ref={containerRef}
        className="combat-view-container relative bg-slate-900 rounded-xl shadow-2xl border-2 border-slate-700 overflow-hidden 
                   w-full h-[85vh] md:h-auto" // Mobile: full width, 85% viewport height. md and up: height auto (to be set by style prop or content)
        style={{
          // Apply config dimensions only for md screens and up
          width: window.innerWidth >= 768 ? `${currentConfig.canvasWidth}%` : '100%', // Full width on mobile
          height: window.innerWidth >= 768 
            ? (currentConfig.useFullHeight ? `${currentConfig.canvasHeight}` : `${currentConfig.battleAreaHeight + 300}px`)
            : '85vh', // Fixed height for mobile, can be adjusted
          minWidth: window.innerWidth >= 768 ? `${currentConfig.canvasMinWidth}px` : '100%', // Mobile: no min-width other than 100%
          minHeight: window.innerWidth >= 768 ? `${currentConfig.canvasMinHeight}px` : 'auto', // Mobile: min-height auto

          // Apply comprehensive font scaling using CSS custom properties (ensure these are in rem)
          '--font-base-rem': `${currentConfig.fontSizes?.base || 1}rem`,
          '--font-small-rem': `${currentConfig.fontSizes?.small || 0.75}rem`,
          '--font-large-rem': `${currentConfig.fontSizes?.large || 1.25}rem`,
          '--font-heading-rem': `${currentConfig.fontSizes?.heading || 1.5}rem`,
          '--font-ui-rem': `${currentConfig.fontSizes?.ui || 0.875}rem`,
          fontSize: `var(--font-base-rem)` // Base font size applied here
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
            setDragStart={setDragStart}
            setIsDragging={setIsDragging}
            setIsResizing={setIsResizing}
            setResizeHandle={setResizeHandle}
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
            combatLog={combatLogFromProps}
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

