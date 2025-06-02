import React from 'react';
import { Player, PlayerEffectiveStats, Enemy, CombatActionLog, CharacterSheetTab, GeneratedSpellData, GeneratedConsumableData, GeneratedEquipmentData, Spell, ItemType, ResourceCost, SpellComponent } from '../types';
import { HomesteadProject } from '../src/types';

// Import all view components
import MultiplayerView from '../src/components/MultiplayerView';
import HomeScreenView from '../src/components/HomeScreenView';
import CampView from '../src/CampView';
import HomesteadView from '../src/components/HomesteadView';
import SettlementView from '../src/components/SettlementView';
import ShopView from '../src/components/ShopView';
import NPCsView from '../src/components/NPCsView';
import QuestBookView from '../src/components/QuestBookView';
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
import ManageSpellsScreen from '../src/components/ManageSpellsScreen';
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
  onOpenQuestBook: () => void;
  onNavigateToMultiplayer: () => void;
  onNavigateHome: () => void;
  onReturnToCombat: () => void;
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
  getPreparedAbilities: () => any[];
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
    onOpenQuestBook,
    onNavigateToMultiplayer,
    onNavigateHome,
    onReturnToCombat,
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
          onRestComplete={onRestComplete}
          onOpenHomestead={onOpenHomestead} 
          onAccessSettlement={onAccessSettlement} 
          onOpenCraftingHub={onOpenCraftingHub} 
          onOpenNPCs={onOpenNPCs} 
          onOpenQuestBook={onOpenQuestBook}
          onNavigateToMultiplayer={onNavigateToMultiplayer}
          onReturnToCombat={onReturnToCombat}
          currentEnemies={currentEnemies}
        />
      );

    case 'QUEST_BOOK':
      return (
        <QuestBookView 
          player={player}
          onReturnHome={onNavigateHome}
          onShowMessage={(t,m) => showMessageModal(t,m,'info')}
        />
      );

    case 'CAMP': 
      return (
        <CampView 
          player={player} 
          effectiveStats={effectivePlayerStats} 
          onReturnHome={onNavigateHome} 
          onRestComplete={onRestComplete} 
          currentEnemies={currentEnemies}
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
          onCancel={onNavigateHome}
          player={player}
          availableComponents={player.discoveredComponents}
        />
      ) : (
        <div>No spell selected for editing</div>
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

    case 'MANAGE_SPELLS': 
      return (
        <ManageSpellsScreen 
          player={player}
          setPlayer={() => {}} // This needs to be properly implemented
          maxPreparedSpells={maxPreparedSpells} 
          onReturnHome={onNavigateHome}
          onEditSpell={() => {}} // This needs to be properly implemented
        />
      );

    case 'IN_COMBAT': 
      return (
        <CombatView 
          player={player} 
          effectivePlayerStats={effectivePlayerStats} 
          currentEnemies={currentEnemies} 
          targetEnemyId={targetEnemyId} 
          onSetTargetEnemy={(id: string) => onSetTargetEnemy(id)}
          preparedSpells={getPreparedSpells()}
          onPlayerAttack={onPlayerAttack}
          onPlayerBasicAttack={onPlayerBasicAttack}
          onPlayerDefend={onPlayerDefend}
          onPlayerFlee={onPlayerFlee}
          onPlayerFreestyleAction={onPlayerFreestyleAction}
          combatLog={combatLog}
          isPlayerTurn={isPlayerTurn}
          playerActionSkippedByStun={playerActionSkippedByStun}
          onSetGameState={(state: any) => onSetGameState(state)}
          onUseConsumable={onUseConsumable}
          onUseAbility={onUseAbility}
          consumables={[]} // This needs to be properly implemented
          abilities={getPreparedAbilities()}
        />
      );

    case 'SPELL_CRAFT_CONFIRMATION': 
      return pendingSpellCraftData ? (
        <ConfirmationView 
          gameState="SPELL_CRAFT_CONFIRMATION"
          pendingSpellCraftData={pendingSpellCraftData}
          pendingSpellEditData={null}
          originalSpellForEdit={null}
          pendingItemCraftData={null}
          onConfirm={onConfirmSpellCraft} 
          onCancel={onCancelCrafting} 
          checkResources={checkResources} 
          renderResourceList={renderResourceList}
          isLoading={isLoading}
        />
      ) : (
        <div>No spell craft data available</div>
      );

    case 'SPELL_EDIT_CONFIRMATION': 
      return pendingSpellEditData ? (
        <ConfirmationView 
          gameState="SPELL_EDIT_CONFIRMATION"
          pendingSpellCraftData={null}
          pendingSpellEditData={pendingSpellEditData}
          originalSpellForEdit={originalSpellForEdit}
          pendingItemCraftData={null}
          onConfirm={onConfirmSpellEdit} 
          onCancel={onCancelCrafting} 
          checkResources={checkResources} 
          renderResourceList={renderResourceList}
          isLoading={isLoading}
        />
      ) : (
        <div>No spell edit data available</div>
      );

    case 'ITEM_CRAFT_CONFIRMATION': 
      return pendingItemCraftData ? (
        <ConfirmationView 
          gameState="ITEM_CRAFT_CONFIRMATION"
          pendingSpellCraftData={null}
          pendingSpellEditData={null}
          originalSpellForEdit={null}
          pendingItemCraftData={pendingItemCraftData}
          onConfirm={onConfirmItemCraft} 
          onCancel={onCancelCrafting} 
          checkResources={checkResources} 
          renderResourceList={renderResourceList}
          isLoading={isLoading}
        />
      ) : (
        <div>No item craft data available</div>
      );

    case 'GAME_OVER_VICTORY': 
      return (
        <GameOverView 
          gameState="GAME_OVER_VICTORY"
          modalMessage={undefined}
          currentEnemy={currentEnemies[0] || null}
          combatLog={combatLog}
          onReturnHome={onNavigateHome}
          onFindEnemy={onFindEnemy}
          isLoading={isLoading}
          currentEnemies={currentEnemies}
        />
      );

    case 'GAME_OVER_DEFEAT': 
      return (
        <GameOverView 
          gameState="GAME_OVER_DEFEAT"
          modalMessage={undefined}
          currentEnemy={currentEnemies[0] || null}
          combatLog={combatLog}
          onReturnHome={onNavigateHome}
          onFindEnemy={onFindEnemy}
          isLoading={isLoading}
          currentEnemies={currentEnemies}
        />
      );

    case 'MULTIPLAYER_VIEW': 
      return <MultiplayerView />;

    default: 
      return <p>Unknown game state: {gameState}</p>;
  }
};

export default ViewRouter; 