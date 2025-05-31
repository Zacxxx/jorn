import { generateTrait } from '../../services/geminiService';
import { Player, Trait } from '../../types';
import { FIRST_TRAIT_LEVEL, TRAIT_LEVEL_INTERVAL } from '../../constants';

/**
 * Trait Manager Module
 * Handles trait crafting, management, and progression
 */

export interface TraitContext {
  player: Player;
  setPlayer: (updater: (prev: Player) => Player) => void;
  setIsLoading: (loading: boolean) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

export interface TraitCraftResult {
  success: boolean;
  trait?: Trait;
  message: string;
  type: 'success' | 'error';
}

export interface TraitSlotInfo {
  totalSlots: number;
  usedSlots: number;
  availableSlots: number;
  nextSlotLevel: number | null;
}

/**
 * Craft a new trait using AI
 * @param promptText - Description of the desired trait
 * @param context - Trait execution context
 * @returns Promise that resolves to craft result
 */
export const craftTrait = async (
  promptText: string,
  context: TraitContext
): Promise<TraitCraftResult> => {
  // Validate input
  if (!promptText.trim()) {
    return {
      success: false,
      message: 'Please provide a description for the trait.',
      type: 'error'
    };
  }

  // Check if player can craft traits
  if (!canCraftTrait(context.player)) {
    const nextLevel = getNextTraitLevel(context.player);
    return {
      success: false,
      message: `You cannot craft more traits yet. ${nextLevel ? `Next trait slot unlocks at level ${nextLevel}.` : 'Maximum traits reached.'}`,
      type: 'error'
    };
  }

  context.setIsLoading(true);
  context.addLog('System', `Crafting trait: "${promptText}"...`, 'info');

  try {
    // Create trait using AI
    const traitData = await generateTrait(promptText, context.player.level);

    if (!traitData) {
      return {
        success: false,
        message: 'Failed to generate trait from prompt.',
        type: 'error'
      };
    }

    // Convert GeneratedTraitData to Trait by adding required fields
    const newTrait: Trait = {
      id: `trait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: traitData.name,
      description: traitData.description,
      iconName: traitData.iconName,
      tags: traitData.tags,
      rarity: traitData.rarity,
      level: context.player.level
    };

    // Add trait to player
    context.setPlayer(prev => ({
      ...prev,
      traits: [...prev.traits, newTrait]
    }));

    return {
      success: true,
      trait: newTrait,
      message: `Successfully crafted trait: ${newTrait.name}`,
      type: 'success'
    };
  } catch (error) {
    console.error('Error crafting trait:', error);
    return {
      success: false,
      message: 'An error occurred while crafting the trait.',
      type: 'error'
    };
  }
};

/**
 * Check if player can craft a new trait
 * @param player - Current player state
 * @returns True if player can craft a trait
 */
export const canCraftTrait = (player: Player): boolean => {
  const maxTraits = getMaxTraits(player.level);
  return player.level >= FIRST_TRAIT_LEVEL && player.traits.length < maxTraits;
};

/**
 * Get maximum number of traits for a given level
 * @param level - Player level
 * @returns Maximum number of traits
 */
export const getMaxTraits = (level: number): number => {
  if (level < FIRST_TRAIT_LEVEL) return 0;
  return Math.floor((level - FIRST_TRAIT_LEVEL) / TRAIT_LEVEL_INTERVAL) + 1;
};

/**
 * Get the next level at which a trait slot unlocks
 * @param player - Current player state
 * @returns Next trait level or null if at maximum
 */
export const getNextTraitLevel = (player: Player): number | null => {
  const currentMaxTraits = getMaxTraits(player.level);
  const nextSlotLevel = FIRST_TRAIT_LEVEL + (currentMaxTraits * TRAIT_LEVEL_INTERVAL);
  
  // Check if there's a reasonable upper limit (e.g., level 100)
  if (nextSlotLevel > 100) return null;
  
  return nextSlotLevel;
};

/**
 * Get trait slot information for the player
 * @param player - Current player state
 * @returns Trait slot information
 */
export const getTraitSlotInfo = (player: Player): TraitSlotInfo => {
  const totalSlots = getMaxTraits(player.level);
  const usedSlots = player.traits.length;
  const availableSlots = Math.max(0, totalSlots - usedSlots);
  const nextSlotLevel = getNextTraitLevel(player);

  return {
    totalSlots,
    usedSlots,
    availableSlots,
    nextSlotLevel
  };
};

/**
 * Check if a trait name is already taken
 * @param player - Current player state
 * @param traitName - Name to check
 * @returns True if name is already used
 */
export const isTraitNameTaken = (player: Player, traitName: string): boolean => {
  return player.traits.some(trait => 
    trait.name.toLowerCase() === traitName.toLowerCase()
  );
};

/**
 * Get traits by category
 * @param player - Current player state
 * @param category - Category to filter by (optional)
 * @returns Array of traits in the category
 */
export const getTraitsByCategory = (player: Player, category?: string): Trait[] => {
  if (!category) return player.traits;
  
  // Since traits don't have categories in the current type definition,
  // we'll filter by tags instead
  return player.traits.filter(trait => 
    trait.tags?.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
  );
};

/**
 * Get trait effectiveness based on player stats
 * @param trait - Trait to evaluate
 * @param player - Current player state
 * @returns Effectiveness multiplier (1.0 = normal)
 */
export const getTraitEffectiveness = (trait: Trait, player: Player): number => {
  let effectiveness = 1.0;
  
  // Base effectiveness from player level
  const levelBonus = Math.min(0.5, player.level * 0.02); // Max 50% bonus at level 25
  effectiveness += levelBonus;
  
  // Trait rarity bonus
  const rarityBonus = trait.rarity * 0.1; // 10% per rarity level
  effectiveness += rarityBonus;
  
  return effectiveness;
};

/**
 * Get suggested trait prompts based on player build
 * @param player - Current player state
 * @returns Array of suggested trait descriptions
 */
export const getSuggestedTraitPrompts = (player: Player): string[] => {
  const suggestions: string[] = [];
  
  // Stat-based suggestions
  const highestStat = Math.max(player.body, player.mind, player.reflex);
  if (player.body === highestStat) {
    suggestions.push("A trait that enhances physical prowess and combat effectiveness");
  }
  if (player.mind === highestStat) {
    suggestions.push("A trait that amplifies magical abilities and spell power");
  }
  if (player.reflex === highestStat) {
    suggestions.push("A trait that improves agility and reaction speed");
  }
  
  // Level-based suggestions
  if (player.level >= 10) {
    suggestions.push("A trait that provides unique combat abilities");
  }
  if (player.level >= 20) {
    suggestions.push("A trait that grants mastery over elemental forces");
  }
  
  return suggestions;
};

/**
 * Validate trait prompt for appropriateness
 * @param prompt - Trait prompt to validate
 * @returns Validation result with suggestions
 */
export const validateTraitPrompt = (prompt: string): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check length
  if (prompt.length < 10) {
    issues.push('Prompt is too short. Please provide more detail.');
    suggestions.push('Describe what the trait does and how it affects gameplay.');
  }
  
  if (prompt.length > 500) {
    issues.push('Prompt is too long. Please be more concise.');
    suggestions.push('Focus on the core concept and main effects.');
  }
  
  // Check for inappropriate content (basic checks)
  const inappropriateWords = ['cheat', 'hack', 'exploit', 'infinite', 'unlimited'];
  const hasInappropriate = inappropriateWords.some(word => 
    prompt.toLowerCase().includes(word)
  );
  
  if (hasInappropriate) {
    issues.push('Prompt contains inappropriate content.');
    suggestions.push('Focus on balanced, thematic abilities that enhance gameplay.');
  }
  
  // Check for vague descriptions
  const vaguePhrases = ['very powerful', 'super strong', 'best trait', 'overpowered'];
  const isVague = vaguePhrases.some(phrase => 
    prompt.toLowerCase().includes(phrase)
  );
  
  if (isVague) {
    issues.push('Prompt is too vague or overpowered.');
    suggestions.push('Be specific about what the trait does and its limitations.');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
};

/**
 * Trait Manager utility functions
 */
export const TraitManagerUtils = {
  craftTrait,
  canCraftTrait,
  getMaxTraits,
  getNextTraitLevel,
  getTraitSlotInfo,
  isTraitNameTaken,
  getTraitsByCategory,
  getTraitEffectiveness,
  getSuggestedTraitPrompts,
  validateTraitPrompt,
}; 