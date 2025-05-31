import React from 'react';

// Import our modular architecture
import { useGameState } from './game-core/state/GameState';
import { usePlayerState } from './game-core/player/PlayerState';
import { calculateEffectiveStats } from './game-core/player/PlayerStats';
import { SettingsManagerUtils } from './game-core/settings/SettingsManager';

// Import UI components (using default exports)
import AppShell from './game-graphics/AppShell';
import ViewRouter from './game-graphics/ViewRouter';

// Import types
import { Player, Enemy, GameItem, Spell, Ability, Trait, SpellComponent, Recipe, CombatActionLog } from './src/types';

/**
 * Main App Component
 * 
 * This is the new, clean App.tsx that uses our modular architecture.
 * All game logic has been extracted into focused modules in game-core/
 * All UI components are properly separated in game-graphics/ and src/components/
 */
const App: React.FC = () => {
  // Use our modular state management
  const gameState = useGameState();
  const { player, setPlayer } = usePlayerState();
  
  // Load settings using our settings manager
  const settings = SettingsManagerUtils.loadSettings();
  
  // Calculate effective stats using our player stats module
  const effectivePlayerStats = calculateEffectiveStats(player);

  // Create a simple message modal function
  const showMessageModal = (title: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
    gameState.setModalContent({ title, message, type });
  };

  // Create a simple log function with proper CombatActionLog structure
  const addLog = (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => {
    const newLogEntry: CombatActionLog = {
      id: Date.now().toString(),
      turn: gameState.turn,
      actor,
      message,
      type
    };
    gameState.setCombatLog(prev => [...prev, newLogEntry]);
  };

  // Create a simple clear log function
  const clearLog = () => {
    gameState.setCombatLog([]);
  };

  // View router props - simplified for now
  const viewRouterProps = {
    gameState: gameState.gameState,
    isLoading: gameState.isLoading,
    player,
    setPlayer,
    effectivePlayerStats,
    currentEnemies: gameState.currentEnemies,
    setCurrentEnemies: gameState.setCurrentEnemies,
    turn: gameState.turn,
    setTurn: gameState.setTurn,
    isPlayerTurn: gameState.isPlayerTurn,
    setIsPlayerTurn: gameState.setIsPlayerTurn,
    currentActingEnemyIndex: gameState.currentActingEnemyIndex,
    setCurrentActingEnemyIndex: gameState.setCurrentActingEnemyIndex,
    combatLog: gameState.combatLog,
    addLog,
    clearLog,
    targetEnemyId: gameState.targetEnemyId,
    setTargetEnemyId: gameState.setTargetEnemyId,
    setGameState: (state: string) => gameState.setGameState(state as any),
    setIsLoading: gameState.setIsLoading,
    showMessageModal,
    closeModal: () => gameState.setModalContent(null),
    setModalContent: gameState.setModalContent,
    // Required props with defaults
    playerActionSkippedByStun: gameState.playerActionSkippedByStun,
    defaultCharacterSheetTab: gameState.defaultCharacterSheetTab,
    initialSpellPromptForStudio: gameState.initialSpellPromptForStudio,
    currentShopId: gameState.currentShopId,
    modalContent: gameState.modalContent,
    pendingSpellCraftData: gameState.pendingSpellCraftData,
    pendingSpellEditData: gameState.pendingSpellEditData,
    pendingItemCraftData: gameState.pendingItemCraftData,
    originalSpellForEdit: gameState.originalSpellForEdit,
    maxRegisteredSpells: 10,
    maxPreparedSpells: 5,
    maxPreparedAbilities: 3,
    useLegacyFooter: settings.useLegacyFooter,
    debugMode: settings.debugMode,
    autoSave: settings.autoSave,
    // Add placeholder functions for now - these will be implemented with our modules
    onFindEnemy: async () => {},
    onExploreMap: () => {},
    onOpenResearchArchives: () => {},
    onOpenCamp: () => {},
    onOpenHomestead: () => {},
    onAccessSettlement: () => {},
    onOpenCraftingHub: () => {},
    onOpenNPCs: () => {},
    onNavigateHome: () => {},
    onRestComplete: () => {},
    onStartHomesteadProject: () => {},
    onCompleteHomesteadProject: () => {},
    onUpgradeHomesteadProperty: () => {},
    onOpenShop: () => {},
    onOpenTavern: () => {},
    onTalkToNPC: () => {},
    onExplorePointOfInterest: () => {},
    onPurchaseItem: () => {},
    onPurchaseService: () => {},
    onDiscoverRecipe: async () => {},
    onCraftItem: async () => {},
    onOpenSpellDesignStudio: () => {},
    onOpenTheorizeComponentLab: () => {},
    onAICreateComponent: async () => null,
    onInitiateItemCraft: async () => {},
    onFinalizeSpellDesign: async () => {},
    onOldSpellCraftInitiation: async () => {},
    onInitiateSpellRefinement: async () => {},
    onCraftTrait: async () => {},
    onSetTargetEnemy: () => {},
    onPlayerAttack: () => {},
    onPlayerBasicAttack: () => {},
    onPlayerDefend: () => {},
    onPlayerFlee: () => {},
    onPlayerFreestyleAction: async () => {},
    onUseConsumable: () => {},
    onUseAbility: () => {},
    onConfirmSpellCraft: () => {},
    onConfirmSpellEdit: () => {},
    onConfirmItemCraft: () => {},
    onCancelCrafting: () => {},
    onToggleLegacyFooter: () => {},
    onToggleDebugMode: () => {},
    onToggleAutoSave: () => {},
    onSetGameState: (state: string) => gameState.setGameState(state as any),
    onSetDefaultCharacterSheetTab: gameState.setDefaultCharacterSheetTab,
    onOpenLootChest: async () => {},
    // Utility functions
    getPreparedSpells: () => [],
    getPreparedAbilities: () => [],
    checkResources: () => true,
    renderResourceList: () => null,
  };

  // App shell props - simplified for now
  const appShellProps = {
    ...viewRouterProps,
    modalContent: gameState.modalContent,
    isHelpWikiOpen: gameState.isHelpWikiOpen,
    setIsHelpWikiOpen: gameState.setIsHelpWikiOpen,
    isGameMenuOpen: gameState.isGameMenuOpen,
    setIsGameMenuOpen: gameState.setIsGameMenuOpen,
    isMobileMenuOpen: gameState.isMobileMenuOpen,
    setIsMobileMenuOpen: gameState.setIsMobileMenuOpen,
    pendingTraitUnlock: gameState.pendingTraitUnlock,
    // Placeholder handlers
    onOpenCharacterSheet: () => {},
    onCloseHelpWiki: () => gameState.setIsHelpWikiOpen(false),
    onOpenHelpWiki: () => gameState.setIsHelpWikiOpen(true),
    onCloseGameMenu: () => gameState.setIsGameMenuOpen(false),
    onOpenGameMenu: () => gameState.setIsGameMenuOpen(true),
    onCloseMobileMenu: () => gameState.setIsMobileMenuOpen(false),
    onOpenMobileMenu: () => gameState.setIsMobileMenuOpen(true),
    onOpenParameters: () => {},
    onExportSave: () => {},
    onImportSave: () => {},
    onEquipItem: () => {},
    onUnequipItem: () => {},
    onEditSpell: () => {},
    onPrepareSpell: () => {},
    onUnprepareSpell: () => {},
    onPrepareAbility: () => {},
    onUnprepareAbility: () => {},
    onCloseModal: () => gameState.setModalContent(null),
    onCloseCharacterSheet: () => {},
    onOpenSpellDesignStudio: () => {},
    onOpenTraitsPage: () => {},
    onOpenLootChest: async () => {},
    onUseConsumable: () => {},
  };

  return (
    <div className="App">
      <AppShell {...appShellProps}>
        <ViewRouter {...viewRouterProps} />
      </AppShell>
    </div>
  );
};

export default App;
