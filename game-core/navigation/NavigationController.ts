import { 
  Player, 
  CharacterSheetTab, 
  PlayerEffectiveStats,
  Enemy,
  CombatActionLog
} from '../../types';
import { 
  FIRST_TRAIT_LEVEL, 
  TRAIT_LEVEL_INTERVAL 
} from '../../constants';

/**
 * Navigation Controller Module
 * Handles all game state navigation and view transitions
 */

export interface NavigationContext {
  player: Player;
  effectivePlayerStats: PlayerEffectiveStats;
  pendingTraitUnlock: boolean;
  setGameState: (state: string) => void; // TODO: Change to GameState type
  setDefaultCharacterSheetTab: (tab: CharacterSheetTab | undefined) => void;
  setInitialSpellPromptForStudio: (prompt: string) => void;
  setIsHelpWikiOpen: (open: boolean) => void;
  setIsGameMenuOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentEnemies: Enemy[]; // Added for checking active battle
  setCurrentEnemies: (enemies: Enemy[]) => void;
  setTargetEnemyId: (id: string | null) => void;
  setCombatLog: (log: CombatActionLog[]) => void;
  setModalContent: (content: { title: string; message: string; type: 'info' | 'error' | 'success' } | null) => void;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setUseLegacyFooter: (value: boolean) => void;
  setDebugMode: (value: boolean) => void;
  setAutoSave: (value: boolean) => void;
  gameState: string;
}

export interface RestResult {
  hpGain: number;
  mpGain: number;
  epGain: number;
  bonusMessage: string;
}

/**
 * Navigate to inventory view
 * @param context - Navigation context
 */
export const navigateToInventory = (context: NavigationContext): void => {
  context.setDefaultCharacterSheetTab('Inventory');
  context.setGameState('CHARACTER_SHEET');
};

/**
 * Navigate to spellbook view
 * @param context - Navigation context
 */
export const navigateToSpellbook = (context: NavigationContext): void => {
  context.setDefaultCharacterSheetTab('Spells');
  context.setGameState('CHARACTER_SHEET');
};

/**
 * Navigate to crafting hub
 * @param context - Navigation context
 */
export const navigateToCraftingHub = (context: NavigationContext): void => {
  context.setGameState('CRAFTING_WORKSHOP');
};

/**
 * Navigate to recipe discovery
 * @param context - Navigation context
 */
export const navigateToRecipeDiscovery = (context: NavigationContext): void => {
  context.setGameState('RECIPE_DISCOVERY');
};

/**
 * Navigate to crafting workshop
 * @param context - Navigation context
 */
export const navigateToCraftingWorkshop = (context: NavigationContext): void => {
  context.setGameState('CRAFTING_WORKSHOP');
};

/**
 * Navigate to spell design studio
 * @param context - Navigation context
 * @param initialPrompt - Optional initial prompt for spell creation
 */
export const navigateToSpellDesignStudio = (context: NavigationContext, initialPrompt?: string): void => {
  context.setInitialSpellPromptForStudio(initialPrompt || '');
  context.setGameState('SPELL_DESIGN_STUDIO');
};

/**
 * Navigate to map exploration
 * @param context - Navigation context
 */
export const navigateToExploreMap = (context: NavigationContext): void => {
  context.setGameState('EXPLORING_MAP');
};

/**
 * Navigate to camp
 * @param context - Navigation context
 */
export const navigateToCamp = (context: NavigationContext): void => {
  context.setGameState('CAMP');
};

/**
 * Navigate to NPC dialogue
 * @param context - Navigation context
 */
export const navigateToNPCs = (context: NavigationContext): void => {
  context.setGameState('NPC_DIALOGUE');
};

/**
 * Navigate to research archives
 * @param context - Navigation context
 */
export const navigateToResearchArchives = (context: NavigationContext): void => {
  context.setGameState('RESEARCH_ARCHIVES');
};

/**
 * Navigate to component theorizing lab
 * @param context - Navigation context
 */
export const navigateToTheorizeComponentLab = (context: NavigationContext): void => {
  context.setGameState('THEORIZE_COMPONENT');
};

/**
 * Navigate to traits page (with automatic trait crafting check)
 * @param context - Navigation context
 */
export const navigateToTraitsPage = (context: NavigationContext): void => {
  const expectedTraits = context.player.level >= FIRST_TRAIT_LEVEL 
    ? Math.floor((context.player.level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1 
    : 0;
    
  if ((context.player.level >= FIRST_TRAIT_LEVEL && context.player.traits.length < expectedTraits) || context.pendingTraitUnlock) {
    context.setGameState('TRAIT_CRAFTING');
  } else {
    context.setDefaultCharacterSheetTab('Traits');
    context.setGameState('CHARACTER_SHEET');
  }
};

/**
 * Navigate to quests page
 * @param context - Navigation context
 */
export const navigateToQuestsPage = (context: NavigationContext): void => {
  context.setDefaultCharacterSheetTab('Quests');
  context.setGameState('CHARACTER_SHEET');
};

/**
 * Navigate to character sheet
 * @param context - Navigation context
 * @param tab - Character sheet tab to open
 */
export const navigateToCharacterSheet = (context: NavigationContext, tab: CharacterSheetTab = 'Main'): void => {
  context.setDefaultCharacterSheetTab(tab);
  context.setGameState('CHARACTER_SHEET');
};

/**
 * Navigate to encyclopedia
 * @param context - Navigation context
 */
export const navigateToEncyclopedia = (context: NavigationContext): void => {
  context.setDefaultCharacterSheetTab('Encyclopedia');
  context.setGameState('CHARACTER_SHEET');
};

/**
 * Navigate to homestead
 * @param context - Navigation context
 */
export const navigateToHomestead = (context: NavigationContext): void => {
  context.setGameState('HOMESTEAD_VIEW');
};

/**
 * Navigate to parameters/settings
 * @param context - Navigation context
 */
export const navigateToParameters = (context: NavigationContext): void => {
  context.setGameState('PARAMETERS');
};

/**
 * Navigate to Multiplayer View
 * @param context - Navigation context
 */
export const navigateToMultiplayer = (context: NavigationContext): void => {
  context.setGameState('MULTIPLAYER_VIEW');
};

/**
 * Navigate to home screen
 * @param context - Navigation context
 */
export const navigateToHome = (context: NavigationContext): void => {
  const previousGameState = context.gameState; // Store the previous state
  context.setGameState('HOME');
  
  // Clear combat state if:
  // 1. There are no active enemies (either no enemies or all defeated) - normal victory
  // 2. Coming from GAME_OVER_DEFEAT - player was defeated, combat should end
  const hasLivingEnemies = context.currentEnemies.length > 0 && context.currentEnemies.some(enemy => enemy.hp > 0);
  const comingFromDefeat = previousGameState === 'GAME_OVER_DEFEAT';
  
  if (!hasLivingEnemies || comingFromDefeat) {
    context.setCurrentEnemies([]);
    context.setTargetEnemyId(null);
    context.setCombatLog([]);
  }
  
  context.setModalContent(null);
};

/**
 * Open help wiki modal
 * @param context - Navigation context
 */
export const openHelpWiki = (context: NavigationContext): void => {
  context.setIsHelpWikiOpen(true);
};

/**
 * Close help wiki modal
 * @param context - Navigation context
 */
export const closeHelpWiki = (context: NavigationContext): void => {
  context.setIsHelpWikiOpen(false);
};

/**
 * Open game menu modal
 * @param context - Navigation context
 */
export const openGameMenu = (context: NavigationContext): void => {
  context.setIsGameMenuOpen(true);
};

/**
 * Close game menu modal
 * @param context - Navigation context
 */
export const closeGameMenu = (context: NavigationContext): void => {
  context.setIsGameMenuOpen(false);
};

/**
 * Open mobile menu
 * @param context - Navigation context
 */
export const openMobileMenu = (context: NavigationContext): void => {
  context.setIsMobileMenuOpen(true);
};

/**
 * Close mobile menu
 * @param context - Navigation context
 */
export const closeMobileMenu = (context: NavigationContext): void => {
  context.setIsMobileMenuOpen(false);
};

/**
 * Toggle legacy footer setting
 * @param context - Navigation context
 * @param value - New value for legacy footer
 */
export const toggleLegacyFooter = (context: NavigationContext, value: boolean): void => {
  context.setUseLegacyFooter(value);
};

/**
 * Toggle debug mode setting
 * @param context - Navigation context
 * @param value - New value for debug mode
 */
export const toggleDebugMode = (context: NavigationContext, value: boolean): void => {
  context.setDebugMode(value);
};

/**
 * Toggle auto save setting
 * @param context - Navigation context
 * @param value - New value for auto save
 */
export const toggleAutoSave = (context: NavigationContext, value: boolean): void => {
  context.setAutoSave(value);
};

/**
 * Complete a rest and apply benefits
 * @param context - Navigation context
 * @param restType - Type of rest (short or long)
 * @param duration - Optional custom duration in hours
 * @param activity - Optional activity during rest
 * @returns Rest result with gains and bonus message
 */
export const completeRest = (
  context: NavigationContext,
  restType: 'short' | 'long',
  duration?: number,
  activity?: string
): RestResult => {
  const hpGain = restType === 'short' 
    ? Math.floor(context.effectivePlayerStats.maxHp * 0.25)
    : context.effectivePlayerStats.maxHp - context.player.hp;
  
  const mpGain = restType === 'short' 
    ? Math.floor(context.effectivePlayerStats.maxMp * 0.5)
    : context.effectivePlayerStats.maxMp - context.player.mp;
  
  const epGain = restType === 'short' 
    ? Math.floor(context.effectivePlayerStats.maxEp * 0.75)
    : context.effectivePlayerStats.maxEp - context.player.ep;

  // Apply custom duration scaling if specified
  const finalHpGain = duration 
    ? Math.min(Math.floor(context.effectivePlayerStats.maxHp * (duration / 8)), context.effectivePlayerStats.maxHp - context.player.hp) 
    : hpGain;
  const finalMpGain = duration 
    ? Math.min(Math.floor(context.effectivePlayerStats.maxMp * (duration / 8)), context.effectivePlayerStats.maxMp - context.player.mp) 
    : mpGain;
  const finalEpGain = duration 
    ? Math.min(Math.floor(context.effectivePlayerStats.maxEp * (duration / 8)), context.effectivePlayerStats.maxEp - context.player.ep) 
    : epGain;

  // Apply rest benefits
  context.setPlayer(prev => ({
    ...prev,
    hp: Math.min(prev.hp + finalHpGain, context.effectivePlayerStats.maxHp),
    mp: Math.min(prev.mp + finalMpGain, context.effectivePlayerStats.maxMp),
    ep: Math.min(prev.ep + finalEpGain, context.effectivePlayerStats.maxEp)
  }));

  // Apply activity bonuses
  let bonusMessage = '';
  if (activity) {
    switch (activity) {
      case 'meditation':
        const bonusMp = Math.floor(context.effectivePlayerStats.maxMp * 0.1);
        context.setPlayer(prev => ({
          ...prev,
          mp: Math.min(prev.mp + bonusMp, context.effectivePlayerStats.maxMp)
        }));
        bonusMessage = ` Meditation granted ${bonusMp} bonus MP!`;
        break;
      case 'training':
        bonusMessage = ' Training provided inspiration for future battles!';
        break;
      case 'crafting':
        if (Math.random() < 0.3) {
          const bonusGold = Math.floor(Math.random() * 5) + 1;
          context.setPlayer(prev => ({
            ...prev,
            gold: prev.gold + bonusGold
          }));
          bonusMessage = ` Crafting yielded ${bonusGold} bonus gold!`;
        } else {
          bonusMessage = ' Crafting was peaceful and restorative.';
        }
        break;
      case 'socializing':
        bonusMessage = ' Socializing improved your reputation in the area.';
        break;
      case 'exploring':
        if (Math.random() < 0.25) {
          const bonusEssence = 1;
          context.setPlayer(prev => ({
            ...prev,
            essence: prev.essence + bonusEssence
          }));
          bonusMessage = ` Exploring discovered ${bonusEssence} essence!`;
        } else {
          bonusMessage = ' Exploring revealed interesting sights nearby.';
        }
        break;
    }
  }

  const restDuration = duration || (restType === 'short' ? 1 : 8);
  context.setModalContent({
    title: 'Rest Complete',
    message: `You rested for ${restDuration} hour${restDuration !== 1 ? 's' : ''} and recovered ${finalHpGain} HP, ${finalMpGain} MP, and ${finalEpGain} EP.${bonusMessage}`,
    type: 'success'
  });

  return {
    hpGain: finalHpGain,
    mpGain: finalMpGain,
    epGain: finalEpGain,
    bonusMessage
  };
};

/**
 * Navigation Controller utility functions
 */
export const NavigationControllerUtils = {
  navigateToInventory,
  navigateToSpellbook,
  navigateToCraftingHub,
  navigateToRecipeDiscovery,
  navigateToCraftingWorkshop,
  navigateToSpellDesignStudio,
  navigateToExploreMap,
  navigateToCamp,
  navigateToNPCs,
  navigateToResearchArchives,
  navigateToTheorizeComponentLab,
  navigateToTraitsPage,
  navigateToQuestsPage,
  navigateToCharacterSheet,
  navigateToEncyclopedia,
  navigateToHomestead,
  navigateToParameters,
  navigateToMultiplayer, // Add this line
  navigateToHome,
  openHelpWiki,
  closeHelpWiki,
  openGameMenu,
  closeGameMenu,
  openMobileMenu,
  closeMobileMenu,
  toggleLegacyFooter,
  toggleDebugMode,
  toggleAutoSave,
  completeRest,
}; 