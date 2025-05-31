import { Player, Enemy, GameItem, LootChestItem } from '../../types';
import { ENEMY_DIFFICULTY_XP_REWARD } from '../../constants';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';

/**
 * Progression Manager Module
 * Handles player leveling, experience, and combat rewards
 */

export interface ProgressionContext {
  player: Player;
  setPlayer: (updater: (prev: Player) => Player) => void;
  addLog: (actor: 'Player' | 'Enemy' | 'System', message: string, type: 'action' | 'damage' | 'heal' | 'status' | 'error' | 'info' | 'success' | 'warning' | 'resource' | 'speed') => void;
  showMessageModal: (title: string, message: string, type?: 'info' | 'error' | 'success') => void;
}

export interface CombatRewards {
  xp: number;
  gold: number;
  essence: number;
  items: GameItem[];
  resources: Record<string, number>;
}

export interface LevelUpResult {
  newLevel: number;
  statPointsGained: number;
  newAbilitiesUnlocked: string[];
  newFeaturesUnlocked: string[];
}

/**
 * Award combat rewards for defeating an enemy
 * @param defeatedEnemy - The defeated enemy
 * @param context - Progression context
 * @returns Awarded rewards
 */
export const awardCombatRewards = (
  defeatedEnemy: Enemy,
  context: ProgressionContext
): CombatRewards => {
  const difficultyKey = defeatedEnemy.level < 3 ? 'easy' : 
                       defeatedEnemy.level < 7 ? 'medium' : 
                       defeatedEnemy.level < 10 ? 'hard' : 'boss';
  
  const baseRewards = ENEMY_DIFFICULTY_XP_REWARD[difficultyKey] || ENEMY_DIFFICULTY_XP_REWARD.easy;
  
  let xpGained = baseRewards.xp;
  let goldGained = Math.floor(Math.random() * (baseRewards.goldMax - baseRewards.goldMin + 1)) + baseRewards.goldMin;
  let essenceGained = Math.floor(Math.random() * (baseRewards.essenceMax - baseRewards.essenceMin + 1)) + baseRewards.essenceMin;

  // Apply elite multipliers
  if (defeatedEnemy.isElite && ENEMY_DIFFICULTY_XP_REWARD.elite) {
    xpGained = Math.floor(xpGained * ENEMY_DIFFICULTY_XP_REWARD.elite.xp_multiplier);
    goldGained = Math.floor(goldGained * ENEMY_DIFFICULTY_XP_REWARD.elite.gold_multiplier);
    essenceGained = Math.floor(essenceGained * ENEMY_DIFFICULTY_XP_REWARD.elite.essence_multiplier);
    essenceGained = Math.max(1, essenceGained);
  }

  context.addLog('System', `Player gains ${xpGained} XP, ${goldGained} Gold, and ${essenceGained} Essence.`, 'info');

  // Process dropped resources
  const newInventory = { ...context.player.inventory };
  const newItems: GameItem[] = [];
  let lootMessages: string[] = [];

  if (defeatedEnemy.droppedResources) {
    defeatedEnemy.droppedResources.forEach(rc => {
      newInventory[rc.itemId] = (newInventory[rc.itemId] || 0) + rc.quantity;
      const itemDef = MASTER_ITEM_DEFINITIONS[rc.itemId];
      lootMessages.push(`${rc.quantity}x ${itemDef ? itemDef.name : rc.type}`);
    });
  }

  // Generate loot chests
  let chestsToDrop = 0;
  if (defeatedEnemy.isElite) chestsToDrop = 2;
  else if (Math.random() < 0.25) chestsToDrop = 1;

  for (let i = 0; i < chestsToDrop; i++) {
    const chest: LootChestItem = {
      id: `lootchest-${Date.now()}-${i}`,
      name: defeatedEnemy.isElite ? "Elite Treasure Chest" : "Common Loot Chest",
      description: defeatedEnemy.isElite ? "A sturdy chest dropped by an elite foe." : "A simple chest containing some minor valuables.",
      iconName: 'ChestIcon',
      itemType: 'LootChest',
      rarity: defeatedEnemy.isElite ? (3 + Math.floor(defeatedEnemy.level / 5)) : (1 + Math.floor(defeatedEnemy.level / 10)),
      level: defeatedEnemy.level,
      stackable: false,
    };
    newItems.push(chest);
    lootMessages.push(chest.name);
  }

  if (lootMessages.length > 0) {
    context.addLog('System', `Found: ${lootMessages.join(', ')}.`, 'resource');
  }

  // Update player state
  const oldLevel = context.player.level;
  context.setPlayer(prev => ({
    ...prev,
    xp: prev.xp + xpGained,
    gold: prev.gold + goldGained,
    essence: prev.essence + essenceGained,
    inventory: newInventory,
    items: [...prev.items, ...newItems],
    bestiary: {
      ...prev.bestiary,
      [defeatedEnemy.id]: {
        ...prev.bestiary[defeatedEnemy.id],
        vanquishedCount: (prev.bestiary[defeatedEnemy.id]?.vanquishedCount || 0) + 1,
      }
    }
  }));

  // Check for level up
  const newLevel = calculateLevelFromXP(context.player.xp + xpGained);
  if (newLevel > oldLevel) {
    handleLevelUp(oldLevel, newLevel, context);
  }

  return {
    xp: xpGained,
    gold: goldGained,
    essence: essenceGained,
    items: newItems,
    resources: newInventory
  };
};

/**
 * Calculate player level from total XP
 * @param totalXP - Total experience points
 * @returns Player level
 */
export const calculateLevelFromXP = (totalXP: number): number => {
  // Simple leveling formula: level = floor(sqrt(XP / 100)) + 1
  // This creates a curve where each level requires more XP
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

/**
 * Calculate XP required for next level
 * @param currentLevel - Current player level
 * @returns XP needed for next level
 */
export const getXPForNextLevel = (currentLevel: number): number => {
  const nextLevel = currentLevel + 1;
  return (nextLevel - 1) * (nextLevel - 1) * 100;
};

/**
 * Calculate XP progress to next level
 * @param currentXP - Current total XP
 * @param currentLevel - Current level
 * @returns Progress information
 */
export const getLevelProgress = (currentXP: number, currentLevel: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progressXP: number;
  progressPercent: number;
} => {
  const currentLevelXP = (currentLevel - 1) * (currentLevel - 1) * 100;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const progressXP = currentXP - currentLevelXP;
  const progressPercent = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

  return {
    currentLevelXP,
    nextLevelXP,
    progressXP,
    progressPercent: Math.min(100, Math.max(0, progressPercent))
  };
};

/**
 * Handle player level up
 * @param oldLevel - Previous level
 * @param newLevel - New level
 * @param context - Progression context
 * @returns Level up information
 */
export const handleLevelUp = (
  oldLevel: number,
  newLevel: number,
  context: ProgressionContext
): LevelUpResult => {
  const levelsGained = newLevel - oldLevel;
  const statPointsGained = levelsGained * 2; // 2 stat points per level
  
  // Update player level and stat points
  context.setPlayer(prev => ({
    ...prev,
    level: newLevel,
    availableStatPoints: prev.availableStatPoints + statPointsGained
  }));

  const newAbilitiesUnlocked: string[] = [];
  const newFeaturesUnlocked: string[] = [];

  // Check for new features unlocked
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    const unlockedFeatures = getUnlockedFeaturesAtLevel(level);
    newFeaturesUnlocked.push(...unlockedFeatures);
  }

  const levelUpMessage = `Level Up! You are now level ${newLevel}. +${statPointsGained} stat points available.`;
  context.addLog('System', levelUpMessage, 'success');
  
  if (newFeaturesUnlocked.length > 0) {
    context.addLog('System', `New features unlocked: ${newFeaturesUnlocked.join(', ')}`, 'info');
  }

  context.showMessageModal(
    'Level Up!',
    `Congratulations! You reached level ${newLevel}!\n\n+${statPointsGained} stat points\n${newFeaturesUnlocked.length > 0 ? `\nNew features: ${newFeaturesUnlocked.join(', ')}` : ''}`,
    'success'
  );

  return {
    newLevel,
    statPointsGained,
    newAbilitiesUnlocked,
    newFeaturesUnlocked
  };
};

/**
 * Get features unlocked at a specific level
 * @param level - Player level
 * @returns Array of unlocked feature names
 */
const getUnlockedFeaturesAtLevel = (level: number): string[] => {
  const features: string[] = [];

  switch (level) {
    case 2:
      features.push('Spell Preparation');
      break;
    case 3:
      features.push('Ability System', 'Advanced Rest Activities');
      break;
    case 5:
      features.push('Trait Crafting', 'Homestead Management');
      break;
    case 7:
      features.push('Settlement Trading', 'Advanced Crafting');
      break;
    case 10:
      features.push('Elite Enemy Encounters');
      break;
    case 15:
      features.push('Master Crafting');
      break;
    case 20:
      features.push('Legendary Content');
      break;
  }

  return features;
};

/**
 * Check if player can level up
 * @param player - Current player state
 * @returns True if player has enough XP to level up
 */
export const canLevelUp = (player: Player): boolean => {
  const currentLevel = player.level;
  const requiredXP = getXPForNextLevel(currentLevel);
  return player.xp >= requiredXP;
};

/**
 * Get stat point allocation recommendations
 * @param player - Current player state
 * @returns Recommended stat allocations
 */
export const getStatAllocationRecommendations = (player: Player): {
  body: number;
  mind: number;
  soul: number;
  reasoning: string;
} => {
  const totalPoints = player.availableStatPoints;
  
  if (totalPoints === 0) {
    return { body: 0, mind: 0, soul: 0, reasoning: 'No stat points available.' };
  }

  // Analyze player's current build
  const { body, mind, soul } = player;
  const total = body + mind + soul;
  
  if (total === 0) {
    // First allocation - balanced start
    const perStat = Math.floor(totalPoints / 3);
    const remainder = totalPoints % 3;
    return {
      body: perStat + (remainder > 0 ? 1 : 0),
      mind: perStat + (remainder > 1 ? 1 : 0),
      soul: perStat,
      reasoning: 'Balanced starting allocation recommended for new characters.'
    };
  }

  // Determine dominant stat
  const bodyPercent = body / total;
  const mindPercent = mind / total;
  const soulPercent = soul / total;

  if (bodyPercent > 0.5) {
    // Physical build
    return {
      body: Math.ceil(totalPoints * 0.6),
      mind: Math.floor(totalPoints * 0.2),
      soul: Math.floor(totalPoints * 0.2),
      reasoning: 'Physical build detected. Prioritizing Body with some Mind/Soul for balance.'
    };
  } else if (mindPercent > 0.5) {
    // Magical build
    return {
      body: Math.floor(totalPoints * 0.2),
      mind: Math.ceil(totalPoints * 0.6),
      soul: Math.floor(totalPoints * 0.2),
      reasoning: 'Magical build detected. Prioritizing Mind with some Body/Soul for survivability.'
    };
  } else if (soulPercent > 0.5) {
    // Soul build
    return {
      body: Math.floor(totalPoints * 0.2),
      mind: Math.floor(totalPoints * 0.2),
      soul: Math.ceil(totalPoints * 0.6),
      reasoning: 'Soul build detected. Prioritizing Soul with some Body/Mind for balance.'
    };
  } else {
    // Balanced build
    const perStat = Math.floor(totalPoints / 3);
    const remainder = totalPoints % 3;
    return {
      body: perStat + (remainder > 0 ? 1 : 0),
      mind: perStat + (remainder > 1 ? 1 : 0),
      soul: perStat,
      reasoning: 'Balanced build detected. Maintaining even stat distribution.'
    };
  }
};

/**
 * Progression Manager utility functions
 */
export const ProgressionManagerUtils = {
  awardCombatRewards,
  calculateLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
  handleLevelUp,
  canLevelUp,
  getStatAllocationRecommendations,
}; 