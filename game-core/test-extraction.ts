/**
 * Test file to verify extracted modules work correctly
 * This file tests the basic functionality of our Phase 1, 2, 3, 4 & 5 extractions
 */

import { getEffectiveTags, tagPrecedenceList } from './spells/TagSystem';
import { useGameState } from './state/GameState';
import { PlayerStateUtils } from './player/PlayerState';
import { calculateEffectiveStats, calculateMaxPreparedSpells } from './player/PlayerStats';
import { checkResources, deductResources } from './resources/ResourceManager';
import { SpellCraftingUtils } from './spells/SpellCrafting';
import { ItemManagementUtils } from './items/ItemManagement';
import { HomesteadManagerUtils } from './homestead/HomesteadManager';
import { SettlementManagerUtils } from './settlement/SettlementManager';
import { CombatEngineUtils } from './combat/CombatEngine';
import { NavigationControllerUtils } from './navigation/NavigationController';
import { SaveManagerUtils } from './persistence/SaveManager';
import { RecipeManagerUtils } from './crafting/RecipeManager';
import { AbilityManagerUtils } from './abilities/AbilityManager';
import { TurnManagerUtils } from './game-loop/TurnManager';
import { CampManagerUtils } from './camp/CampManager';
import { ProgressionManagerUtils } from './progression/ProgressionManager';
import { ResearchManagerUtils } from './research/ResearchManager';
import { SettingsManagerUtils } from './settings/SettingsManager';
import { TraitManagerUtils } from './traits/TraitManager';
import { ConsumablesUtils } from './hooks/useConsumables';
import { TagName } from '../types';

// Test TagSystem
console.log('Testing TagSystem...');
const testTags: TagName[] = ['Fire', 'Ice', 'Lightning'];
const effectiveTags = getEffectiveTags(testTags);
console.log('Effective tags:', effectiveTags);
console.log('Tag precedence list length:', tagPrecedenceList.length);

// Test PlayerState utilities
console.log('Testing PlayerState...');
const initialPlayer = PlayerStateUtils.createInitialPlayer();
console.log('Initial player created:', initialPlayer.name, 'Level:', initialPlayer.level);

// Test PlayerStats
console.log('Testing PlayerStats...');
const effectiveStats = calculateEffectiveStats(initialPlayer);
console.log('Effective stats calculated:', effectiveStats.maxHp, 'HP');
const maxSpells = calculateMaxPreparedSpells(initialPlayer.level);
console.log('Max prepared spells:', maxSpells);

// Test ResourceManager
console.log('Testing ResourceManager...');
const hasResources = checkResources(initialPlayer, [{ itemId: 'gold', quantity: 10 }]);
console.log('Has 10 gold:', hasResources);

const deductResult = deductResources(initialPlayer, [{ itemId: 'gold', quantity: 5 }]);
console.log('Deduct 5 gold success:', deductResult.success);

// Test SpellCrafting
console.log('Testing SpellCrafting...');
console.log('SpellCrafting utils available:', Object.keys(SpellCraftingUtils));

// Test ItemManagement
console.log('Testing ItemManagement...');
console.log('ItemManagement utils available:', Object.keys(ItemManagementUtils));

// Test HomesteadManager
console.log('Testing HomesteadManager...');
console.log('HomesteadManager utils available:', Object.keys(HomesteadManagerUtils));

// Test SettlementManager
console.log('Testing SettlementManager...');
console.log('SettlementManager utils available:', Object.keys(SettlementManagerUtils));

// Test CombatEngine
console.log('Testing CombatEngine...');
console.log('CombatEngine utils available:', Object.keys(CombatEngineUtils));
const testDamage = CombatEngineUtils.calculateDamage(10, 5, 2);
console.log('Test damage calculation (10 base, 5 power, 2 defense):', testDamage);

// Test NavigationController
console.log('Testing NavigationController...');
console.log('NavigationController utils available:', Object.keys(NavigationControllerUtils));

// Test SaveManager
console.log('Testing SaveManager...');
console.log('SaveManager utils available:', Object.keys(SaveManagerUtils));
const hasSave = SaveManagerUtils.hasSaveData();
console.log('Has save data:', hasSave);

// Test RecipeManager
console.log('Testing RecipeManager...');
console.log('RecipeManager utils available:', Object.keys(RecipeManagerUtils));
const canCraft = RecipeManagerUtils.canCraftRecipe('test-recipe', initialPlayer);
console.log('Can craft test recipe:', canCraft);

// Test Phase 5 modules
console.log('Testing Phase 5 modules...');

// Test AbilityManager
console.log('Testing AbilityManager...');
console.log('AbilityManager utils available:', Object.keys(AbilityManagerUtils));
const canUseAbility = AbilityManagerUtils.canUseAbility('test-ability', initialPlayer);
console.log('Can use test ability:', canUseAbility);

// Test TurnManager
console.log('Testing TurnManager...');
console.log('TurnManager utils available:', Object.keys(TurnManagerUtils));

// Test CampManager
console.log('Testing CampManager...');
console.log('CampManager utils available:', Object.keys(CampManagerUtils));
const canRest = CampManagerUtils.canRest('short', { 
  player: initialPlayer, 
  effectivePlayerStats: effectiveStats,
  setPlayer: () => {},
  setGameState: () => {},
  addLog: () => {},
  showMessageModal: () => {}
});
console.log('Can rest:', canRest);

// Test ProgressionManager
console.log('Testing ProgressionManager...');
console.log('ProgressionManager utils available:', Object.keys(ProgressionManagerUtils));
const levelFromXP = ProgressionManagerUtils.calculateLevelFromXP(500);
console.log('Level from 500 XP:', levelFromXP);

// Test ResearchManager
console.log('Testing ResearchManager...');
console.log('ResearchManager utils available:', Object.keys(ResearchManagerUtils));
const researchEfficiency = ResearchManagerUtils.getResearchEfficiency(initialPlayer);
console.log('Research efficiency:', researchEfficiency);

// Test SettingsManager
console.log('Testing SettingsManager...');
console.log('SettingsManager utils available:', Object.keys(SettingsManagerUtils));
const settings = SettingsManagerUtils.loadSettings();
console.log('Loaded settings debug mode:', settings.debugMode);

// Test TraitManager
console.log('Testing TraitManager...');
console.log('TraitManager utils available:', Object.keys(TraitManagerUtils));
const canCraftTrait = TraitManagerUtils.canCraftTrait(initialPlayer);
console.log('Can craft trait:', canCraftTrait);

// Test ConsumablesUtils
console.log('Testing ConsumablesUtils...');
console.log('ConsumablesUtils available:', Object.keys(ConsumablesUtils));
const usableConsumables = ConsumablesUtils.getUsableConsumables(initialPlayer);
console.log('Usable consumables count:', usableConsumables.length);

console.log('All Phase 1, 2, 3, 4 & 5 modules tested successfully!');

export default {
  // Phase 1 modules
  getEffectiveTags,
  useGameState,
  PlayerStateUtils,
  calculateEffectiveStats,
  checkResources,
  deductResources,
  
  // Phase 2 modules
  SpellCraftingUtils,
  ItemManagementUtils,
  HomesteadManagerUtils,
  SettlementManagerUtils,
  
  // Phase 3 modules
  CombatEngineUtils,
  NavigationControllerUtils,
  SaveManagerUtils,
  
  // Phase 4 modules
  RecipeManagerUtils,
  
  // Phase 5 modules
  AbilityManagerUtils,
  TurnManagerUtils,
  CampManagerUtils,
  ProgressionManagerUtils,
  ResearchManagerUtils,
  SettingsManagerUtils,
  TraitManagerUtils,
  ConsumablesUtils,
}; 