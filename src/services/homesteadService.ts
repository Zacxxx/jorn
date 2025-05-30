import { Homestead, HomesteadProject, HomesteadProperty, ResourceCost } from '../types';
import { getHomesteadData } from './locationService';

// Initialize default homestead for new players
export const createInitialHomestead = (): Homestead => {
  const homesteadData = getHomesteadData();
  
  return {
    id: homesteadData.id,
    name: homesteadData.name,
    description: homesteadData.description,
    properties: {
      garden: {
        level: 1,
        description: 'A small garden where you can grow herbs and basic ingredients.',
        upgrades: ['expanded_plots', 'greenhouse', 'magical_fertilizer']
      },
      workshop: {
        level: 1,
        description: 'A basic crafting area with essential tools.',
        upgrades: ['advanced_tools', 'enchanting_table', 'alchemy_station']
      },
      storage: {
        level: 1,
        description: 'Simple storage for your belongings.',
        upgrades: ['expanded_storage', 'magical_vault', 'item_sorter']
      }
    },
    activeProjects: [],
    totalInvestment: 0,
    unlocked: true
  };
};

// Generate unique project ID
export const generateProjectId = (): string => {
  return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Check if a resource cost can be afforded
export const canAffordResourceCost = (inventory: Record<string, number>, costs: ResourceCost[]): boolean => {
  return costs.every(cost => (inventory[cost.itemId] || 0) >= cost.quantity);
};

// Consume resources from inventory
export const consumeResources = (inventory: Record<string, number>, costs: ResourceCost[]): Record<string, number> => {
  const newInventory = { ...inventory };
  
  costs.forEach(cost => {
    newInventory[cost.itemId] = (newInventory[cost.itemId] || 0) - cost.quantity;
    if (newInventory[cost.itemId] <= 0) {
      delete newInventory[cost.itemId];
    }
  });
  
  return newInventory;
};

// Add project rewards to inventory
export const addProjectRewards = (
  inventory: Record<string, number>, 
  rewards: HomesteadProject['rewards']
): Record<string, number> => {
  if (!rewards) return inventory;
  
  const newInventory = { ...inventory };
  
  rewards.forEach(reward => {
    if (reward.type === 'resource' || reward.type === 'item') {
      if (reward.itemId && reward.quantity) {
        newInventory[reward.itemId] = (newInventory[reward.itemId] || 0) + reward.quantity;
      }
    }
  });
  
  return newInventory;
};

// Calculate time remaining for a project
export const getProjectTimeRemaining = (project: HomesteadProject): number => {
  const elapsed = (Date.now() - project.startTime) / (1000 * 60 * 60); // hours
  return Math.max(0, project.duration - elapsed);
};

// Check if a project is complete
export const isProjectComplete = (project: HomesteadProject): boolean => {
  return getProjectTimeRemaining(project) <= 0;
};

// Get upgrade costs for homestead properties
export const getUpgradeCosts = (upgrade: string): ResourceCost[] => {
  const upgradeCosts: Record<string, ResourceCost[]> = {
    // Garden upgrades
    'expanded_plots': [
      { type: 'Iron Ore', itemId: 'iron_ore', quantity: 10 },
      { type: 'Verdant Leaf', itemId: 'verdant_leaf', quantity: 5 }
    ],
    'greenhouse': [
      { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 3 },
      { type: 'Mystic Orb', itemId: 'mystic_orb', quantity: 2 }
    ],
    'magical_fertilizer': [
      { type: 'Arcane Dust', itemId: 'arcane_dust', quantity: 8 },
      { type: 'Emberbloom Petal', itemId: 'emberbloom_petal', quantity: 4 }
    ],
    
    // Workshop upgrades
    'advanced_tools': [
      { type: 'Iron Ore', itemId: 'iron_ore', quantity: 15 },
      { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 2 }
    ],
    'enchanting_table': [
      { type: 'Mystic Orb', itemId: 'mystic_orb', quantity: 3 },
      { type: 'Arcane Dust', itemId: 'arcane_dust', quantity: 12 }
    ],
    'alchemy_station': [
      { type: 'Emberbloom Petal', itemId: 'emberbloom_petal', quantity: 6 },
      { type: 'Verdant Leaf', itemId: 'verdant_leaf', quantity: 8 }
    ],
    
    // Storage upgrades
    'expanded_storage': [
      { type: 'Iron Ore', itemId: 'iron_ore', quantity: 20 },
      { type: 'Ancient Bone', itemId: 'ancient_bone', quantity: 3 }
    ],
    'magical_vault': [
      { type: 'Mystic Orb', itemId: 'mystic_orb', quantity: 4 },
      { type: 'Crystal Shard', itemId: 'crystal_shard', quantity: 5 }
    ],
    'item_sorter': [
      { type: 'Arcane Dust', itemId: 'arcane_dust', quantity: 10 },
      { type: 'Shadowsilk Thread', itemId: 'shadowsilk_thread', quantity: 6 }
    ]
  };
  
  return upgradeCosts[upgrade] || [];
};

// Apply upgrade to property
export const applyPropertyUpgrade = (property: HomesteadProperty, upgradeName: string): HomesteadProperty => {
  return {
    ...property,
    level: property.level + 1,
    currentUpgrade: upgradeName,
    description: getUpgradeDescription(property, upgradeName)
  };
};

// Get upgrade descriptions
const getUpgradeDescription = (property: HomesteadProperty, upgradeName: string): string => {
  const descriptions: Record<string, string> = {
    'expanded_plots': 'An expanded garden with more space for growing various herbs and magical plants.',
    'greenhouse': 'A magical greenhouse that accelerates plant growth and enables rare species cultivation.',
    'magical_fertilizer': 'Enhanced soil treatment that dramatically improves plant quality and yield.',
    'advanced_tools': 'Professional-grade crafting tools that enable more complex item creation.',
    'enchanting_table': 'A mystical workstation for imbuing items with magical properties.',
    'alchemy_station': 'Specialized equipment for brewing potions and transmuting materials.',
    'expanded_storage': 'Additional storage capacity with better organization systems.',
    'magical_vault': 'Secure, enchanted storage that preserves item quality indefinitely.',
    'item_sorter': 'Automated sorting system that categorizes and manages inventory efficiently.'
  };
  
  return descriptions[upgradeName] || property.description;
};

export default {
  createInitialHomestead,
  generateProjectId,
  canAffordResourceCost,
  consumeResources,
  addProjectRewards,
  getProjectTimeRemaining,
  isProjectComplete,
  getUpgradeCosts,
  applyPropertyUpgrade
}; 