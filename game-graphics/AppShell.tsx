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
  modalContent: { title: string; message: string } | null;
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
    
    // All other props for ViewRouter
    ...viewRouterProps
  } = props;

  // Calculate if player can craft new trait
  const canCraftNewTrait = pendingTraitUnlock || (
    player.level >= FIRST_TRAIT_LEVEL && 
    player.traits.length < (Math.floor((player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1)
  );

  // Prepare ViewRouter props
  const routerProps = {
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
    modalContent,
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
    ...viewRouterProps
  };

  return (
    <>
      <MainLayout
        player={player}
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
        useLegacyFooter={useLegacyFooter}
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