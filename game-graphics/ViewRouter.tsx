import React from 'react';
import { 
  Player, 
  Enemy, 
  PlayerEffectiveStats, 
  CombatActionLog, 
  CharacterSheetTab,
  Spell,
  Ability,
  Consumable,
  ResourceCost,
  GeneratedSpellData,
  ItemType,
  SpellComponent,
  GeneratedConsumableData,
  GeneratedEquipmentData
} from '../types';
import { HomesteadProject } from '../src/types';

// Import all view components
import MultiplayerView from '../src/components/MultiplayerView';
import HomeScreenView from '../src/components/HomeScreenView';
import CampView from '../src/CampView';
import HomesteadView from '../src/components/HomesteadView';
import SettlementView from '../src/components/SettlementView';
import ShopView from '../src/components/ShopView';
import NPCsView from '../src/components/NPCsView';
import RecipeDiscoveryView from '../src/components/RecipeDiscoveryView';
import CraftingWorkshopView from '../src/components/CraftingWorkshopView';
import SpellCraftingView from '../src/components/SpellCraftingView';
import SpellDesignStudioView from '../src/components/SpellDesignStudioView';
import ResearchLabView from '../src/components/ResearchLabView';
import ResearchView from '../src/components/ResearchView';
import MapView from '../src/components/MapView';
import ParametersView from '../src/components/ParametersView';
import SpellEditingView from '../src/components/SpellEditingView';
import TraitCraftingView from '../src/components/TraitCraftingView';
import CombatView from '../src/components/CombatView';
import ConfirmationView from '../src/components/ConfirmationView';
import GameOverView from '../src/components/GameOverView';
import LoadingSpinner from '../src/components/LoadingSpinner';

/**
 * View Router Component
 * Handles rendering of different game views based on current game state
 */

export interface ViewRouterProps {
  // Game state
  gameState: string;
  isLoading: boolean;
  
  // Player data
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  
  // Combat data
  currentEnemies: Enemy[];
  targetEnemyId: string | null;
  combatLog: CombatActionLog[];
  isPlayerTurn: boolean;
  playerActionSkippedByStun: boolean;
  
  // UI state
  defaultCharacterSheetTab: CharacterSheetTab | undefined;
  initialSpellPromptForStudio: string;
  currentShopId: string | null;
  modalContent: { title: string; message: string; type: 'info' | 'error' | 'success' } | null;
  
  // Pending data
  pendingSpellCraftData: (GeneratedSpellData & { _componentUsageGoldCost?: number, _componentUsageEssenceCost?: number }) | null;
  pendingSpellEditData: GeneratedSpellData | null;
  pendingItemCraftData: GeneratedConsumableData | GeneratedEquipmentData | null;
  originalSpellForEdit: Spell | null;
  
  // Calculated values
  maxRegisteredSpells: number;
  maxPreparedSpells: number;
  maxPreparedAbilities: number;
  useLegacyFooter: boolean;
  debugMode: boolean;
  autoSave: boolean;
  
  // Event handlers
  onFindEnemy: () => Promise<void>;
  onExploreMap: () => void;
  onOpenResearchArchives: () => void;
  onOpenCamp: () => void;
  onOpenHomestead: () => void;
  onAccessSettlement: () => void;
  onOpenCraftingHub: () => void;
  onOpenNPCs: () => void;
  onNavigateToMultiplayer: () => void; // Add this line
  onNavigateHome: () => void;
  onRestComplete: (restType: 'short' | 'long', duration?: number, activity?: string) => void;
  onStartHomesteadProject: (project: Omit<HomesteadProject, 'id' | 'startTime'>) => void;
  onCompleteHomesteadProject: (projectId: string) => void;
  onUpgradeHomesteadProperty: (propertyName: string, upgradeName: string) => void;
  onOpenShop: (shopId: string) => void;
  onOpenTavern: (tavernId: string) => void;
  onTalkToNPC: (npcId: string) => void;
  onExplorePointOfInterest: (poiId: string) => void;
  onPurchaseItem: (itemId: string, price: number, quantity: number) => void;
  onPurchaseService: (serviceId: string, price: number) => void;
  onDiscoverRecipe: (prompt: string) => Promise<void>;
  onCraftItem: (recipeId: string) => Promise<void>;
  onOpenSpellDesignStudio: (initialPrompt?: string) => void;
  onOpenTheorizeComponentLab: () => void;
  onAICreateComponent: (prompt: string, goldInvested: number, essenceInvested: number) => Promise<SpellComponent | null>;
  onInitiateItemCraft: (promptText: string, itemType: ItemType) => Promise<void>;
  onFinalizeSpellDesign: (designData: any) => Promise<void>;
  onOldSpellCraftInitiation: (promptText: string) => Promise<void>;
  onInitiateSpellRefinement: (originalSpell: Spell, refinementPrompt: string, augmentLevel?: number, selectedComponentId?: string) => Promise<void>;
  onCraftTrait: (promptText: string) => Promise<void>;
  onSetTargetEnemy: (id: string | null) => void;
  onPlayerAttack: (spell: Spell, targetId: string) => void;
  onPlayerBasicAttack: (targetId: string) => void;
  onPlayerDefend: () => void;
  onPlayerFlee: () => void;
  onPlayerFreestyleAction: (actionText: string, targetId: string | null) => Promise<void>;
  onUseConsumable: (itemId: string, targetId: string | null) => void;
  onUseAbility: (abilityId: string, targetId: string | null) => void;
  onConfirmSpellCraft: () => void;
  onConfirmSpellEdit: () => void;
  onConfirmItemCraft: () => void;
  onCancelCrafting: () => void;
  onToggleLegacyFooter: (value: boolean) => void;
  onToggleDebugMode: (value: boolean) => void;
  onToggleAutoSave: (value: boolean) => void;
  onSetGameState: (state: string) => void;
  onSetDefaultCharacterSheetTab: (tab: CharacterSheetTab) => void;
  onOpenLootChest: (chestId: string) => Promise<void>;
  
  // Utility functions
  getPreparedSpells: () => Spell[];
  getPreparedAbilities: () => Ability[];
  checkResources: (costs?: ResourceCost[]) => boolean;
  renderResourceList: (costs?: ResourceCost[]) => React.ReactNode;
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

const ViewRouter: React.FC<ViewRouterProps> = (props) => {
  const {
    gameState,
    isLoading,
    player,
    effectivePlayerStats,
    currentEnemies,
    targetEnemyId,
    combatLog,
    isPlayerTurn,
    playerActionSkippedByStun,
    initialSpellPromptForStudio,
    currentShopId,
    pendingSpellCraftData,
    pendingSpellEditData,
    pendingItemCraftData,
    originalSpellForEdit,
    maxRegisteredSpells,
    maxPreparedSpells,
    maxPreparedAbilities,
    useLegacyFooter,
    debugMode,
    autoSave,
    onFindEnemy,
    onExploreMap,
    onOpenResearchArchives,
    onOpenCamp,
    onOpenHomestead,
    onAccessSettlement,
    onOpenCraftingHub,
    onOpenNPCs,
    onNavigateToMultiplayer, // Add this line
    onNavigateHome,
    onRestComplete,
    onStartHomesteadProject,
    onCompleteHomesteadProject,
    onUpgradeHomesteadProperty,
    onOpenShop,
    onOpenTavern,
    onTalkToNPC,
    onExplorePointOfInterest,
    onPurchaseItem,
    onPurchaseService,
    onDiscoverRecipe,
    onCraftItem,
    onOpenSpellDesignStudio,
    onOpenTheorizeComponentLab,
    onAICreateComponent,
    onInitiateItemCraft,
    onFinalizeSpellDesign,
    onOldSpellCraftInitiation,
    onInitiateSpellRefinement,
    onCraftTrait,
    onSetTargetEnemy,
    onPlayerAttack,
    onPlayerBasicAttack,
    onPlayerDefend,
    onPlayerFlee,
    onPlayerFreestyleAction,
    onUseConsumable,
    onUseAbility,
    onConfirmSpellCraft,
    onConfirmSpellEdit,
    onConfirmItemCraft,
    onCancelCrafting,
    onToggleLegacyFooter,
    onToggleDebugMode,
    onToggleAutoSave,
    onSetGameState,
    onSetDefaultCharacterSheetTab,
    onOpenLootChest,
    getPreparedSpells,
    getPreparedAbilities,
    checkResources,
    renderResourceList,
    showMessageModal
  } = props;

  // Show loading spinner for certain states
  if (isLoading && gameState !== 'IN_COMBAT' && gameState !== 'HOME' && gameState !== 'SPELL_DESIGN_STUDIO' && gameState !== 'THEORIZE_COMPONENT' && gameState !== 'RESEARCH_ARCHIVES') { 
    return <div className="flex justify-center items-center h-64"><LoadingSpinner text="Loading..." size="lg"/></div>;
  }

  switch (gameState) {
    case 'HOME': 
      return (
        <HomeScreenView 
          player={player} 
          effectiveStats={effectivePlayerStats}
          onFindEnemy={onFindEnemy} 
          isLoading={isLoading} 
          onExploreMap={onExploreMap} 
          onOpenResearchArchives={onOpenResearchArchives} 
          onOpenCamp={onOpenCamp} 
          onOpenHomestead={onOpenHomestead} 
          onAccessSettlement={onAccessSettlement} 
          onOpenCraftingHub={onOpenCraftingHub} 
          onOpenNPCs={onOpenNPCs} 
          onNavigateToMultiplayer={onNavigateToMultiplayer} // Add this line
        />
      );

    case 'CAMP': 
      return (
        <CampView 
          player={player} 
          effectiveStats={effectivePlayerStats} 
          onReturnHome={onNavigateHome} 
          onRestComplete={onRestComplete} 
        />
      );

    case 'HOMESTEAD_VIEW': 
      return (
        <HomesteadView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onStartProject={onStartHomesteadProject} 
          onCompleteProject={onCompleteHomesteadProject} 
          onUpgradeProperty={onUpgradeHomesteadProperty} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'SETTLEMENT_VIEW': 
      return (
        <SettlementView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onOpenShop={onOpenShop} 
          onOpenTavern={onOpenTavern} 
          onTalkToNPC={onTalkToNPC} 
          onExplorePointOfInterest={onExplorePointOfInterest} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'SHOP_VIEW': 
      return (
        <ShopView 
          player={player} 
          shopId={currentShopId || ''} 
          onReturnToSettlement={() => onSetGameState('SETTLEMENT_VIEW')} 
          onPurchaseItem={onPurchaseItem} 
          onPurchaseService={onPurchaseService} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'TAVERN_VIEW': 
      return <div>Tavern View - Coming Soon</div>;

    case 'NPC_DIALOGUE': 
      return (
        <NPCsView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onTalkToNPC={onTalkToNPC} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'RECIPE_DISCOVERY': 
      return (
        <RecipeDiscoveryView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onDiscoverRecipe={onDiscoverRecipe} 
          isLoading={isLoading} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'CRAFTING_WORKSHOP': 
      return (
        <CraftingWorkshopView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onCraftItem={onCraftItem} 
          onDiscoverRecipe={onDiscoverRecipe} 
          onOpenSpellDesignStudio={onOpenSpellDesignStudio} 
          onOpenTheorizeLab={onOpenTheorizeComponentLab} 
          onAICreateComponent={onAICreateComponent} 
          onInitiateAppItemCraft={onInitiateItemCraft} 
          isLoading={isLoading} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'SPELL_CRAFTING': 
      return (
        <SpellCraftingView 
          onInitiateSpellCraft={onOldSpellCraftInitiation} 
          isLoading={isLoading} 
          currentSpells={player.spells.length} 
          maxSpells={maxRegisteredSpells} 
          onReturnHome={onNavigateHome} 
        />
      );

    case 'SPELL_DESIGN_STUDIO': 
      return (
        <SpellDesignStudioView 
          player={player} 
          availableComponents={player.discoveredComponents} 
          onFinalizeDesign={onFinalizeSpellDesign} 
          isLoading={isLoading} 
          onReturnHome={onNavigateHome} 
          maxSpells={maxRegisteredSpells} 
          initialPrompt={initialSpellPromptForStudio}
        />
      );

    case 'THEORIZE_COMPONENT': 
      return (
        <ResearchLabView 
          player={player} 
          onAICreateComponent={onAICreateComponent} 
          isLoading={isLoading} 
          onReturnHome={() => onSetGameState('RESEARCH_ARCHIVES')}
        />
      );

    case 'RESEARCH_ARCHIVES': 
      return (
        <ResearchView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onOpenTheorizeLab={onOpenTheorizeComponentLab} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'EXPLORING_MAP': 
      return (
        <MapView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    case 'PARAMETERS': 
      return (
        <ParametersView 
          onReturnHome={onNavigateHome} 
          useLegacyFooter={useLegacyFooter} 
          onToggleLegacyFooter={onToggleLegacyFooter} 
          debugMode={debugMode} 
          onToggleDebugMode={onToggleDebugMode} 
          autoSave={autoSave} 
          onToggleAutoSave={onToggleAutoSave} 
        />
      );

    case 'SPELL_EDITING': 
      return originalSpellForEdit ? (
        <SpellEditingView 
          originalSpell={originalSpellForEdit} 
          onInitiateSpellRefinement={onInitiateSpellRefinement} 
          isLoading={isLoading} 
          onCancel={() => { 
            onSetGameState('CHARACTER_SHEET'); 
            onSetDefaultCharacterSheetTab('Spells');
          }} 
          player={player} 
          availableComponents={player.discoveredComponents}
        />
      ) : (
        <p>Error: No spell selected for editing.</p>
      );

    case 'TRAIT_CRAFTING': 
      return (
        <TraitCraftingView 
          onCraftTrait={onCraftTrait} 
          isLoading={isLoading} 
          currentTraits={player.traits.length} 
          playerLevel={player.level} 
          onReturnHome={onNavigateHome} 
        />
      );

    case 'IN_COMBAT': 
      return (
        <CombatView 
          player={player} 
          effectivePlayerStats={effectivePlayerStats} 
          currentEnemies={currentEnemies} 
          targetEnemyId={targetEnemyId} 
          onSetTargetEnemy={onSetTargetEnemy} 
          preparedSpells={getPreparedSpells()} 
          onPlayerAttack={onPlayerAttack} 
          onPlayerBasicAttack={onPlayerBasicAttack} 
          onPlayerDefend={onPlayerDefend} 
          onPlayerFlee={onPlayerFlee} 
          onPlayerFreestyleAction={onPlayerFreestyleAction} 
          combatLog={combatLog} 
          isPlayerTurn={isPlayerTurn} 
          playerActionSkippedByStun={playerActionSkippedByStun} 
          onSetGameState={onSetGameState} 
          onUseConsumable={onUseConsumable} 
          onUseAbility={onUseAbility} 
          consumables={player.items.filter(i => i.itemType === 'Consumable') as Consumable[]} 
          abilities={getPreparedAbilities()} 
        />
      );

    case 'SPELL_CRAFT_CONFIRMATION': 
    case 'SPELL_EDIT_CONFIRMATION': 
    case 'ITEM_CRAFT_CONFIRMATION':
      return (
        <ConfirmationView 
          gameState={gameState} 
          pendingSpellCraftData={pendingSpellCraftData} 
          pendingSpellEditData={pendingSpellEditData} 
          originalSpellForEdit={originalSpellForEdit} 
          pendingItemCraftData={pendingItemCraftData} 
          onConfirm={gameState === 'SPELL_CRAFT_CONFIRMATION' ? onConfirmSpellCraft : gameState === 'SPELL_EDIT_CONFIRMATION' ? onConfirmSpellEdit : onConfirmItemCraft} 
          onCancel={onCancelCrafting} 
          checkResources={checkResources} 
          renderResourceList={renderResourceList} 
          isLoading={isLoading}
        />
      );

    case 'GAME_OVER_VICTORY': 
    case 'GAME_OVER_DEFEAT': 
      return (
        <GameOverView 
          gameState={gameState} 
          modalMessage={props.modalContent?.message} 
          currentEnemy={currentEnemies.length > 0 ? currentEnemies[0] : null} 
          combatLog={combatLog} 
          onReturnHome={onNavigateHome} 
          onFindEnemy={onFindEnemy} 
          isLoading={isLoading}
        />
      );

    case 'MULTIPLAYER_VIEW': // Add this new case
      return (
        <MultiplayerView />
      );
      
    // Deprecated states, should ideally not be reached if navigation is correct
    case 'RESEARCH_LAB': 
      return (
        <ResearchLabView 
          player={player} 
          onAICreateComponent={onAICreateComponent} 
          isLoading={isLoading} 
          onReturnHome={() => onSetGameState('CRAFTING_WORKSHOP')}
        />
      );

    case 'GENERAL_RESEARCH': 
      return (
        <ResearchView 
          player={player} 
          onReturnHome={onNavigateHome} 
          onOpenTheorizeLab={onOpenTheorizeComponentLab} 
          onShowMessage={(t,m) => showMessageModal(t,m,'info')} 
        />
      );

    default: 
      return <p>Unknown game state: {gameState}</p>;
  }
};

export default ViewRouter; 