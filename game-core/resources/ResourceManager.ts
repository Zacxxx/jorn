import { Player, ResourceCost } from '../../types';
import { MASTER_ITEM_DEFINITIONS } from '../../services/itemService';
import { AVAILABLE_RESOURCE_TYPES_FOR_AI } from '../../constants';

/**
 * Resource Management Module
 * Handles checking and deducting resources from player inventory
 */

/**
 * Map resource type to the correct item ID that exists in player inventory
 * This handles the mismatch between AI-generated item IDs and actual inventory IDs
 * @param type - Resource type name
 * @returns The correct item ID to use for inventory lookup
 */
const mapResourceTypeToInventoryId = (type: string): string => {
  // Mapping from resource type names to the actual item IDs used in player inventory
  const mapping: Record<string, string> = {
    'Arcane Dust': 'res_arcane_dust_001',
    'Crystal Shard': 'res_crystal_shard_001', 
    'Elemental Essence': 'res_elemental_essence_001',
    'Mystic Herb': 'res_mystic_herb_001',
    'Dragon Scale': 'res_dragon_scale_001',
    'Phoenix Feather': 'res_phoenix_feather_001'
  };
  
  return mapping[type] || type.toLowerCase().replace(/\s+/g, '_');
};

/**
 * Get the correct item ID for inventory operations
 * This function tries multiple approaches to find the right item ID
 * @param cost - Resource cost object
 * @param player - Player object to check inventory against
 * @returns The correct item ID to use for inventory lookup
 */
const getCorrectItemId = (cost: ResourceCost, player?: Player): string => {
  // List of possible item IDs to try, in order of preference
  const possibleIds: string[] = [];
  
  // First, try the provided itemId as-is
  if (cost.itemId) {
    possibleIds.push(cost.itemId);
  }
  
  // Try mapping from the type to the standard inventory ID
  if (cost.type) {
    const mappedId = mapResourceTypeToInventoryId(cost.type);
    if (mappedId !== cost.itemId) {
      possibleIds.push(mappedId);
    }
  }
  
  // Try alternative formats based on the type
  if (cost.type) {
    const alternatives = [
      cost.type.toLowerCase().replace(/\s+/g, '_'),
      cost.type.toLowerCase().replace(/\s+/g, ''),
      'res_' + cost.type.toLowerCase().replace(/\s+/g, '_') + '_001'
    ];
    possibleIds.push(...alternatives);
  }
  
  // If we have a player, find the first ID that actually exists in their inventory
  if (player) {
    for (const id of possibleIds) {
      if (player.inventory[id] && player.inventory[id] > 0) {
        console.log(`🔍 ResourceManager: Found ${cost.type} as ${id} (${player.inventory[id]} available)`);
        return id;
      }
    }
    
    // If no ID with positive quantity found, try to find any ID that exists (even with 0)
    for (const id of possibleIds) {
      if (player.inventory.hasOwnProperty(id)) {
        console.log(`⚠️ ResourceManager: Found ${cost.type} as ${id} but quantity is ${player.inventory[id]}`);
        return id;
      }
    }
    
    console.log(`❌ ResourceManager: Could not find ${cost.type} in inventory. Tried: ${possibleIds.join(', ')}`);
    console.log(`📦 Player inventory:`, Object.keys(player.inventory).filter(key => player.inventory[key] > 0));
  }
  
  // Fallback to the first possible ID
  return possibleIds[0] || cost.itemId;
};

/**
 * Check if player has sufficient resources for the given costs
 * @param player - Player object
 * @param costs - Array of resource costs to check
 * @returns True if player can afford all costs, false otherwise
 */
export const checkResources = (player: Player, costs: ResourceCost[]): boolean => {
  if (!costs || costs.length === 0) {
    console.log('✅ ResourceManager: No costs to check');
    return true;
  }
  
  console.log(`🔍 ResourceManager: Checking ${costs.length} resource costs...`);
  
  for (const cost of costs) {
    const correctItemId = getCorrectItemId(cost, player);
    const playerHas = player.inventory[correctItemId] || 0;
    
    console.log(`  Checking: ${cost.quantity} ${cost.type || cost.itemId}`);
    console.log(`    Original ID: ${cost.itemId}`);
    console.log(`    Resolved ID: ${correctItemId}`);
    console.log(`    Player has: ${playerHas}`);
    console.log(`    Needs: ${cost.quantity}`);
    
    if (playerHas < cost.quantity) {
      console.log(`    ❌ INSUFFICIENT: Need ${cost.quantity - playerHas} more`);
      return false;
    } else {
      console.log(`    ✅ SUFFICIENT`);
    }
  }
  
  console.log('✅ ResourceManager: All resource checks passed');
  return true;
};

/**
 * Deduct resources from player inventory
 * @param player - Player object
 * @param costs - Array of resource costs to deduct
 * @returns Object with success status and updated player (if successful)
 */
export const deductResources = (player: Player, costs: ResourceCost[]): { success: boolean; updatedPlayer?: Player; error?: string } => {
  if (!costs || costs.length === 0) {
    console.log('✅ ResourceManager: No costs to deduct');
    return { success: true, updatedPlayer: player };
  }
  
  console.log(`💰 ResourceManager: Deducting ${costs.length} resource costs...`);
  
  // First, check if we can afford everything
  if (!checkResources(player, costs)) {
    console.log('❌ ResourceManager: Cannot afford resources, deduction failed');
    return { success: false, error: 'Insufficient resources' };
  }
  
  // Create a copy of the player's inventory
  const updatedInventory = { ...player.inventory };
  
  // Deduct each cost
  for (const cost of costs) {
    const correctItemId = getCorrectItemId(cost, player);
    const currentAmount = updatedInventory[correctItemId] || 0;
    const newAmount = currentAmount - cost.quantity;
    
    console.log(`  Deducting: ${cost.quantity} ${cost.type || cost.itemId}`);
    console.log(`    From ID: ${correctItemId}`);
    console.log(`    Before: ${currentAmount}`);
    console.log(`    After: ${newAmount}`);
    
    if (newAmount < 0) {
      console.log(`    ❌ DEDUCTION FAILED: Would result in negative amount`);
      return { success: false, error: `Insufficient ${cost.type || cost.itemId}` };
    }
    
    updatedInventory[correctItemId] = newAmount;
    console.log(`    ✅ DEDUCTION OK`);
  }
  
  console.log('✅ ResourceManager: All resource deductions completed successfully');
  
  return {
    success: true,
    updatedPlayer: {
      ...player,
      inventory: updatedInventory
    }
  };
};

/**
 * Add resources to player inventory
 * @param player - Player object
 * @param resources - Array of resources to add
 * @returns Updated player object
 */
export const addResources = (player: Player, resources: ResourceCost[]): Player => {
  const newInventory = { ...player.inventory };
  resources.forEach(resource => {
    newInventory[resource.itemId] = (newInventory[resource.itemId] || 0) + resource.quantity;
  });
  
  return {
    ...player,
    inventory: newInventory
  };
};

/**
 * Get total quantity of a specific resource in player inventory
 * @param player - Player object
 * @param itemId - ID of the resource item
 * @returns Quantity of the resource
 */
export const getResourceQuantity = (player: Player, itemId: string): number => {
  return player.inventory[itemId] || 0;
};

/**
 * Check if player can afford a specific resource cost
 * @param player - Player object
 * @param itemId - ID of the resource item
 * @param quantity - Required quantity
 * @returns True if player has enough of the resource
 */
export const canAffordResource = (player: Player, itemId: string, quantity: number): boolean => {
  return getResourceQuantity(player, itemId) >= quantity;
};

/**
 * Calculate total cost of multiple resource requirements
 * @param costs - Array of resource costs
 * @returns Object mapping item IDs to total quantities needed
 */
export const calculateTotalCosts = (costs: ResourceCost[]): Record<string, number> => {
  const totalCosts: Record<string, number> = {};
  costs.forEach(cost => {
    totalCosts[cost.itemId] = (totalCosts[cost.itemId] || 0) + cost.quantity;
  });
  return totalCosts;
};

/**
 * Get the display name of a resource by its ID
 * @param itemId - ID of the resource item
 * @returns Display name of the resource or the itemId if not found
 */
export const getResourceNameById = (itemId: string): string => {
  const resourceDef = MASTER_ITEM_DEFINITIONS[itemId];
  return resourceDef ? resourceDef.name : itemId;
};

/**
 * Get a random resource from available resource types
 * @returns Random resource object with id and name, or null if none available
 */
export const getRandomResource = (): { id: string; name: string } | null => {
  const resourceIds = Object.keys(MASTER_ITEM_DEFINITIONS).filter(id => 
    MASTER_ITEM_DEFINITIONS[id].itemType === 'Resource'
  );
  
  if (resourceIds.length === 0) return null;
  
  const randomId = resourceIds[Math.floor(Math.random() * resourceIds.length)];
  const resourceDef = MASTER_ITEM_DEFINITIONS[randomId];
  
  return {
    id: randomId,
    name: resourceDef.name
  };
};

/**
 * Resource Manager utility functions
 */
export const ResourceManagerUtils = {
  checkResources,
  deductResources,
  addResources,
  getResourceQuantity,
  canAffordResource,
  calculateTotalCosts,
  getResourceNameById,
  getRandomResource,
}; 