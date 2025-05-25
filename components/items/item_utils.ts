import { Equipment, ResourceType, ResourceCost } from '../../types';
import { getEnhancementDetails } from './enhancement_rules';

export interface EnhancementResult {
  success: boolean;
  newItem?: Equipment; // The item after enhancement attempt (updated on success, same on fail)
  consumedResources: ResourceCost[];
  message: string;
}

/**
 * Checks if the player has enough resources.
 */
export const hasEnoughResources = (inventory: Record<ResourceType, number>, costs: ResourceCost[]): boolean => {
  return costs.every(cost => (inventory[cost.type] || 0) >= cost.quantity);
};

/**
 * Deducts resources from the inventory.
 * Returns a new inventory object.
 * IMPORTANT: This function assumes `hasEnoughResources` was checked before calling.
 */
export const deductResources = (inventory: Record<ResourceType, number>, costs: ResourceCost[]): Record<ResourceType, number> => {
  const newInventory = { ...inventory };
  costs.forEach(cost => {
    newInventory[cost.type] = (newInventory[cost.type] || 0) - cost.quantity;
  });
  return newInventory;
};

/**
 * Attempts to enhance an equipment item.
 */
export const attemptEnhancement = (
  item: Equipment,
  currentInventory: Record<ResourceType, number>
): EnhancementResult => {
  const currentLevel = item.enhancementLevel || 0;
  const details = getEnhancementDetails(currentLevel);

  if (!hasEnoughResources(currentInventory, details.cost)) {
    return {
      success: false,
      newItem: item, // Item remains unchanged
      consumedResources: [],
      message: 'Not enough resources to attempt enhancement.',
    };
  }

  // Simulate success based on chance
  const roll = Math.random(); // Random number between 0 and 1
  const wasSuccessful = roll < details.successChance;

  if (wasSuccessful) {
    const upgradedItem: Equipment = JSON.parse(JSON.stringify(item)); // Deep copy
    upgradedItem.enhancementLevel = details.level;

    // Ensure originalStatsBoost exists, if not, initialize it from current statsBoost
    // This should ideally be set when the item is first created.
    const baseStats = upgradedItem.originalStatsBoost || upgradedItem.statsBoost;
    if (!upgradedItem.originalStatsBoost) {
        upgradedItem.originalStatsBoost = JSON.parse(JSON.stringify(upgradedItem.statsBoost));
    }

    // Calculate new stats
    // The statMultiplier from getEnhancementDetails is the *additional percentage* of original base stats for this level.
    const newStats = { ...upgradedItem.statsBoost }; 

    for (const statKey in baseStats) {
        const key = statKey as keyof Equipment['statsBoost']; // Corrected type
        const originalStatValue = baseStats[key] || 0;
        const currentStatValue = upgradedItem.statsBoost[key] || 0;
        
        // The increase is based on the original stat value multiplied by the current level's multiplier
        const increaseAmount = originalStatValue * details.statMultiplier;

        // We add this increase to the *current* stat value of the item.
        // This ensures that stats increase additively from their previously enhanced state,
        // but the magnitude of each step's increase is based on the original untainted stat.
        newStats[key] = Math.round((currentStatValue + increaseAmount) * 100) / 100; // Keep 2 decimal places if stats become fractional
    }
    upgradedItem.statsBoost = newStats;

    return {
      success: true,
      newItem: upgradedItem,
      consumedResources: details.cost,
      message: `Enhancement to +${details.level} successful! (${(details.successChance * 100).toFixed(0)}% chance).`,
    };
  } else {
    return {
      success: false,
      newItem: item, // Item remains unchanged
      consumedResources: details.cost, // Resources are consumed even on failure
      message: `Enhancement to +${details.level} failed. (${(details.successChance * 100).toFixed(0)}% chance). Resources lost.`,
    };
  }
};

/**
 * Generates a unique ID for a new item, potentially based on a template.
 */
export const generateItemId = (prefix: string = 'item'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}; 