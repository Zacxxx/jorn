import React, { useEffect, useCallback } from 'react';

// Import all our extracted modules
import { useGameState } from './game-core/state/GameState';
import { usePlayerState } from './game-core/player/PlayerState';
import { calculateEffectiveStats, calculateMaxRegisteredSpells, calculateMaxPreparedSpells, calculateMaxPreparedAbilities } from './game-core/player/PlayerStats';
import { getEffectiveTags } from './game-core/spells/TagSystem';
import { SpellCraftingUtils } from './game-core/spells/SpellCrafting';
import { ItemManagementUtils } from './game-core/items/ItemManagement';
import { HomesteadManagerUtils } from './game-core/homestead/HomesteadManager';
import { SettlementManagerUtils } from './game-core/settlement/SettlementManager';
import { CombatEngineUtils } from './game-core/combat/CombatEngine';
import { NavigationControllerUtils } from './game-core/navigation/NavigationController';
import { SaveManagerUtils } from './game-core/persistence/SaveManager';
import { RecipeManagerUtils } from './game-core/crafting/RecipeManager';
import { AbilityManagerUtils } from './game-core/abilities/AbilityManager';
import { TurnManagerUtils } from './game-core/game-loop/TurnManager';
import { CampManagerUtils } from './game-core/camp/CampManager';
import { ProgressionManagerUtils } from './game-core/progression/ProgressionManager';
import { ResearchManagerUtils } from './game-core/research/ResearchManager';
import { SettingsManagerUtils } from './game-core/settings/SettingsManager';
import { TraitManagerUtils } from './game-core/traits/TraitManager';
import { ConsumablesUtils } from './game-core/hooks/useConsumables';

// Import UI components
import AppShell from './game-graphics/AppShell';
import ViewRouter from './game-graphics/ViewRouter';

// Import types
import { Player, Enemy, Spell, Ability, DetailedEquipmentSlot, CharacterSheetTab, StatusEffectName } from './types';

/**
 * Main App Component
 * Integrates all extracted modules and provides the complete game experience
 */
export const App: React.FC = () => {
  // Use our extracted state management
  const gameState = useGameState();
  const playerState = usePlayerState();

  // Calculate effective stats using our extracted module
  const effectivePlayerStats = calculateEffectiveStats(playerState.player);
  const maxRegisteredSpells = calculateMaxRegisteredSpells(playerState.player.level);
  const maxPreparedSpells = calculateMaxPreparedSpells(playerState.player.level);
  const maxPreparedAbilities = calculateMaxPreparedAbilities(playerState.player.level);

  // Auto-save functionality
  useEffect(() => {
    if (gameState.autoSave) {
      playerState.savePlayer();
    }
  }, [playerState.player, gameState.autoSave]);

  // Create context objects for our extracted modules
  const createNavigationContext = useCallback(() => ({
    player: playerState.player,
    effectivePlayerStats,
    pendingTraitUnlock: TraitManagerUtils.canCraftTrait(playerState.player),
    setGameState: gameState.setGameState as (state: string) => void,
    setDefaultCharacterSheetTab: gameState.setDefaultCharacterSheetTab,
    setInitialSpellPromptForStudio: gameState.setInitialSpellPromptForStudio,
    setIsHelpWikiOpen: gameState.setIsHelpWikiOpen,
    setIsGameMenuOpen: gameState.setIsGameMenuOpen,
    setIsMobileMenuOpen: gameState.setIsMobileMenuOpen,
    setCurrentEnemies: gameState.setCurrentEnemies,
    setTargetEnemyId: gameState.setTargetEnemyId,
    setCombatLog: gameState.setCombatLog,
    setModalContent: gameState.setModalContent,
    setPlayer: playerState.setPlayer,
    setUseLegacyFooter: gameState.setUseLegacyFooter,
    setDebugMode: gameState.setDebugMode,
    setAutoSave: gameState.setAutoSave,
  }), [playerState, gameState, effectivePlayerStats]);

  // Navigation handlers using our extracted NavigationController
  const handleNavigateHome = useCallback(() => {
    const context = createNavigationContext();
    NavigationControllerUtils.navigateToHome(context);
  }, [createNavigationContext]);

  const handleOpenCharacterSheet = useCallback((tab?: CharacterSheetTab) => {
    const context = createNavigationContext();
    NavigationControllerUtils.navigateToCharacterSheet(context, tab || 'Main');
  }, [createNavigationContext]);

  const handleOpenCraftingHub = useCallback(() => {
    const context = createNavigationContext();
    NavigationControllerUtils.navigateToCraftingHub(context);
  }, [createNavigationContext]);

  // Equipment handlers using our extracted ItemManagement
  const handleEquipItem = useCallback((itemId: string, slot: DetailedEquipmentSlot) => {
    const result = ItemManagementUtils.equipItem(playerState.player, itemId, slot);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Equipment Error', result.error || 'Failed to equip item', 'error');
    }
  }, [playerState, gameState]);

  const handleUnequipItem = useCallback((slot: DetailedEquipmentSlot) => {
    const result = ItemManagementUtils.unequipItem(playerState.player, slot);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Equipment Error', result.error || 'Failed to unequip item', 'error');
    }
  }, [playerState, gameState]);

  // Spell preparation handlers
  const handlePrepareSpell = useCallback((spell: Spell) => {
    const result = ItemManagementUtils.prepareSpell(playerState.player, spell);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Spell Preparation Error', result.error || 'Failed to prepare spell', 'error');
    }
  }, [playerState, gameState]);

  const handleUnprepareSpell = useCallback((spell: Spell) => {
    const result = ItemManagementUtils.unprepareSpell(playerState.player, spell);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Spell Preparation Error', result.error || 'Failed to unprepare spell', 'error');
    }
  }, [playerState, gameState]);

  // Ability preparation handlers
  const handlePrepareAbility = useCallback((ability: Ability) => {
    const result = ItemManagementUtils.prepareAbility(playerState.player, ability);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Ability Preparation Error', result.error || 'Failed to prepare ability', 'error');
    }
  }, [playerState, gameState]);

  const handleUnprepareAbility = useCallback((ability: Ability) => {
    const result = ItemManagementUtils.unprepareAbility(playerState.player, ability);
    if (result.success && result.updatedPlayer) {
      playerState.setPlayer(() => result.updatedPlayer!);
    } else {
      gameState.showMessageModal('Ability Preparation Error', result.error || 'Failed to unprepare ability', 'error');
    }
  }, [playerState, gameState]);

  // Save/Load handlers using our extracted SaveManager
  const handleExportSave = useCallback(() => {
    const result = SaveManagerUtils.exportSaveData();
    if (result.success) {
      gameState.showMessageModal('Export Successful', 'Save data exported successfully!', 'success');
    } else {
      gameState.showMessageModal('Export Failed', result.message, 'error');
    }
  }, [gameState]);

  const handleImportSave = useCallback(() => {
    // This would typically open a file picker
    // For now, we'll show a message about the functionality
    gameState.showMessageModal('Import Save', 'Import functionality available through extracted SaveManager module.', 'info');
  }, [gameState]);

  // Consumable usage handler
  const handleUseConsumable = useCallback((itemId: string, targetId: string | null) => {
    const context = {
      player: playerState.player,
      currentEnemies: gameState.currentEnemies,
      effectivePlayerStats,
      setPlayer: playerState.setPlayer,
      setCurrentEnemies: gameState.setCurrentEnemies,
      setIsPlayerTurn: gameState.setIsPlayerTurn,
      addLog: gameState.addLog,
      applyStatusEffect: (targetId: 'player' | string, effect: { name: StatusEffectName; duration: number; magnitude?: number; chance: number }, sourceId: string) => {
        // Implementation would use our status effect system
        console.log('Apply status effect:', effect, 'to', targetId, 'from', sourceId);
      },
    };
    const result = ConsumablesUtils.useConsumable(itemId, targetId, context);
    if (!result.success) {
      gameState.showMessageModal('Consumable Error', result.message, 'error');
    }
  }, [playerState, gameState, effectivePlayerStats]);

  // Check for pending trait unlock
  const pendingTraitUnlock = TraitManagerUtils.canCraftTrait(playerState.player);

  // Prepare props for AppShell
  const appShellProps = {
    // Game state
    gameState: gameState.gameState,
    player: playerState.player,
    effectivePlayerStats,
    modalContent: gameState.modalContent,
    defaultCharacterSheetTab: gameState.defaultCharacterSheetTab || 'Main',
    useLegacyFooter: gameState.useLegacyFooter,
    maxRegisteredSpells,
    maxPreparedSpells,
    maxPreparedAbilities,
    pendingTraitUnlock,
    
    // Modal state
    isHelpWikiOpen: gameState.isHelpWikiOpen,
    isGameMenuOpen: gameState.isGameMenuOpen,
    isMobileMenuOpen: gameState.isMobileMenuOpen,
    
    // Navigation handlers
    onNavigateHome: handleNavigateHome,
    onOpenMobileMenu: () => gameState.setIsMobileMenuOpen(true),
    onOpenCraftingHub: handleOpenCraftingHub,
    
    // Modal handlers
    onOpenCharacterSheet: handleOpenCharacterSheet,
    onCloseHelpWiki: () => gameState.setIsHelpWikiOpen(false),
    onOpenHelpWiki: () => gameState.setIsHelpWikiOpen(true),
    onCloseGameMenu: () => gameState.setIsGameMenuOpen(false),
    onOpenGameMenu: () => gameState.setIsGameMenuOpen(true),
    onCloseMobileMenu: () => gameState.setIsMobileMenuOpen(false),
    onOpenParameters: () => {
      const context = createNavigationContext();
      NavigationControllerUtils.navigateToParameters(context);
    },
    onExportSave: handleExportSave,
    onImportSave: handleImportSave,
    
    // Character sheet handlers
    onEquipItem: handleEquipItem,
    onUnequipItem: handleUnequipItem,
    onEditSpell: (spell: Spell) => {
      // Navigate to spell editing
      gameState.setGameState('SPELL_EDITING');
    },
    onPrepareSpell: handlePrepareSpell,
    onUnprepareSpell: handleUnprepareSpell,
    onPrepareAbility: handlePrepareAbility,
    onUnprepareAbility: handleUnprepareAbility,
    onOpenLootChest: async (chestId: string) => {
      // Handle loot chest opening
      console.log('Opening loot chest:', chestId);
    },
    onUseConsumable: handleUseConsumable,
    
    // Modal close handlers
    onCloseModal: () => gameState.setModalContent(null),
    onCloseCharacterSheet: () => gameState.setGameState('HOME'),
    onOpenSpellDesignStudio: () => {
      const context = createNavigationContext();
      NavigationControllerUtils.navigateToSpellDesignStudio(context);
    },
    onOpenTraitsPage: () => {
      const context = createNavigationContext();
      NavigationControllerUtils.navigateToTraitsPage(context);
    },
    
    // Utility functions
    showMessageModal: gameState.showMessageModal,
    
    // All other game state for ViewRouter
    isLoading: gameState.isLoading,
    currentEnemies: gameState.currentEnemies,
    targetEnemyId: gameState.targetEnemyId,
    combatLog: gameState.combatLog,
    turn: gameState.turn,
    isPlayerTurn: gameState.isPlayerTurn,
    currentActingEnemyIndex: gameState.currentActingEnemyIndex,
    pendingSpellCraftData: gameState.pendingSpellCraftData,
    pendingItemCraftData: gameState.pendingItemCraftData,
    pendingSpellEditData: gameState.pendingSpellEditData,
    initialSpellPromptForStudio: gameState.initialSpellPromptForStudio,
    currentShopId: gameState.currentShopId,
    currentTavernId: gameState.currentTavernId,
    currentNPCId: gameState.currentNPCId,
    isWorldMapOpen: gameState.isWorldMapOpen,
    isExplorationJournalOpen: gameState.isExplorationJournalOpen,
    isTraveling: gameState.isTraveling,
    debugMode: gameState.debugMode,
    autoSave: gameState.autoSave,
  };

  return <AppShell {...appShellProps} />;
};

export default App;
