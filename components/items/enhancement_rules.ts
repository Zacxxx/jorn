import { ResourceType, ResourceCost } from '../../types';

export interface EnhancementLevelDetails {
  level: number;
  cost: ResourceCost[];
  successChance: number; // Percentage (e.g., 0.9 for 90%)
  statMultiplier: number; // How much to multiply the base stat boost for this level (e.g., 1.1 for 10% increase over base)
}

// Define enhancement progression
// This can be a simple array or a more complex function later
// For now, let's define a few levels as examples.
// The actual stat boost will be (base_stat * (enhancementLevel * some_factor_or_lookup_from_statMultiplier))

const BASE_COST_PER_LEVEL: Record<ResourceType, number> = {
  'Arcane Dust': 2,
  'Emberbloom Petal': 1,
  'Shadowsilk Thread': 1,
  'Crystal Shard': 3,
  'Verdant Leaf': 1,
  'Mystic Orb': 0.5, // Higher tier resource, less quantity needed but implies rarity
};

// This function will determine the cost and success chance for a given enhancement level.
// It's designed to be easily expandable.
export const getEnhancementDetails = (currentLevel: number): EnhancementLevelDetails => {
  const level = currentLevel + 1; // We are calculating for the *next* level

  // Dynamic cost calculation: increases with level
  const cost: ResourceCost[] = (
        Object.keys(BASE_COST_PER_LEVEL) as ResourceType[]
    ).map(resourceType => ({
    type: resourceType,
    quantity: Math.max(1, Math.ceil(BASE_COST_PER_LEVEL[resourceType] * (1 + (level -1) * 0.5))),
  }));

  // Dynamic success chance: decreases with level
  let successChance = 1.0; // 100% for level +1
  if (level <= 3) successChance = 1.0;
  else if (level <= 5) successChance = 0.9 - (level - 3) * 0.1; // 90% -> 80% -> 70%
  else if (level <= 7) successChance = 0.6 - (level - 5) * 0.1; // 60% -> 50% -> 40%
  else if (level <= 10) successChance = 0.3 - (level - 8) * 0.05; // 30% -> 25% -> 20%
  else successChance = 0.1; // 10% cap for very high levels

  // Stat multiplier: how much each stat point on the item is effectively worth at this enhancement level.
  // Example: a +1 Body item at enhancement level 2 (statMultiplier 1.2) might give +1.2 Body (or handled differently)
  // For simplicity now, let's say each enhancement level adds a flat percentage of the item's *original* base stats.
  // Let's say each level adds 10% of the item's initial base stats. So +3 level = +30% of original base stats.
  // This statMultiplier will represent the *total* multiplier from the base.
  // So for +1, it's 1.1, for +2 it's 1.2 etc. relative to the item's inherent stats before any enhancement.
  // Or, more simply, it is the factor by which the *original* base stats are increased AT THIS LEVEL of enhancement.
  // Let's re-think this: the enhancement process should *increment* stats.
  // The multiplier will be applied to the *original base stat* of the item to determine the *additional* bonus for that level.

  return {
    level,
    cost,
    successChance: Math.max(0.05, successChance), // Minimum 5% success chance
    // This statMultiplier indicates how much the original base stats are boosted *by this single enhancement step*
    // So if base stat is 10, and this is 0.1, it adds 1. This is simpler to manage.
    statMultiplier: 0.1 + (level - 1) * 0.02 // Each enhancement step adds 10% of original base + 2% per existing enhancement level.
  };
};

// Example usage:
// const level1Details = getEnhancementDetails(0); // For enhancing to +1
// const level5Details = getEnhancementDetails(4); // For enhancing to +5 