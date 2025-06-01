import React from 'react';
import { 
  Player, 
  PlayerEffectiveStats, 
  CharacterSheetTab,
  Spell,
  Ability,
  DetailedEquipmentSlot
} from '../types';
import { FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL } from '../constants';

// Import layout and modal components
import MainLayout from '../src/layouts/MainLayout';
import Modal from '../src/components/Modal';
import { CharacterSheetModal } from '../src/CharacterSheetModal.ancient';
import HelpWikiModal from '../src/components/HelpWikiModal';
import GameMenuModal from '../src/components/GameMenuModal';
import MobileMenuModal from '../src/components/MobileMenuModal';

// Import ViewRouter
import ViewRouter, { ViewRouterProps } from './ViewRouter';

/**
 * App Shell Component
 * Main application shell that handles layout, modals, and view routing
 */

export interface AppShellProps {
  // Game state - from ViewRouterProps
  gameState: string;
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  modalContent: { title: string; message: string; type?: 'info' | 'error' | 'success' } | null;
  defaultCharacterSheetTab: CharacterSheetTab;
  useLegacyFooter: boolean;
  maxRegisteredSpells: number;
  maxPreparedSpells: number;
  maxPreparedAbilities: number;
  
  // Modal state
  isHelpWikiOpen: boolean;
  isGameMenuOpen: boolean;
  isMobileMenuOpen: boolean;
  pendingTraitUnlock: boolean;
  
  // Modal handlers
  onOpenCharacterSheet: (tab?: CharacterSheetTab) => void;
  onCloseHelpWiki: () => void;
  onOpenHelpWiki: () => void;
  onCloseGameMenu: () => void;
  onOpenGameMenu: () => void;
  onCloseMobileMenu: () => void;
  onOpenMobileMenu: () => void;
  onOpenParameters: () => void;
  onExportSave: () => void;
  onImportSave: () => void;
  onOpenSpellDesignStudio: () => void;
  onOpenTraitsPage: () => void;
  
  // Character sheet handlers
  onEquipItem: (itemId: string, slot: DetailedEquipmentSlot) => void;
  onUnequipItem: (slot: DetailedEquipmentSlot) => void;
  onEditSpell: (spell: Spell) => void;
  onPrepareSpell: (spell: Spell) => void;
  onUnprepareSpell: (spell: Spell) => void;
  onPrepareAbility: (ability: Ability) => void;
  onUnprepareAbility: (ability: Ability) => void;
  onOpenLootChest: (chestId: string) => Promise<void>;
  onUseConsumable: (itemId: string, targetId: string | null) => void;
  
  // Navigation handlers
  onNavigateHome: () => void;
  onOpenCraftingHub: () => void;
  
  // Modal close handlers
  onCloseModal: () => void;
  onCloseCharacterSheet: () => void;
  
  // Utility functions
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
  
  // Extract specific ViewRouter props instead of using spread
  isLoading: boolean;
  currentEnemies: any[];
  targetEnemyId: string | null;
  combatLog: any[];
  turn: number;
  isPlayerTurn: boolean;
  currentActingEnemyIndex: number;
  pendingSpellCraftData: any | null;
  pendingItemCraftData: any | null;
  pendingSpellEditData: any | null;
  initialSpellPromptForStudio: string;
  currentShopId: string | null;
  currentTavernId: string | null;
  currentNPCId: string | null;
  isWorldMapOpen: boolean;
  isExplorationJournalOpen: boolean;
  isTraveling: boolean;
  debugMode: boolean;
  autoSave: boolean;
  
  // Combat state helpers
  isInCombatButNotOnCombatScreen?: boolean;
  isInAnyCombat?: boolean;
  onReturnToCombat?: () => void;
  
  // All ViewRouter props
  [key: string]: any;
}

const AppShell: React.FC<AppShellProps> = (props) => {
  const {
    // Game state
    gameState,
    player,
    effectivePlayerStats,
    modalContent,
    defaultCharacterSheetTab,
    useLegacyFooter,
    maxRegisteredSpells,
    maxPreparedSpells,
    maxPreparedAbilities,
    pendingTraitUnlock,
    
    // Modal state
    isHelpWikiOpen,
    isGameMenuOpen,
    isMobileMenuOpen,
    
    // Navigation handlers
    onNavigateHome,
    onOpenMobileMenu,
    onOpenCraftingHub,
    
    // Modal handlers
    onOpenCharacterSheet,
    onCloseHelpWiki,
    onOpenHelpWiki,
    onCloseGameMenu,
    onOpenGameMenu,
    onCloseMobileMenu,
    onOpenParameters,
    onExportSave,
    onImportSave,
    onOpenSpellDesignStudio,
    onOpenTraitsPage,
    
    // Character sheet handlers
    onEquipItem,
    onUnequipItem,
    onEditSpell,
    onPrepareSpell,
    onUnprepareSpell,
    onPrepareAbility,
    onUnprepareAbility,
    onOpenLootChest,
    onUseConsumable,
    
    // Modal close handlers
    onCloseModal,
    onCloseCharacterSheet,
    
    // Utility functions
    showMessageModal,
    
    // Extract specific ViewRouter props instead of using spread
    isLoading,
    currentEnemies,
    targetEnemyId,
    combatLog,
    turn,
    isPlayerTurn,
    currentActingEnemyIndex,
    pendingSpellCraftData,
    pendingItemCraftData,
    pendingSpellEditData,
    initialSpellPromptForStudio,
    currentShopId,
    currentTavernId,
    currentNPCId,
    isWorldMapOpen,
    isExplorationJournalOpen,
    isTraveling,
    debugMode,
    autoSave,
    
    // Combat state helpers
    isInCombatButNotOnCombatScreen,
    isInAnyCombat,
    onReturnToCombat,
    
    // All other props for ViewRouter
    ...viewRouterProps
  } = props;

  // Calculate if player can craft new trait
  const canCraftNewTrait = pendingTraitUnlock || (
    player.level >= FIRST_TRAIT_LEVEL && 
    player.traits.length < (Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1)
  );

  // Prepare ViewRouter props
  const routerProps: ViewRouterProps = {
    gameState,
    isLoading: isLoading || false,
    player,
    effectivePlayerStats,
    currentEnemies: currentEnemies || [],
    targetEnemyId: targetEnemyId || null,
    combatLog: combatLog || [],
    isPlayerTurn: isPlayerTurn !== undefined ? isPlayerTurn : true,
    playerActionSkippedByStun: false, // This should come from props if needed
    defaultCharacterSheetTab,
    initialSpellPromptForStudio: initialSpellPromptForStudio || '',
    currentShopId: currentShopId || null,
    modalContent: modalContent ? { ...modalContent, type: modalContent.type || 'info' } : null,
    pendingSpellCraftData: pendingSpellCraftData || null,
    pendingSpellEditData: pendingSpellEditData || null,
    pendingItemCraftData: pendingItemCraftData || null,
    originalSpellForEdit: null, // This should come from props if needed
    maxRegisteredSpells,
    maxPreparedSpells,
    maxPreparedAbilities,
    useLegacyFooter,
    debugMode: debugMode || false,
    autoSave: autoSave !== undefined ? autoSave : true,
    showMessageModal,
    
    // Extract all the ViewRouter handlers from props
    onFindEnemy: (props as any).onFindEnemy,
    onExploreMap: (props as any).onExploreMap,
    onOpenResearchArchives: (props as any).onOpenResearchArchives,
    onOpenCamp: (props as any).onOpenCamp,
    onOpenHomestead: (props as any).onOpenHomestead,
    onAccessSettlement: (props as any).onAccessSettlement,
    onOpenNPCs: (props as any).onOpenNPCs,
    onNavigateToMultiplayer: (props as any).onOpenMultiplayer || (() => {}),
    onNavigateHome: onNavigateHome,
    onOpenCraftingHub: onOpenCraftingHub,
    onRestComplete: (props as any).onRestComplete,
    onStartHomesteadProject: (props as any).onStartHomesteadProject,
    onCompleteHomesteadProject: (props as any).onCompleteHomesteadProject,
    onUpgradeHomesteadProperty: (props as any).onUpgradeHomesteadProperty,
    onOpenShop: (props as any).onOpenShop,
    onOpenTavern: (props as any).onOpenTavern,
    onTalkToNPC: (props as any).onTalkToNPC,
    onExplorePointOfInterest: (props as any).onExplorePointOfInterest,
    onPurchaseItem: (props as any).onPurchaseItem,
    onPurchaseService: (props as any).onPurchaseService,
    onDiscoverRecipe: (props as any).onDiscoverRecipe,
    onCraftItem: (props as any).onCraftItem,
    onOpenSpellDesignStudio: onOpenSpellDesignStudio,
    onOpenTheorizeComponentLab: (props as any).onOpenTheorizeComponentLab,
    onAICreateComponent: (props as any).onAICreateComponent,
    onInitiateItemCraft: (props as any).onInitiateItemCraft,
    onFinalizeSpellDesign: (props as any).onFinalizeSpellDesign,
    onOldSpellCraftInitiation: (props as any).onOldSpellCraftInitiation,
    onInitiateSpellRefinement: (props as any).onInitiateSpellRefinement,
    onCraftTrait: (props as any).onCraftTrait,
    onSetTargetEnemy: (props as any).onSetTargetEnemy,
    onPlayerAttack: (props as any).onPlayerAttack,
    onPlayerBasicAttack: (props as any).onPlayerBasicAttack,
    onPlayerDefend: (props as any).onPlayerDefend,
    onPlayerFlee: (props as any).onPlayerFlee,
    onPlayerFreestyleAction: (props as any).onPlayerFreestyleAction,
    onUseConsumable: onUseConsumable,
    onUseAbility: (props as any).onUseAbility,
    onConfirmSpellCraft: (props as any).onConfirmSpellCraft,
    onConfirmSpellEdit: (props as any).onConfirmSpellEdit,
    onConfirmItemCraft: (props as any).onConfirmItemCraft,
    onCancelCrafting: (props as any).onCancelCrafting,
    onToggleLegacyFooter: (props as any).onToggleLegacyFooter,
    onToggleDebugMode: (props as any).onToggleDebugMode,
    onToggleAutoSave: (props as any).onToggleAutoSave,
    onSetGameState: (props as any).onSetGameState,
    onSetDefaultCharacterSheetTab: (props as any).onSetDefaultCharacterSheetTab,
    onOpenLootChest: onOpenLootChest,
    
    // Utility functions
    getPreparedSpells: (props as any).getPreparedSpells,
    getPreparedAbilities: (props as any).getPreparedAbilities,
    checkResources: (props as any).checkResources,
    renderResourceList: (props as any).renderResourceList,
  };

  return (
    <>
      <MainLayout
        player={player}
        effectivePlayerStats={effectivePlayerStats}
        gameState={gameState}
        onOpenCharacterSheet={() => onOpenCharacterSheet('Main')}
        onNavigateHome={onNavigateHome}
        onOpenMobileMenu={onOpenMobileMenu}
        onOpenSpellbook={() => onOpenCharacterSheet('Spells')}
        onOpenCraftingHub={onOpenCraftingHub}
        onOpenInventory={() => onOpenCharacterSheet('Inventory')}
        onOpenTraitsPage={() => onOpenCharacterSheet('Traits')}
        onOpenQuestsPage={() => onOpenCharacterSheet('Quests')}
        onOpenEncyclopedia={() => onOpenCharacterSheet('Encyclopedia')}
        onOpenGameMenu={onOpenGameMenu}
        isInCombatButNotOnCombatScreen={isInCombatButNotOnCombatScreen}
        isInAnyCombat={isInAnyCombat}
        onReturnToCombat={onReturnToCombat}
      >
        <ViewRouter {...routerProps} />
      </MainLayout>

      {/* Main Modal */}
      {modalContent && (
        <Modal 
          isOpen={true} 
          onClose={onCloseModal} 
          title={modalContent.title} 
          size="md"
        >
          <p>{modalContent.message}</p>
        </Modal>
      )}

      {/* Character Sheet Modal */}
      {gameState === 'CHARACTER_SHEET' && (
        <CharacterSheetModal 
          isOpen={true} 
          onClose={onCloseCharacterSheet} 
          player={player} 
          effectiveStats={effectivePlayerStats} 
          onEquipItem={onEquipItem} 
          onUnequipItem={onUnequipItem} 
          maxRegisteredSpells={maxRegisteredSpells} 
          maxPreparedSpells={maxPreparedSpells} 
          maxPreparedAbilities={maxPreparedAbilities} 
          onEditSpell={onEditSpell} 
          onPrepareSpell={onPrepareSpell} 
          onUnprepareSpell={onUnprepareSpell} 
          onPrepareAbility={onPrepareAbility} 
          onUnprepareAbility={onUnprepareAbility} 
          initialTab={defaultCharacterSheetTab} 
          onOpenSpellCraftingScreen={() => {
            onCloseCharacterSheet(); 
            setTimeout(() => onOpenSpellDesignStudio(), 0);
          }} 
          onOpenTraitCraftingScreen={() => {
            onCloseCharacterSheet(); 
            setTimeout(() => onOpenTraitsPage(), 0);
          }} 
          canCraftNewTrait={canCraftNewTrait} 
          onOpenLootChest={onOpenLootChest} 
          onUseConsumableFromInventory={onUseConsumable}
        />
      )}

      {/* Help Wiki Modal */}
      <HelpWikiModal 
        isOpen={isHelpWikiOpen} 
        onClose={onCloseHelpWiki} 
      />

      {/* Game Menu Modal */}
      <GameMenuModal 
        isOpen={isGameMenuOpen} 
        onClose={onCloseGameMenu} 
        onOpenCharacterSheet={() => onOpenCharacterSheet('Main')} 
        onOpenHelpWiki={onOpenHelpWiki} 
        onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        onExportSave={onExportSave} 
        onImportSave={onImportSave} 
        onOpenParameters={onOpenParameters}
      />

      {/* Mobile Menu Modal */}
      <MobileMenuModal 
        isOpen={isMobileMenuOpen} 
        onClose={onCloseMobileMenu}
        onOpenSpellbook={() => {
          onOpenCharacterSheet('Spells'); 
          onCloseMobileMenu();
        }}
        onOpenCraftingHub={() => {
          onOpenCraftingHub(); 
          onCloseMobileMenu();
        }}
        onOpenInventory={() => {
          onOpenCharacterSheet('Inventory'); 
          onCloseMobileMenu();
        }}
        onOpenTraitsPage={() => {
          onOpenCharacterSheet('Traits'); 
          onCloseMobileMenu();
        }}
        onOpenQuestsPage={() => {
          onOpenCharacterSheet('Quests'); 
          onCloseMobileMenu();
        }}
        onOpenEncyclopedia={() => {
          onOpenCharacterSheet('Encyclopedia'); 
          onCloseMobileMenu();
        }}
        onOpenGameOptions={() => {
          onOpenGameMenu(); 
          onCloseMobileMenu();
        }}
      />
    </>
  );
};

export default AppShell; 